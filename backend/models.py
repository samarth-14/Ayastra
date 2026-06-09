from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base
class Product(Base):
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    weight_kg = Column(Float, nullable=True)
    stock = Column(Integer, default=0)
    price_type = Column(String, nullable=False)  # "per_kg" or "per_piece"
    price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=func.now())


class BrassPrice(Base):
    __tablename__ = 'brass_prices'
    
    id = Column(Integer, primary_key=True, index=True)
    price_per_kg = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=func.now())


class ScrapInventory(Base):
    __tablename__ = "scrap_inventory"

    id = Column(Integer, primary_key=True, index=True)
    weight_kg = Column(Float, nullable=False)
    quality = Column(String, nullable=False)  # "clean" or "mixed"
    added_at = Column(DateTime, default=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())



#id: unique identifier for each product
#name: name of the product
#category: type of product (e.g., "fittings", "rods")
#weight_kg: weight of the product in kilograms (nullable for per_piece items) and null for per piece items
#stock: number of pieces in stock (default 0, only relevant for per_piece items)
#price_type: indicates if the price is "per_kg" or "per_piece"
#price: price of the product (either per kg or per piece based on price_type)
#created_at: timestamp when the product was added to the database (automatically set to current