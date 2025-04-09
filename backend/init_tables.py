from app.database import Base, engine
from app.models import User, Product, Category, CartItem, Order, OrderItem

def init_tables():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_tables() 