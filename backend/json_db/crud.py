from typing import Optional
from datetime import datetime
from .base import JsonDB

class ShopSettingsManager:
    def __init__(self):
        self.db = JsonDB()
        self.collection = "shop_settings"
    
    def get_settings(self) -> dict:
        settings = self.db.read(self.collection)
        if not settings:
            # Create default settings
            settings = {
                "shop_name": "فروشگاه من",
                "shop_description": "توضیحات فروشگاه",
                "shop_address": "آدرس فروشگاه",
                "shop_phone": "شماره تماس",
                "shop_email": "ایمیل فروشگاه",
                "shop_logo": "",
                "shop_header_image": "",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            self.db.write(self.collection, settings)
        return settings
    
    def update_settings(self, update_data: dict) -> dict:
        settings = self.get_settings()
        settings.update(update_data)
        settings["updated_at"] = datetime.utcnow().isoformat()
        self.db.write(self.collection, settings)
        return settings
