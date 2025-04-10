from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class CategoriesResponse(BaseModel):
    categories: List[str]

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

class Category(BaseModel):
    id: int
    name: str
    image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category_id: int
    stock: int

class ProductCreate(ProductBase):
    image: Optional[str] = None

class ProductUpdate(ProductBase):
    image: Optional[str] = None

class Product(ProductBase):
    id: int
    image: Optional[str]
    created_at: datetime
    category: Optional[Category] = None

    class Config:
        from_attributes = True

class ProductList(BaseModel):
    items: List[Product]
    total: int

class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItem(CartItemBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    total_price: float
    status: str

class OrderCreate(OrderBase):
    items: List[OrderItemBase]

class Order(OrderBase):
    id: int
    user_id: int
    created_at: datetime
    items: List[OrderItem]

    class Config:
        from_attributes = True

class ProductFilter(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "asc"
    skip: int = 0
    limit: int = 100

class CategoryList(BaseModel):
    items: List[Category]
    total: int

class CategoryCreate(BaseModel):
    name: str
    image: Optional[str] = None
