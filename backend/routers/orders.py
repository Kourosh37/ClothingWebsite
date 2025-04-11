from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from datetime import datetime
from json_db.base import JsonDB
import schemas
from .auth import get_current_user
from .cart import calculate_cart_total

router = APIRouter()
db = JsonDB()

@router.get("", response_model=List[schemas.Order])
async def get_orders(
    current_user: dict = Depends(get_current_user),
    status: Optional[str] = None
):
    orders = db.read("orders")
    user_orders = [
        order for order in orders.values()
        if order["user_id"] == current_user["email"]
    ]
    
    if status:
        user_orders = [order for order in user_orders if order["status"] == status]
    
    return sorted(user_orders, key=lambda x: x["created_at"], reverse=True)

@router.get("/{order_id}", response_model=schemas.Order)
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    orders = db.read("orders")
    if order_id not in orders:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order = orders[order_id]
    if order["user_id"] != current_user["email"] and not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    return order

@router.post("", response_model=schemas.Order)
async def create_order(
    order: schemas.OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    # Verify cart is not empty
    if not order.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Calculate total
    total = calculate_cart_total(order.items)
    
    # Create order
    orders = db.read("orders")
    order_id = str(len(orders) + 1)
    now = datetime.utcnow().isoformat()
    
    order_data = {
        "id": order_id,
        "user_id": current_user["email"],
        "items": [item.dict() for item in order.items],
        "total": total,
        "status": "pending",
        "shipping_address": order.shipping_address,
        "payment_method": order.payment_method,
        "created_at": now,
        "updated_at": now
    }
    
    # Update product stock
    products = db.read("products")
    for item in order.items:
        product = products[item.product_id]
        if product["stock"] < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for product {product['name']}"
            )
        product["stock"] -= item.quantity
    
    # Save changes
    orders[order_id] = order_data
    db.write("orders", orders)
    db.write("products", products)
    
    # Clear cart
    carts = db.read("carts")
    carts[current_user["email"]] = {"items": [], "total": 0}
    db.write("carts", carts)
    
    return order_data

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    orders = db.read("orders")
    if order_id not in orders:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if status not in ["pending", "paid", "shipped", "delivered", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status"
        )
    
    orders[order_id]["status"] = status
    orders[order_id]["updated_at"] = datetime.utcnow().isoformat()
    db.write("orders", orders)
    
    return {"message": "Order status updated successfully"}

@router.put("/{order_id}", response_model=schemas.Order)
async def update_order(
    order_id: str,
    order_update: schemas.OrderUpdate,
    current_user: dict = Depends(get_current_user)
):
    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    orders = db.read("orders")
    if order_id not in orders:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    update_data = order_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    orders[order_id].update(update_data)
    db.write("orders", orders)
    return orders[order_id]
