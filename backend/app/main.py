from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from typing import List, Optional
from . import models, schemas, crud, database, auth
import uvicorn
from datetime import datetime
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
import os
from dotenv import load_dotenv
from fastapi.middleware.gzip import GZipMiddleware
from .notifications import manager
from .payment import payment_manager
import shutil
import uuid
import logging
from pydantic import BaseModel
from app.database import Base, engine

# Load environment variables
load_dotenv()

# Initialize database
from app.database import Base, engine
Base.metadata.create_all(bind=engine)
database.init_db()

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

app = FastAPI(
    title="E-commerce API",
    description="A simple e-commerce API built with FastAPI",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS with more specific settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Add GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="E-commerce API",
        version="1.0.0",
        description="A simple e-commerce API built with FastAPI",
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Custom Swagger UI
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="E-commerce API Documentation",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
    )

@app.on_event("startup")
async def startup():
    # Create admin user if it doesn't exist
    db = database.SessionLocal()
    try:
        crud.create_admin_user(db)
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/auth/register", response_model=schemas.Token)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        print("Received user data:", user.dict())
        db_user = crud.get_user_by_email(db, email=user.email)
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        db_user = crud.create_user(db=db, user=user)
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": db_user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "user": db_user}
    except Exception as e:
        print("Error in register_user:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    try:
        print("Login attempt for user:", user.username)
        print("User data:", user.dict())
        authenticated_user = crud.login_user(db, user)
        print("User authenticated successfully:", authenticated_user.username)
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": authenticated_user.username}, expires_delta=access_token_expires
        )
        print("Access token created successfully")
        return {"access_token": access_token, "token_type": "bearer", "user": authenticated_user}
    except HTTPException as e:
        print("HTTP Exception in login:", str(e))
        raise
    except Exception as e:
        print("Unexpected error in login:", str(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auth/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user

@app.get("/api/products", response_model=schemas.ProductList)
def read_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    try:
        result = crud.get_products(
            db,
            search=search,
            category=category,
            min_price=min_price,
            max_price=max_price,
            sort_by=sort_by,
            sort_order=sort_order,
            skip=skip,
            limit=limit
        )
        return result
    except Exception as e:
        logger.error(f"Error in read_products endpoint: {str(e)}")
        return {"items": [], "total": 0}

@app.get("/api/products/categories", response_model=schemas.CategoriesResponse)
async def get_categories(db: Session = Depends(get_db)):
    categories = crud.get_categories(db)
    return {"categories": categories}

@app.get("/api/products/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    try:
        db_product = crud.get_product(db, product_id=product_id)
        if db_product is None:
            raise HTTPException(status_code=404, detail="Product not found")
        return db_product
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products/featured", response_model=List[schemas.Product])
def read_featured_products(db: Session = Depends(get_db)):
    try:
        products = crud.get_featured_products(db)
        if not products:
            return []
        return products
    except Exception as e:
        print(f"Error in getting featured products: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error in getting featured products: {str(e)}"
        )

@app.get("/api/cart", response_model=List[schemas.CartItem])
def read_cart_items(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        cart_items = crud.get_cart_items(db, user_id=current_user.id)
        return cart_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cart", response_model=schemas.CartItem)
def create_cart_item(
    cart_item: schemas.CartItemCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        return crud.create_cart_item(db=db, cart_item=cart_item, user_id=current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/cart/{cart_item_id}")
def update_cart_item(
    cart_item_id: int,
    quantity: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        cart_item = crud.update_cart_item_quantity(db, cart_item_id, quantity, current_user.id)
        if cart_item is None:
            raise HTTPException(status_code=404, detail="Cart item not found")
        return cart_item
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/cart/{cart_item_id}")
def delete_cart_item(
    cart_item_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        cart_item = crud.delete_cart_item(db, cart_item_id, current_user.id)
        if cart_item is None:
            raise HTTPException(status_code=404, detail="Cart item not found")
        return {"message": "Cart item deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/orders", response_model=List[schemas.Order])
def read_orders(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        orders = crud.get_orders(db, user_id=current_user.id)
        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

@app.post("/api/orders", response_model=schemas.Order)
async def create_order(
    order: schemas.OrderCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        # Calculate total from cart items
        cart_items = crud.get_cart_items(db, user_id=current_user.id)
        total = sum(item.product.price * item.quantity for item in cart_items)
        
        # Create payment intent
        payment_intent = await payment_manager.create_payment_intent(
            amount=int(total * 100)  # Convert to cents
        )
        
        # Create order items from cart items
        order_items = [
            schemas.OrderItemCreate(
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.product.price
            )
            for item in cart_items
        ]
        
        # Create order
        order_data = schemas.OrderCreate(
            total=total,
            status="pending",
            items=order_items,
            payment_intent_id=payment_intent["payment_intent_id"]
        )
        
        # Create order and clear cart
        created_order = crud.create_order(db, order_data, current_user.id)
        
        # Send notification
        await manager.send_order_notification(
            current_user.id,
            created_order.id,
            "pending"
        )
        
        return {
            "order": created_order,
            "client_secret": payment_intent["client_secret"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/orders/{order_id}/confirm")
async def confirm_order(
    order_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        order = crud.get_order(db, order_id, current_user.id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Confirm payment
        payment_confirmed = await payment_manager.confirm_payment(order.payment_intent_id)
        if not payment_confirmed:
            raise HTTPException(status_code=400, detail="Payment not confirmed")
        
        # Update order status
        order.status = "confirmed"
        db.commit()
        
        # Send notification
        await manager.send_order_notification(
            current_user.id,
            order.id,
            "confirmed"
        )
        
        return {"message": "Order confirmed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin routes
@app.get("/api/admin/users", response_model=List[schemas.User])
def get_all_users(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_users(db)

@app.delete("/api/admin/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.delete_user(db, user_id)

@app.post("/api/admin/products", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        return crud.create_product(db=db, product=product)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/admin/products/{product_id}", response_model=schemas.Product)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.update_product(db, product_id, product)

@app.delete("/api/admin/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.delete_product(db, product_id)

@app.post("/api/admin/categories")
def create_category(
    category: schemas.CategoryCreate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        return crud.create_category(db, category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/categories/{category}")
def delete_category(
    category: str,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        return crud.delete_category(db, category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/categories", response_model=List[schemas.Category])
def get_admin_categories(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    try:
        categories = db.query(models.Category).all()
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    try:
        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join("uploads", filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the URL of the uploaded file
        return {"url": f"/uploads/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        file.file.close()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/api/test")
def test_endpoint():
    logger.info("Test endpoint called")
    return {"message": "API is working!", "status": "success"}

@app.get("/api/categories", response_model=schemas.CategoryList)
def get_categories_list(db: Session = Depends(get_db)):
    try:
        categories = db.query(models.Category).all()
        return {"items": categories, "total": len(categories)}
    except Exception as e:
        logger.error(f"Error in get_categories_list: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Run the app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
