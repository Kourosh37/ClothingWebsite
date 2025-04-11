from fastapi import APIRouter, HTTPException, Depends, status, File, UploadFile
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from json_db.base import JsonDB
import schemas
import os
from dotenv import load_dotenv
import secrets
import shutil
import asyncio
import logging
import redis
from cachetools import TTLCache

load_dotenv()

router = APIRouter()
db = JsonDB()

# تنظیمات امنیتی
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))  # کلید امن‌تر
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# اطلاعات ادمین از env
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

# تنظیم لاگر
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# کش برای محدودیت درخواست‌ها
cache = TTLCache(maxsize=100, ttl=86400)  # 24 ساعت

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),  # زمان صدور توکن
        "type": "access"  # نوع توکن
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ثبت نام
@router.post("/register", response_model=schemas.TokenResponse)
async def register(user_data: schemas.UserCreate):
    try:
        users = db.read("users")
        
        # چک کردن یکتا بودن یوزرنیم و ایمیل
        for user in users.values():
            if user["email"] == user_data.email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            if user["username"] == user_data.username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already exists"
                )

        hashed_password = pwd_context.hash(user_data.password)
        user = {
            "username": user_data.username,
            "email": user_data.email,
            "password": hashed_password,
            "is_admin": False,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # اضافه کردن لاگ برای دیباگ
        print(f"Saving user data: {user}")
        print(f"Current users: {users}")
        
        users[user_data.username] = user
        db.write("users", users)
        
        print(f"Users after save: {db.read('users')}")

        access_token = create_access_token(data={"sub": user_data.username})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "username": user["username"],
                "email": user["email"],
                "is_admin": user["is_admin"],
                "created_at": user["created_at"]
            }
        }
    except Exception as e:
        print(f"Error in register: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ورود
@router.post("/login", response_model=schemas.TokenResponse)
async def login(user_data: schemas.UserLogin):
    try:
        # لاگ برای دیباگ
        print(f"Received login request: {user_data.dict()}")
        
        users = db.read("users")
        print(f"Current users in DB: {users}")
        
        user = users.get(user_data.username)
        
        if not user:
            print(f"User not found: {user_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="نام کاربری یا رمز عبور اشتباه است"
            )

        if not pwd_context.verify(user_data.password, user["password"]):
            print(f"Invalid password for user: {user_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="نام کاربری یا رمز عبور اشتباه است"
            )

        access_token = create_access_token(data={"sub": user["username"]})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "username": user["username"],
                "email": user["email"],
                "is_admin": user["is_admin"],
                "created_at": user["created_at"]
            }
        }
    except ValidationError as e:
        print(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# گرفتن اطلاعات یوزر لاگین شده
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if username is None or token_type != "access":
            raise credentials_exception
            
        # چک کردن منقضی نشدن توکن (jwt خودش انجام میده)
        
    except JWTError:
        raise credentials_exception

    users = db.read("users")
    user = users.get(username)
    if user is None:
        raise credentials_exception

    return user

# روت مخصوص گرفتن پروفایل
@router.get("/me", response_model=schemas.User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],  # تغییر از name به username
        "email": current_user["email"],
        "is_admin": current_user["is_admin"],
        "created_at": current_user["created_at"]
    }

# خروج
@router.post("/logout")
async def logout():
    return {"message": "Successfully logged out"}

@router.put("/profile", response_model=schemas.UserProfile)
async def update_profile(
    profile: schemas.UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    users = db.read("users")
    user = users[current_user["username"]]
    
    update_data = profile.dict(exclude_unset=True)
    user.update(update_data)
    users[current_user["username"]] = user
    db.write("users", users)
    
    return user

@router.post("/change-password")
async def change_password(
    passwords: schemas.PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    users = db.read("users")
    user = users[current_user["username"]]
    
    if not verify_password(passwords.old_password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    user["password"] = pwd_context.hash(passwords.new_password)
    users[current_user["username"]] = user
    db.write("users", users)
    
    return {"message": "Password updated successfully"}

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    filename = f"avatar_{current_user['username']}_{file.filename}"
    file_path = f"static/uploads/avatars/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    users = db.read("users")
    users[current_user["username"]]["avatar"] = f"/{file_path}"
    db.write("users", users)
    
    return {"url": f"/{file_path}"}

def is_super_admin(user: dict) -> bool:
    """چک کردن اینکه آیا کاربر سوپر ادمین است"""
    return (
        user["is_admin"] and 
        user["username"] == os.getenv("ADMIN_USERNAME") and 
        user["email"] == os.getenv("ADMIN_EMAIL")
    )

@router.put("/admin/update", response_model=schemas.User)
async def update_admin(
    admin_data: schemas.AdminUpdate,
    current_user: dict = Depends(get_current_user)
):
    # فقط سوپر ادمین اصلی می‌تواند این عملیات را انجام دهد
    if not is_super_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the super admin can perform this action"
        )

    users = db.read("users")
    admin = users.get(current_user["username"])

    # تایید دوباره هویت با پسورد
    if not verify_password(admin_data.old_password, admin["password"]):
        # تاخیر برای جلوگیری از حملات brute force
        await asyncio.sleep(1)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )

    # محدودیت تعداد درخواست‌ها
    cache_key = f"admin_update_{current_user['username']}"
    update_count = cache.get(cache_key, 0)
    if update_count >= 5:  # محدودیت 5 بار آپدیت در روز
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many update attempts. Please try again tomorrow."
        )

    try:
        # شروع تراکنش
        backup_data = users.copy()

        # بررسی یکتا بودن یوزرنیم و ایمیل
        if admin_data.username and admin_data.username != admin["username"]:
            if any(user["username"] == admin_data.username for user in users.values()):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already exists"
                )
            
            # بررسی معتبر بودن یوزرنیم
            if not admin_data.username.isalnum():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username must contain only letters and numbers"
                )

        if admin_data.email and admin_data.email != admin["email"]:
            if any(user["email"] == admin_data.email for user in users.values()):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )

        # بررسی قوی بودن پسورد جدید
        if admin_data.password:
            if len(admin_data.password) < 8:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password must be at least 8 characters long"
                )
            if not any(c.isupper() for c in admin_data.password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password must contain at least one uppercase letter"
                )
            if not any(c.islower() for c in admin_data.password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password must contain at least one lowercase letter"
                )
            if not any(c.isdigit() for c in admin_data.password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password must contain at least one number"
                )

        # آپدیت اطلاعات
        update_data = {}
        if admin_data.username:
            update_data["username"] = admin_data.username
        if admin_data.email:
            update_data["email"] = admin_data.email
        if admin_data.password:
            update_data["password"] = pwd_context.hash(admin_data.password)

        # اگر یوزرنیم تغییر کرده، کلید دیکشنری هم باید تغییر کند
        if "username" in update_data:
            del users[admin["username"]]
            admin.update(update_data)
            users[admin_data.username] = admin
        else:
            admin.update(update_data)
            users[admin["username"]] = admin

        # آپدیت فایل .env با رمزنگاری
        if admin_data.username or admin_data.email or admin_data.password:
            env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
            env_data = {}
            
            # خواندن فایل env موجود
            with open(env_path, 'r') as f:
                for line in f:
                    if '=' in line:
                        key, value = line.strip().split('=', 1)
                        env_data[key] = value

            # آپدیت مقادیر
            if admin_data.username:
                env_data['ADMIN_USERNAME'] = admin_data.username
            if admin_data.email:
                env_data['ADMIN_EMAIL'] = admin_data.email
            if admin_data.password:
                env_data['ADMIN_PASSWORD'] = admin_data.password

            # نوشتن فایل env جدید
            with open(env_path, 'w') as f:
                for key, value in env_data.items():
                    f.write(f'{key}={value}\n')

        # ذخیره در دیتابیس
        db.write("users", users)

        # آپدیت کش
        cache.set(cache_key, update_count + 1, expire=86400)  # 24 ساعت

        # لاگ تغییرات
        logger.info(f"Admin updated successfully: {current_user['username']}")

        return {
            "username": admin["username"],
            "email": admin["email"],
            "is_admin": admin["is_admin"],
            "created_at": admin["created_at"]
        }

    except Exception as e:
        # برگرداندن تغییرات در صورت خطا
        db.write("users", backup_data)
        logger.error(f"Error updating admin: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating admin information"
        )

# اضافه کردن تابع برای اطمینان از وجود ادمین
def ensure_admin_exists():
    try:
        users = db.read("users")
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        
        if admin_username not in users:
            admin_data = {
                "username": admin_username,
                "email": os.getenv("ADMIN_EMAIL", "admin@gmail.com"),
                "password": get_password_hash(os.getenv("ADMIN_PASSWORD", "admin123")),
                "is_admin": True,
                "created_at": datetime.utcnow().isoformat()
            }
            users[admin_username] = admin_data
            db.write("users", users)
            print(f"Admin user created successfully: {admin_data}")  # لاگ برای دیباگ
    except Exception as e:
        print(f"Error ensuring admin exists: {str(e)}")

# اجرای تابع در زمان شروع سرور
ensure_admin_exists()
