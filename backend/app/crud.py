from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, UploadFile
from . import models, schemas, auth
from typing import List, Optional
import os
import logging
import uuid
import shutil

logger = logging.getLogger(__name__)

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_admin=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_admin_user(db: Session):
    # Check if admin user already exists
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin:
        # Create admin user
        admin = models.User(
            username="admin",
            hashed_password=auth.get_password_hash("admin123"),
            is_admin=True,
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    return admin

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
):
    try:
        query = db.query(models.Product)
        
        if category:
            query = query.filter(models.Product.category == category)
        
        if search:
            search_filter = or_(
                models.Product.name.ilike(f"%{search}%"),
                models.Product.description.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        if min_price is not None:
            query = query.filter(models.Product.price >= min_price)
        
        if max_price is not None:
            query = query.filter(models.Product.price <= max_price)
        
        if sort_by:
            if sort_order.lower() == "desc":
                query = query.order_by(getattr(models.Product, sort_by).desc())
            else:
                query = query.order_by(getattr(models.Product, sort_by).asc())
        
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        
        return {"items": items, "total": total}
    except Exception as e:
        logger.error(f"Error in get_products: {str(e)}")
        return {"items": [], "total": 0}

def get_products_count(
    db: Session,
    category: Optional[str] = None,
    search: Optional[str] = None
):
    query = db.query(models.Product)
    
    if category:
        query = query.filter(models.Product.category == category)
    
    if search:
        search_filter = or_(
            models.Product.name.ilike(f"%{search}%"),
            models.Product.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    return query.count()

def create_product(db: Session, product: schemas.ProductCreate):
    try:
        # Check if category exists
        category = db.query(models.Category).filter(models.Category.id == product.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="دسته‌بندی یافت نشد")
        
        # Create product
        db_product = models.Product(**product.dict())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_product: {str(e)}")
        raise HTTPException(status_code=400, detail="خطا در ایجاد محصول")

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    try:
        db_product = get_product(db, product_id)
        if not db_product:
            raise HTTPException(status_code=404, detail="محصول یافت نشد")
        
        # Check if category exists if it's being updated
        if product.category_id:
            category = db.query(models.Category).filter(models.Category.id == product.category_id).first()
            if not category:
                raise HTTPException(status_code=400, detail="دسته‌بندی یافت نشد")
        
        old_image = db_product.image
        
        for key, value in product.dict(exclude_unset=True).items():
            setattr(db_product, key, value)
        
        if old_image and old_image != db_product.image:
            try:
                os.remove(f"uploads/{old_image}")
            except:
                pass
        
        db.commit()
        db.refresh(db_product)
        return db_product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_product: {str(e)}")
        raise HTTPException(status_code=400, detail="خطا در بروزرسانی محصول")

def delete_product(db: Session, product_id: int):
    try:
        db_product = get_product(db, product_id)
        if not db_product:
            raise HTTPException(status_code=404, detail="محصول یافت نشد")
        
        if db_product.image:
            try:
                os.remove(f"uploads/{db_product.image}")
            except:
                pass
        
        db.delete(db_product)
        db.commit()
        return {"message": "محصول با موفقیت حذف شد"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_product: {str(e)}")
        raise HTTPException(status_code=400, detail="خطا در حذف محصول")

def get_categories(db: Session) -> List[str]:
    try:
        categories = db.query(models.Category.name).all()
        if not categories:
            return []
        return [str(category[0]) for category in categories if category[0] is not None]
    except Exception as e:
        logger.error(f"Error in get_categories: {str(e)}")
        return []

def get_admin_categories(db: Session):
    try:
        categories = db.query(models.Category).all()
        return categories
    except Exception as e:
        logger.error(f"Error in get_admin_categories: {str(e)}")
        raise HTTPException(status_code=400, detail="خطا در دریافت لیست دسته‌بندی‌ها")

def create_category(db: Session, category: schemas.CategoryCreate):
    try:
        db_category = models.Category(**category.dict())
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category
    except Exception as e:
        logger.error(f"Error in create_category: {str(e)}")
        raise HTTPException(status_code=400, detail="خطا در ایجاد دسته‌بندی")

def delete_category(db: Session, category_name: str):
    try:
        db_category = db.query(models.Category).filter(models.Category.name == category_name).first()
        if not db_category:
            raise HTTPException(status_code=404, detail="دسته‌بندی یافت نشد")
        
        # Check if category has products
        products_count = db.query(models.Product).filter(models.Product.category_id == db_category.id).count()
        if products_count > 0:
            raise HTTPException(status_code=400, detail="این دسته‌بندی دارای محصول است و نمی‌توان آن را حذف کرد")
        
        if db_category.image:
            try:
                os.remove(f"uploads/{db_category.image}")
            except:
                pass
        
        db.delete(db_category)
        db.commit()
        return {"message": "دسته‌بندی با موفقیت حذف شد"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in delete_category: {str(e)}")
        raise HTTPException(status_code=400, detail="خطا در حذف دسته‌بندی")

def upload_image(db: Session, file: UploadFile):
    try:
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Save file
        file_path = f"uploads/{filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {"filename": filename}
    except Exception as e:
        logger.error(f"Error in upload_image: {str(e)}")
        raise HTTPException(status_code=400, detail="خطا در آپلود تصویر")

def get_cart_items(db: Session, user_id: int):
    return db.query(models.CartItem).filter(models.CartItem.user_id == user_id).all()

def add_to_cart(db: Session, cart_item: schemas.CartItemCreate, user_id: int):
    db_product = get_product(db, cart_item.product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="محصول یافت نشد")
    
    if db_product.stock < cart_item.quantity:
        raise HTTPException(status_code=400, detail="موجودی کافی نیست")
    
    existing_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == user_id,
        models.CartItem.product_id == cart_item.product_id
    ).first()
    
    if existing_item:
        existing_item.quantity += cart_item.quantity
        if existing_item.quantity > db_product.stock:
            raise HTTPException(status_code=400, detail="موجودی کافی نیست")
    else:
        db_cart_item = models.CartItem(
            user_id=user_id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity
        )
        db.add(db_cart_item)
    
    db.commit()
    return {"message": "محصول با موفقیت به سبد خرید اضافه شد"}

def remove_from_cart(db: Session, item_id: int, user_id: int):
    db_cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == user_id
    ).first()
    
    if not db_cart_item:
        raise HTTPException(status_code=404, detail="آیتم در سبد خرید یافت نشد")
    
    db.delete(db_cart_item)
    db.commit()
    return db_cart_item

def update_cart_item(db: Session, item_id: int, cart_item: schemas.CartItemUpdate, user_id: int):
    db_cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == user_id
    ).first()
    
    if not db_cart_item:
        raise HTTPException(status_code=404, detail="آیتم در سبد خرید یافت نشد")
    
    db_product = get_product(db, db_cart_item.product_id)
    if db_product.stock < cart_item.quantity:
        raise HTTPException(status_code=400, detail="موجودی کافی نیست")
    
    db_cart_item.quantity = cart_item.quantity
    db.commit()
    db.refresh(db_cart_item)
    return db_cart_item

def create_order(db: Session, user_id: int):
    cart_items = get_cart_items(db, user_id)
    if not cart_items:
        raise HTTPException(status_code=400, detail="سبد خرید خالی است")
    
    total_price = 0
    order_items = []
    
    for cart_item in cart_items:
        product = get_product(db, cart_item.product_id)
        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"موجودی محصول {product.name} کافی نیست"
            )
        
        total_price += product.price * cart_item.quantity
        order_items.append({
            "product_id": product.id,
            "quantity": cart_item.quantity,
            "price": product.price
        })
        
        product.stock -= cart_item.quantity
    
    db_order = models.Order(
        user_id=user_id,
        total_price=total_price,
        status="در انتظار پرداخت"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    for item in order_items:
        db_order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item["product_id"],
            quantity=item["quantity"],
            price=item["price"]
        )
        db.add(db_order_item)
    
    for cart_item in cart_items:
        db.delete(cart_item)
    
    db.commit()
    return db_order

def get_orders(db: Session, user_id: int):
    return db.query(models.Order).filter(models.Order.user_id == user_id).all()

def get_all_orders(db: Session):
    try:
        orders = db.query(models.Order).all()
        return orders
    except Exception as e:
        logger.error(f"Error in get_all_orders: {str(e)}")
        raise HTTPException(status_code=400, detail="خطا در دریافت لیست سفارشات")

def update_order_status(db: Session, order_id: int, status: str):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="سفارش یافت نشد")
    
    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order

def login_user(db: Session, user: schemas.UserLogin):
    try:
        print("Looking for user:", user.username)
        db_user = get_user_by_username(db, username=user.username)
        if not db_user:
            print("User not found")
            raise HTTPException(status_code=400, detail="نام کاربری یا رمز عبور اشتباه است")
        print("User found, verifying password")
        if not auth.verify_password(user.password, db_user.hashed_password):
            print("Invalid password")
            raise HTTPException(status_code=400, detail="نام کاربری یا رمز عبور اشتباه است")
        print("Password verified successfully")
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        print("Error in login_user:", str(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
