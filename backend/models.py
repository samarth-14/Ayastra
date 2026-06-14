"""
Ayastra — Database Models
Derived from frontend analysis of all dashboard components.
"""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Enum, Boolean,
    DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


# ---------------------------------------------------------------------------
# Users & Company
# ---------------------------------------------------------------------------

class Company(Base):
    __tablename__ = "companies"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    gstin       = Column(String, unique=True)
    address     = Column(String)
    industry    = Column(String)
    created_at  = Column(DateTime, default=datetime.utcnow)

    users       = relationship("User", back_populates="company")
    warehouses  = relationship("Warehouse", back_populates="company")


class User(Base):
    __tablename__ = "users"

    id           = Column(Integer, primary_key=True, index=True)
    company_id   = Column(Integer, ForeignKey("companies.id"), nullable=False)
    full_name    = Column(String, nullable=False)
    email        = Column(String, unique=True, nullable=False, index=True)
    phone        = Column(String)
    role         = Column(Enum("admin", "manager", "staff", name="user_role"), default="staff")
    password_hash = Column(String, nullable=False)
    is_active    = Column(Boolean, default=True)
    created_at   = Column(DateTime, default=datetime.utcnow)

    company      = relationship("Company", back_populates="users")
    settings     = relationship("UserSettings", uselist=False, back_populates="user")


class UserSettings(Base):
    """Per-user notification and security preferences."""
    __tablename__ = "user_settings"

    id                = Column(Integer, primary_key=True)
    user_id           = Column(Integer, ForeignKey("users.id"), unique=True)
    notif_low_stock   = Column(Boolean, default=True)
    notif_new_order   = Column(Boolean, default=True)
    notif_price_alert = Column(Boolean, default=True)
    notif_weekly_report = Column(Boolean, default=False)
    session_timeout   = Column(Integer, default=30)   # minutes
    two_fa_enabled    = Column(Boolean, default=False)

    user = relationship("User", back_populates="settings")


# ---------------------------------------------------------------------------
# Warehouses
# ---------------------------------------------------------------------------

class Warehouse(Base):
    __tablename__ = "warehouses"

    id          = Column(Integer, primary_key=True, index=True)
    company_id  = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name        = Column(String, nullable=False)
    city        = Column(String)
    address     = Column(String)
    is_active   = Column(Boolean, default=True)

    company     = relationship("Company", back_populates="warehouses")
    inventory   = relationship("InventoryItem", back_populates="warehouse")


# ---------------------------------------------------------------------------
# Products & Inventory
# ---------------------------------------------------------------------------

class Product(Base):
    """Master catalogue — one row per product type."""
    __tablename__ = "products"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    sku          = Column(String, unique=True, nullable=False, index=True)
    category     = Column(String)          # Steel / Copper / Aluminium / Zinc / Lead / …
    unit         = Column(String, default="MT")
    description  = Column(Text)
    created_at   = Column(DateTime, default=datetime.utcnow)

    inventory    = relationship("InventoryItem", back_populates="product")
    order_items  = relationship("OrderItem", back_populates="product")


class InventoryItem(Base):
    """Stock level per product per warehouse."""
    __tablename__ = "inventory"

    id             = Column(Integer, primary_key=True, index=True)
    product_id     = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id   = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity       = Column(Float, default=0.0)
    cost_price     = Column(Float)          # per unit in INR
    reorder_point  = Column(Float, default=100.0)
    status         = Column(
        Enum("ok", "low", "critical", name="stock_status"), default="ok"
    )
    last_updated   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product   = relationship("Product", back_populates="inventory")
    warehouse = relationship("Warehouse", back_populates="inventory")


# ---------------------------------------------------------------------------
# Customers
# ---------------------------------------------------------------------------

class Customer(Base):
    __tablename__ = "customers"

    id          = Column(Integer, primary_key=True, index=True)
    company_id  = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name        = Column(String, nullable=False)
    phone       = Column(String)
    email       = Column(String)
    city        = Column(String)
    gstin       = Column(String)
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, default=datetime.utcnow)

    orders      = relationship("Order", back_populates="customer")


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

class Order(Base):
    __tablename__ = "orders"

    id           = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, nullable=False, index=True)  # e.g. SO-2024-8821
    customer_id  = Column(Integer, ForeignKey("customers.id"), nullable=False)
    company_id   = Column(Integer, ForeignKey("companies.id"), nullable=False)
    status       = Column(
        Enum("pending", "confirmed", "processing", "dispatched", "delivered",
             name="order_status"),
        default="pending"
    )
    channel      = Column(String, default="manual")
    total_amount = Column(Float, default=0.0)
    order_date   = Column(DateTime, default=datetime.utcnow)
    eta          = Column(DateTime)
    notes        = Column(Text)

    customer   = relationship("Customer", back_populates="orders")
    items      = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id          = Column(Integer, primary_key=True)
    order_id    = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id  = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity    = Column(Float, nullable=False)
    unit_price  = Column(Float, nullable=False)
    subtotal    = Column(Float, nullable=False)

    order   = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


# ---------------------------------------------------------------------------
# Metal Prices (live + history)
# ---------------------------------------------------------------------------

class MetalPrice(Base):
    """Latest price snapshot for each metal/commodity."""
    __tablename__ = "metal_prices"

    id            = Column(Integer, primary_key=True)
    code          = Column(String, unique=True, nullable=False, index=True)  # e.g. STL-100
    name          = Column(String, nullable=False)
    exchange      = Column(String, default="MCX")  # MCX / LME
    price         = Column(Float, nullable=False)
    prev_price    = Column(Float)
    unit          = Column(String, default="MT")
    color         = Column(String)             # hex for UI
    fetched_at    = Column(DateTime, default=datetime.utcnow)

    history       = relationship("MetalPriceHistory", back_populates="metal")


class MetalPriceHistory(Base):
    """Daily price snapshots for charting."""
    __tablename__ = "metal_price_history"

    id         = Column(Integer, primary_key=True)
    metal_id   = Column(Integer, ForeignKey("metal_prices.id"), nullable=False)
    price      = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    metal = relationship("MetalPrice", back_populates="history")


class AIForecast(Base):
    """AI-generated price forecasts shown in the Markets tab."""
    __tablename__ = "ai_forecasts"

    id           = Column(Integer, primary_key=True)
    metal_code   = Column(String, nullable=False)
    direction    = Column(Enum("up", "down", name="forecast_direction"))
    confidence   = Column(Integer)          # 0-100
    target_price = Column(Float)
    period_days  = Column(Integer, default=30)
    generated_at = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# Analytics Snapshots
# ---------------------------------------------------------------------------

class RevenueSnapshot(Base):
    """Monthly aggregated revenue + profit for the Analytics chart."""
    __tablename__ = "revenue_snapshots"

    id          = Column(Integer, primary_key=True)
    company_id  = Column(Integer, ForeignKey("companies.id"), nullable=False)
    period      = Column(String, nullable=False)   # "2026-06"
    revenue     = Column(Float, default=0.0)       # in ₹L
    profit      = Column(Float, default=0.0)
    created_at  = Column(DateTime, default=datetime.utcnow)


class BusinessHealthScore(Base):
    """Snapshot of the business health metrics."""
    __tablename__ = "business_health"

    id                    = Column(Integer, primary_key=True)
    company_id            = Column(Integer, ForeignKey("companies.id"), nullable=False)
    revenue_growth        = Column(Integer)
    margin_health         = Column(Integer)
    customer_retention    = Column(Integer)
    inventory_efficiency  = Column(Integer)
    collections           = Column(Integer)
    recorded_at           = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# Integrations
# ---------------------------------------------------------------------------

class Integration(Base):
    """Tracks connected third-party services (WhatsApp, Tally, MCX, etc.)."""
    __tablename__ = "integrations"

    id          = Column(Integer, primary_key=True)
    company_id  = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name        = Column(String, nullable=False)    # "WhatsApp Business"
    status      = Column(
        Enum("connected", "disconnected", name="integration_status"),
        default="disconnected"
    )
    detail      = Column(String)                    # human-readable detail string
    config      = Column(JSON)                      # store API keys / tokens (encrypted in prod)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------

class Alert(Base):
    """System alerts shown in Dashboard Home."""
    __tablename__ = "alerts"

    id          = Column(Integer, primary_key=True)
    company_id  = Column(Integer, ForeignKey("companies.id"), nullable=False)
    type        = Column(Enum("warn", "ok", "error", name="alert_type"), default="warn")
    message     = Column(String, nullable=False)
    is_read     = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.utcnow)
