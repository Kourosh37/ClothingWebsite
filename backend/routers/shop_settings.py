from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from datetime import datetime
import shutil
import os
from json_db.base import JsonDB
import schemas
from .auth import get_current_user

router = APIRouter()
db = JsonDB()

@router.get("", response_model=schemas.ShopSettings)
async def get_shop_settings():
    settings = db.read("shop_settings")
    if not settings:
        settings = {
            "shop_name": "فروشگاه من",
            "shop_description": "توضیحات فروشگاه",
            "shop_address": "",
            "shop_phone": "",
            "shop_email": "",
            "shop_logo": "",
            "shop_header_image": ""
        }
        db.write("shop_settings", settings)
    return settings

@router.put("", response_model=schemas.ShopSettings)
async def update_shop_settings(
    settings: schemas.ShopSettings,
    current_user: dict = Depends(get_current_user)
):
    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    current_settings = db.read("shop_settings") or {}
    updated_settings = {**current_settings, **settings.dict(exclude_unset=True)}
    db.write("shop_settings", updated_settings)
    return updated_settings

@router.post("/logo")
async def upload_logo(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"logo_{timestamp}_{file.filename}"
    file_path = f"static/uploads/logos/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    settings = db.read("shop_settings") or {}
    settings["shop_logo"] = f"/{file_path}"
    db.write("shop_settings", settings)
    
    return {"url": f"/{file_path}"}

@router.post("/header")
async def upload_header(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"header_{timestamp}_{file.filename}"
    file_path = f"static/uploads/headers/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    settings = db.read("shop_settings") or {}
    settings["shop_header_image"] = f"/{file_path}"
    db.write("shop_settings", settings)
    
    return {"url": f"/{file_path}"}
