from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserBase(BaseModel):
    username: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=6)

class UserCreate(UserBase):
    pass

class UserLogin(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)

class User(BaseModel):
    username: str
    email: str
    is_admin: bool = False
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: 'User'

class ProductBase(BaseModel):
    name: str = Field(min_length=3)
    description: str
    price: float = Field(gt=0)
    category: str
    stock: int = Field(ge=0)
    
class ProductCreate(ProductBase):
    image: Optional[str] = None

class Product(ProductBase):
    id: str
    image: str
    images: List[str] = []
    created_at: str
    updated_at: str

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)

class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)

class Cart(BaseModel):
    items: List[CartItem] = []
    total: float = Field(default=0, ge=0)

class OrderStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

class OrderItem(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)
    price: float = Field(gt=0)

class OrderCreate(BaseModel):
    items: List[CartItem]
    shipping_address: str
    payment_method: str

class Order(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    total: float = Field(gt=0)
    status: OrderStatus = OrderStatus.pending
    shipping_address: str
    payment_method: str
    created_at: str
    updated_at: str

class ShopSettingsBase(BaseModel):
    shop_name: Optional[str] = Field(None, min_length=2)
    shop_description: Optional[str] = None
    shop_address: Optional[str] = None
    shop_phone: Optional[str] = None
    shop_email: Optional[EmailStr] = None
    shop_logo: Optional[str] = None
    shop_header_image: Optional[str] = None

class ShopSettingsUpdate(ShopSettingsBase):
    pass

class ShopSettings(ShopSettingsBase):
    created_at: str
    updated_at: str

class ProductFilter(BaseModel):
    category: Optional[str] = None
    search: Optional[str] = None
    sort_by: Optional[str] = Field(None, pattern="^(price_desc|price_asc|newest)$")
    page: Optional[int] = Field(default=1, gt=0)
    limit: Optional[int] = Field(default=10, gt=0)

class ProductResponse(BaseModel):
    items: List[Product]
    total: int
    page: int
    total_pages: int

class CategoryBase(BaseModel):
    name: str = Field(min_length=2)
    slug: str = Field(min_length=2)
    description: Optional[str] = None
    image: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: str
    created_at: str
    updated_at: str

class PaymentMethod(str, Enum):
    cash = "cash"
    card = "card"
    online = "online"

class OrderCreate(BaseModel):
    items: List[CartItem]
    shipping_address: str
    payment_method: PaymentMethod
    shipping_method: str
    phone: str
    notes: Optional[str] = None

class OrderUpdate(BaseModel):
    status: OrderStatus
    tracking_code: Optional[str] = None
    admin_notes: Optional[str] = None

class Order(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    total: float = Field(gt=0)
    status: OrderStatus = OrderStatus.pending
    shipping_address: str
    payment_method: PaymentMethod
    shipping_method: str
    phone: str
    notes: Optional[str] = None
    tracking_code: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: str
    updated_at: str

class UserProfile(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    addresses: List[str] = []
    avatar: Optional[str] = None

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    addresses: Optional[List[str]] = None
    avatar: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6)

class AdminUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=2)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    old_password: str



