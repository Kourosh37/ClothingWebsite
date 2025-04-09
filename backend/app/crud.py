from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException
from . import models, schemas, auth
from typing import List, Optional
import os

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100,
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
    
    return query.offset(skip).limit(limit).all()

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
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="محصول یافت نشد")
    
    old_image = db_product.image
    
    for key, value in product.dict(exclude_unset=True).items():
        setattr(db_product, key, value)
    
    if old_image and old_image != db_product.image:
        try:
            os.remove(f"app/{old_image}")
        except:
            pass
    
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="محصول یافت نشد")
    
    if db_product.image:
        try:
            os.remove(f"app/{db_product.image}")
        except:
            pass
    
    db.delete(db_product)
    db.commit()
    return db_product

def get_categories(db: Session):
    products = db.query(models.Product.category).distinct().all()
    return [category[0] for category in products if category[0]]

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
    return db.query(models.Order).all()

def update_order_status(db: Session, order_id: int, status: str):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="سفارش یافت نشد")
    
    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order
