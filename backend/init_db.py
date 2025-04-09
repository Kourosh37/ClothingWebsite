from app.database import init_db
from app.models import Base
from app.database import engine

def init_database():
    # Create all tables
    Base.metadata.drop_all(bind=engine)  # Drop all existing tables
    Base.metadata.create_all(bind=engine)  # Create all tables
    init_db()  # Initialize database with default data

if __name__ == "__main__":
    init_database()
    print("Database initialized successfully!") 