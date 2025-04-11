from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from typing import List, Optional
from datetime import datetime
import shutil
import os
from json_db.base import JsonDB
from schemas import (
    Product, ProductCreate, ProductUpdate, ProductResponse, 
    ProductFilter, Category, CategoryCreate
)
from .auth import get_current_user

router = APIRouter()
db = JsonDB()

@router.get("", response_model=ProductResponse)
async def get_products(
    filters: ProductFilter = Depends()
):
    products = db.read("products")
    result = list(products.values())
    
    if filters.category:
        result = [p for p in result if p["category"] == filters.category]
    if filters.search:
        search = filters.search.lower()
        result = [p for p in result if search in p["name"].lower() or search in p["description"].lower()]
    
    total = len(result)
    
    if filters.sort_by:
        reverse = False
        if filters.sort_by == "price_desc":
            key = "price"
            reverse = True
        elif filters.sort_by == "price_asc":
            key = "price"
        elif filters.sort_by == "newest":
            key = "created_at"
            reverse = True
        result.sort(key=lambda x: x[key], reverse=reverse)
    
    start = (filters.page - 1) * filters.limit
    end = start + filters.limit
    result = result[start:end]
    
    return {
        "items": result,
        "total": total,
        "page": filters.page,
        "total_pages": (total + filters.limit - 1) // filters.limit
    }

@router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = db.read("categories")
    return list(categories.values())

@router.post("/categories", response_model=Category)
async def create_category(
    category: CategoryCreate,
    current_user: dict = Depends(get_current_user)
):
    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    categories = db.read("categories")
    category_id = str(len(categories) + 1)
    now = datetime.utcnow().isoformat()
    
    category_data = {
        **category.dict(),
        "id": category_id,
        "created_at": now,
        "updated_at": now
    }
    
    categories[category_id] = category_data
    db.write("categories", categories)
    return category_data

@router.get("/new-arrivals", response_model=List[Product])
async def get_new_arrivals():
    products = db.read("products")
    result = list(products.values())
    # Sort by created_at descending and get top 8
    result.sort(key=lambda x: x["created_at"], reverse=True)
    return result[:8]

@router.get("/featured", response_model=List[Product])
async def get_featured_products():
    products = db.read("products")
    result = list(products.values())
    # For now, just return first 8 products
    return result[:8]

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    products = db.read("products")
    if product_id not in products:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return products[product_id]

@router.post("", response_model=Product)
async def create_product(
    product: ProductCreate,
    current_user: dict = Depends(get_current_user)
):
    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    products = db.read("products")
    product_id = str(len(products) + 1)
    now = datetime.utcnow().isoformat()
    
    product_data = {
        **product.dict(),
        "id": product_id,
        "created_at": now,
        "updated_at": now
    }
    
    products[product_id] = product_data
    db.write("products", products)
    return product_data

@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product: ProductUpdate,
    current_user: dict = Depends(get_current_user)
):
    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    products = db.read("products")
    if product_id not in products:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    update_data = product.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    products[product_id].update(update_data)
    db.write("products", products)
    return products[product_id]

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    products = db.read("products")
    if product_id not in products:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    del products[product_id]
    db.write("products", products)
    return {"message": "Product deleted successfully"}

@router.post("/{product_id}/images")
async def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    products = db.read("products")
    if product_id not in products:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Create unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{product_id}_{timestamp}_{file.filename}"
    file_path = f"static/uploads/products/{filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update product images
    if "images" not in products[product_id]:
        products[product_id]["images"] = []
    products[product_id]["images"].append(f"/{file_path}")
    products[product_id]["updated_at"] = datetime.utcnow().isoformat()
    
    db.write("products", products)
    return {"url": f"/{file_path}"}
