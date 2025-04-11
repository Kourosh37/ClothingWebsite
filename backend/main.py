from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_router, products_router, cart_router, orders_router, shop_settings_router
import os
from dotenv import load_dotenv
from datetime import datetime
from passlib.context import CryptContext
from json_db.base import JsonDB

load_dotenv()

app = FastAPI()

# CORS middleware setup
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Static files setup
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(products_router, prefix="/api/products", tags=["products"])
app.include_router(cart_router, prefix="/api/cart", tags=["cart"])
app.include_router(orders_router, prefix="/api/orders", tags=["orders"])
app.include_router(shop_settings_router, prefix="/api/shop-settings", tags=["shop_settings"])

# Ensure required directories exist
[os.makedirs(d, exist_ok=True) for d in [
    "static/uploads/products",
    "static/uploads/logos",
    "static/uploads/headers",
    "data",
    "static/uploads/avatars"
]]

# Create empty JSON files if they don't exist
for file in ["users", "products", "orders", "carts", "shop_settings"]:
    path = f"data/{file}.json"
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            f.write("{}")

if not os.path.exists("data/categories.json"):
    with open("data/categories.json", "w", encoding="utf-8") as f:
        f.write("{}")

@app.get("/")
async def root():
    return {"message": "API is running"}

def add_admin_user():
    users = db.read("users")
    admin_data = {
        "username": os.getenv("ADMIN_USERNAME"),
        "email": os.getenv("ADMIN_EMAIL"),
        "password": pwd_context.hash(os.getenv("ADMIN_PASSWORD")),
        "is_admin": True,
        "created_at": datetime.utcnow().isoformat()
    }
    users[os.getenv("ADMIN_USERNAME")] = admin_data
    db.write("users", users)
    print("Admin user added successfully")
