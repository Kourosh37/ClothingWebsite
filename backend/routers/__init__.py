from .auth import router as auth_router
from .products import router as products_router
from .cart import router as cart_router
from .orders import router as orders_router
from .shop_settings import router as shop_settings_router

__all__ = [
    "auth_router",
    "products_router",
    "cart_router",
    "orders_router",
    "shop_settings_router"
]
