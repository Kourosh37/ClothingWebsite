from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app import models, schemas
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_create_user(test_db):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "name": "Test User",
            "password": "testpass"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"

def test_login_user(test_db):
    # First create a user
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "name": "Test User",
            "password": "testpass"
        }
    )
    
    # Then try to login
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpass"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_get_products(test_db):
    response = client.get("/api/products")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_product(test_db):
    # First login and get token
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "name": "Test User",
            "password": "testpass"
        }
    )
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "testpass"
        }
    )
    token = login_response.json()["access_token"]
    
    # Then create product
    response = client.post(
        "/api/products",
        json={
            "name": "Test Product",
            "description": "Test Description",
            "price": 10.99,
            "category": "Test Category",
            "stock": 100
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Product"
    assert data["price"] == 10.99 