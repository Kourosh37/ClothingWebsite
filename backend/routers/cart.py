from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from datetime import datetime
from json_db.base import JsonDB
import schemas
from .auth import get_current_user

router = APIRouter()
db = JsonDB()

def get_product(product_id: str):
    products = db.read("products")
    if product_id not in products:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return products[product_id]

def calculate_cart_total(items: List[dict]) -> float:
    total = 0
    for item in items:
        product = get_product(item["product_id"])
        total += product["price"] * item["quantity"]
    return total

@router.get("", response_model=schemas.Cart)
async def get_cart(current_user: dict = Depends(get_current_user)):
    carts = db.read("carts")
    cart = carts.get(current_user["email"], {"items": [], "total": 0})
    return cart

@router.post("/items", response_model=schemas.Cart)
async def add_to_cart(
    item: schemas.CartItem,
    current_user: dict = Depends(get_current_user)
):
    # Verify product exists and has enough stock
    product = get_product(item.product_id)
    if product["stock"] < item.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough stock"
        )
    
    carts = db.read("carts")
    cart = carts.get(current_user["email"], {"items": []})
    
    # Check if product already in cart
    for cart_item in cart["items"]:
        if cart_item["product_id"] == item.product_id:
            cart_item["quantity"] += item.quantity
            break
    else:
        cart["items"].append(item.dict())
    
    # Calculate total
    cart["total"] = calculate_cart_total(cart["items"])
    
    carts[current_user["email"]] = cart
    db.write("carts", carts)
    return cart

@router.put("/items/{product_id}", response_model=schemas.Cart)
async def update_cart_item(
    product_id: str,
    quantity: int,
    current_user: dict = Depends(get_current_user)
):
    # Verify product exists and has enough stock
    product = get_product(product_id)
    if product["stock"] < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough stock"
        )
    
    carts = db.read("carts")
    cart = carts.get(current_user["email"], {"items": []})
    
    # Update quantity
    for item in cart["items"]:
        if item["product_id"] == product_id:
            item["quantity"] = quantity
            break
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found in cart"
        )
    
    # Calculate total
    cart["total"] = calculate_cart_total(cart["items"])
    
    carts[current_user["email"]] = cart
    db.write("carts", carts)
    return cart

@router.delete("/items/{product_id}", response_model=schemas.Cart)
async def remove_from_cart(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    carts = db.read("carts")
    cart = carts.get(current_user["email"], {"items": []})
    
    # Remove item
    cart["items"] = [item for item in cart["items"] if item["product_id"] != product_id]
    
    # Calculate total
    cart["total"] = calculate_cart_total(cart["items"])
    
    carts[current_user["email"]] = cart
    db.write("carts", carts)
    return cart

@router.delete("", response_model=schemas.Cart)
async def clear_cart(current_user: dict = Depends(get_current_user)):
    carts = db.read("carts")
    carts[current_user["email"]] = {"items": [], "total": 0}
    db.write("carts", carts)
    return carts[current_user["email"]]
