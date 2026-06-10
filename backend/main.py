"""
Ayastra — FastAPI Backend
Complete API matching the frontend dashboard requirements.
"""

from datetime import datetime, timedelta
from typing import Optional, List
import os, math, httpx

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, func
from sqlalchemy.orm import Session, sessionmaker

from models import (
    Base, Company, User, UserSettings, Warehouse,
    Product, InventoryItem, Customer, Order, OrderItem,
    MetalPrice, MetalPriceHistory, AIForecast,
    RevenueSnapshot, BusinessHealthScore, Integration, Alert,
)

# ---------------------------------------------------------------------------
# DB setup
# ---------------------------------------------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ayastra.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="Ayastra API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===========================================================================
# PYDANTIC SCHEMAS
# ===========================================================================

# --- Auth ---
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user_id: int
    full_name: str
    role: str
    company_id: int

# --- Company ---
class CompanyUpdate(BaseModel):
    name: Optional[str]
    gstin: Optional[str]
    address: Optional[str]
    industry: Optional[str]

# --- User / Profile ---
class ProfileUpdate(BaseModel):
    full_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]

class SettingsUpdate(BaseModel):
    notif_low_stock: Optional[bool]
    notif_new_order: Optional[bool]
    notif_price_alert: Optional[bool]
    notif_weekly_report: Optional[bool]
    session_timeout: Optional[int]

# --- Warehouse ---
class WarehouseCreate(BaseModel):
    name: str
    city: Optional[str]
    address: Optional[str]

# --- Product ---
class ProductCreate(BaseModel):
    name: str
    sku: str
    category: Optional[str]
    unit: Optional[str] = "MT"
    description: Optional[str]

# --- Inventory ---
class InventoryCreate(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: float
    cost_price: float
    reorder_point: Optional[float] = 100.0

class InventoryUpdate(BaseModel):
    quantity: Optional[float]
    cost_price: Optional[float]
    reorder_point: Optional[float]

# --- Customer ---
class CustomerCreate(BaseModel):
    name: str
    phone: Optional[str]
    email: Optional[str]
    city: Optional[str]
    gstin: Optional[str]

# --- Order ---
class OrderItemIn(BaseModel):
    product_id: int
    quantity: float
    unit_price: float

class OrderCreate(BaseModel):
    customer_id: int
    channel: Optional[str] = "manual"
    items: List[OrderItemIn]
    eta: Optional[datetime]
    notes: Optional[str]

class OrderStatusUpdate(BaseModel):
    status: str

# --- Integration ---
class IntegrationUpdate(BaseModel):
    status: str           # "connected" | "disconnected"
    detail: Optional[str]


# ===========================================================================
# HELPERS
# ===========================================================================

def _compute_inventory_status(qty: float, reorder: float) -> str:
    if qty <= 0:
        return "critical"
    ratio = qty / reorder if reorder > 0 else 1
    if ratio < 0.5:
        return "critical"
    if ratio < 1.0:
        return "low"
    return "ok"


def _generate_order_number(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(func.count(Order.id)).scalar() or 0
    return f"SO-{year}-{count + 1:04d}"


# ===========================================================================
# ROUTES
# ===========================================================================

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@app.post("/auth/login", response_model=LoginResponse, tags=["Auth"])
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return a token (stub — add JWT in production)."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # TODO: verify hashed password
    return LoginResponse(
        token=f"stub-token-{user.id}",
        user_id=user.id,
        full_name=user.full_name,
        role=user.role,
        company_id=user.company_id,
    )


# ---------------------------------------------------------------------------
# Dashboard — Home summary
# ---------------------------------------------------------------------------

@app.get("/dashboard/summary", tags=["Dashboard"])
def dashboard_summary(company_id: int, db: Session = Depends(get_db)):
    """
    Single endpoint powering the DashboardHome KPI cards + quick stats.
    Returns: today's revenue, open orders, low-stock SKUs, dispatched today.
    """
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Today's revenue from dispatched/delivered orders
    today_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.company_id == company_id,
        Order.status.in_(["dispatched", "delivered"]),
        Order.order_date >= today_start,
    ).scalar() or 0.0

    open_orders = db.query(func.count(Order.id)).filter(
        Order.company_id == company_id,
        Order.status.in_(["pending", "confirmed", "processing"]),
    ).scalar() or 0

    low_stock_skus = db.query(func.count(InventoryItem.id)).join(
        Warehouse, InventoryItem.warehouse_id == Warehouse.id
    ).filter(
        Warehouse.company_id == company_id,
        InventoryItem.status.in_(["low", "critical"]),
    ).scalar() or 0

    dispatched_today = db.query(func.count(Order.id)).filter(
        Order.company_id == company_id,
        Order.status == "dispatched",
        Order.order_date >= today_start,
    ).scalar() or 0

    dispatched_value = db.query(func.sum(Order.total_amount)).filter(
        Order.company_id == company_id,
        Order.status == "dispatched",
        Order.order_date >= today_start,
    ).scalar() or 0.0

    # Recent alerts
    alerts = db.query(Alert).filter(
        Alert.company_id == company_id,
    ).order_by(Alert.created_at.desc()).limit(5).all()

    return {
        "today_revenue": today_revenue,
        "open_orders": open_orders,
        "low_stock_skus": low_stock_skus,
        "dispatched_today": dispatched_today,
        "dispatched_value": dispatched_value,
        "alerts": [
            {
                "id": a.id,
                "type": a.type,
                "message": a.message,
                "created_at": a.created_at.isoformat(),
                "is_read": a.is_read,
            }
            for a in alerts
        ],
    }


@app.get("/dashboard/revenue-chart", tags=["Dashboard"])
def revenue_chart(company_id: int, days: int = 7, db: Session = Depends(get_db)):
    """Daily revenue for the home-page line chart (default last 7 days)."""
    results = []
    for i in range(days - 1, -1, -1):
        day_start = datetime.utcnow().replace(
            hour=0, minute=0, second=0, microsecond=0
        ) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        rev = db.query(func.sum(Order.total_amount)).filter(
            Order.company_id == company_id,
            Order.order_date >= day_start,
            Order.order_date < day_end,
            Order.status.in_(["dispatched", "delivered"]),
        ).scalar() or 0.0
        results.append({"d": day_start.strftime("%a"), "v": round(rev / 100000, 2)})
    return results


# ---------------------------------------------------------------------------
# Inventory
# ---------------------------------------------------------------------------

@app.get("/inventory", tags=["Inventory"])
def list_inventory(
    company_id: int,
    search: Optional[str] = None,
    status: Optional[str] = None,
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """List all inventory items with optional search/filter. Powers DashboardInventory."""
    q = (
        db.query(InventoryItem)
        .join(Product, InventoryItem.product_id == Product.id)
        .join(Warehouse, InventoryItem.warehouse_id == Warehouse.id)
        .filter(Warehouse.company_id == company_id)
    )
    if search:
        q = q.filter(
            (Product.name.ilike(f"%{search}%")) | (Product.sku.ilike(f"%{search}%"))
        )
    if status and status != "all":
        q = q.filter(InventoryItem.status == status)
    if warehouse_id:
        q = q.filter(InventoryItem.warehouse_id == warehouse_id)

    items = q.all()

    def total_value(item):
        return (item.quantity or 0) * (item.cost_price or 0)

    return [
        {
            "id": item.id,
            "product_id": item.product_id,
            "name": item.product.name,
            "sku": item.product.sku,
            "category": item.product.category,
            "warehouse": item.warehouse.name,
            "warehouse_id": item.warehouse_id,
            "qty": item.quantity,
            "unit": item.product.unit,
            "cost_price": item.cost_price,
            "total_value": total_value(item),
            "reorder_point": item.reorder_point,
            "status": item.status,
            "last_updated": item.last_updated.isoformat() if item.last_updated else None,
        }
        for item in items
    ]


@app.get("/inventory/kpis", tags=["Inventory"])
def inventory_kpis(company_id: int, db: Session = Depends(get_db)):
    """KPI cards for the Inventory page header."""
    items = (
        db.query(InventoryItem)
        .join(Warehouse)
        .filter(Warehouse.company_id == company_id)
        .all()
    )
    total_value = sum((i.quantity or 0) * (i.cost_price or 0) for i in items)
    return {
        "total_skus": len(items),
        "total_value": total_value,
        "low_stock": sum(1 for i in items if i.status == "low"),
        "critical": sum(1 for i in items if i.status == "critical"),
    }


@app.post("/inventory", tags=["Inventory"])
def add_inventory(body: InventoryCreate, db: Session = Depends(get_db)):
    """Add a new inventory entry (SKU in warehouse)."""
    status = _compute_inventory_status(body.quantity, body.reorder_point or 100)
    item = InventoryItem(
        product_id=body.product_id,
        warehouse_id=body.warehouse_id,
        quantity=body.quantity,
        cost_price=body.cost_price,
        reorder_point=body.reorder_point,
        status=status,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "status": item.status}


@app.patch("/inventory/{item_id}", tags=["Inventory"])
def update_inventory(item_id: int, body: InventoryUpdate, db: Session = Depends(get_db)):
    """Update quantity / cost / reorder for a specific inventory row."""
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if body.quantity is not None:
        item.quantity = body.quantity
    if body.cost_price is not None:
        item.cost_price = body.cost_price
    if body.reorder_point is not None:
        item.reorder_point = body.reorder_point
    item.status = _compute_inventory_status(item.quantity, item.reorder_point)
    db.commit()
    return {"id": item.id, "status": item.status}


@app.delete("/inventory/{item_id}", tags=["Inventory"])
def delete_inventory(item_id: int, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"deleted": item_id}


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

@app.get("/products", tags=["Products"])
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return [{"id": p.id, "name": p.name, "sku": p.sku, "category": p.category, "unit": p.unit} for p in products]


@app.get("/products/{product_id}", tags=["Products"])
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"id": p.id, "name": p.name, "sku": p.sku, "category": p.category, "unit": p.unit, "description": p.description}


@app.post("/products", tags=["Products"])
def create_product(body: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.sku == body.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
    p = Product(**body.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"id": p.id, "sku": p.sku}


# ---------------------------------------------------------------------------
# Warehouses
# ---------------------------------------------------------------------------

@app.get("/warehouses", tags=["Warehouses"])
def list_warehouses(company_id: int, db: Session = Depends(get_db)):
    warehouses = db.query(Warehouse).filter(Warehouse.company_id == company_id).all()
    return [{"id": w.id, "name": w.name, "city": w.city} for w in warehouses]


@app.post("/warehouses", tags=["Warehouses"])
def create_warehouse(company_id: int, body: WarehouseCreate, db: Session = Depends(get_db)):
    w = Warehouse(company_id=company_id, **body.dict())
    db.add(w)
    db.commit()
    db.refresh(w)
    return {"id": w.id, "name": w.name}


# ---------------------------------------------------------------------------
# Customers
# ---------------------------------------------------------------------------

@app.get("/customers", tags=["Customers"])
def list_customers(company_id: int, db: Session = Depends(get_db)):
    customers = db.query(Customer).filter(Customer.company_id == company_id).all()
    return [{"id": c.id, "name": c.name, "phone": c.phone, "city": c.city} for c in customers]


@app.post("/customers", tags=["Customers"])
def create_customer(company_id: int, body: CustomerCreate, db: Session = Depends(get_db)):
    c = Customer(company_id=company_id, **body.dict())
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"id": c.id, "name": c.name}


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

@app.get("/orders", tags=["Orders"])
def list_orders(
    company_id: int,
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List orders. Powers DashboardOrders table + filters."""
    q = db.query(Order).filter(Order.company_id == company_id)
    if status and status != "all":
        q = q.filter(Order.status == status)
    if search:
        q = q.join(Customer).filter(
            (Order.order_number.ilike(f"%{search}%")) |
            (Customer.name.ilike(f"%{search}%"))
        )
    orders = q.order_by(Order.order_date.desc()).all()

    return [
        {
            "id": o.id,
            "order_number": o.order_number,
            "customer": o.customer.name if o.customer else "",
            "items_summary": f"{sum(i.quantity for i in o.items):.0f}MT · {len(o.items)} product(s)",
            "total_amount": o.total_amount,
            "status": o.status,
            "channel": o.channel,
            "order_date": o.order_date.strftime("%b %d") if o.order_date else "",
            "eta": o.eta.strftime("%b %d") if o.eta else "",
        }
        for o in orders
    ]


@app.post("/orders", tags=["Orders"])
def create_order(company_id: int, body: OrderCreate, db: Session = Depends(get_db)):
    """Create a new sales order with line items."""
    order_number = _generate_order_number(db)
    total = sum(i.quantity * i.unit_price for i in body.items)

    order = Order(
        order_number=order_number,
        customer_id=body.customer_id,
        company_id=company_id,
        channel=body.channel,
        total_amount=total,
        eta=body.eta,
        notes=body.notes,
    )
    db.add(order)
    db.flush()

    for it in body.items:
        line = OrderItem(
            order_id=order.id,
            product_id=it.product_id,
            quantity=it.quantity,
            unit_price=it.unit_price,
            subtotal=it.quantity * it.unit_price,
        )
        db.add(line)

    db.commit()
    db.refresh(order)
    return {"id": order.id, "order_number": order.order_number, "total": total}


@app.patch("/orders/{order_id}/status", tags=["Orders"])
def update_order_status(order_id: int, body: OrderStatusUpdate, db: Session = Depends(get_db)):
    """Update order status (pending → confirmed → processing → dispatched → delivered)."""
    valid = ["pending", "confirmed", "processing", "dispatched", "delivered"]
    if body.status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid}")
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = body.status
    db.commit()
    return {"id": order_id, "status": order.status}


@app.get("/orders/{order_id}", tags=["Orders"])
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {
        "id": order.id,
        "order_number": order.order_number,
        "customer": order.customer.name,
        "status": order.status,
        "channel": order.channel,
        "total_amount": order.total_amount,
        "order_date": order.order_date.isoformat(),
        "eta": order.eta.isoformat() if order.eta else None,
        "items": [
            {
                "product_id": i.product_id,
                "product_name": i.product.name,
                "sku": i.product.sku,
                "quantity": i.quantity,
                "unit_price": i.unit_price,
                "subtotal": i.subtotal,
            }
            for i in order.items
        ],
    }


# ---------------------------------------------------------------------------
# Markets — Metal Prices
# ---------------------------------------------------------------------------

ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY", "")

@app.get("/markets/prices", tags=["Markets"])
def get_metal_prices(db: Session = Depends(get_db)):
    """Return all metal prices for the Markets ticker row."""
    metals = db.query(MetalPrice).all()
    return [
        {
            "id": m.id,
            "code": m.code,
            "name": m.name,
            "exchange": m.exchange,
            "price": m.price,
            "prev_price": m.prev_price,
            "change_pct": round((m.price - m.prev_price) / m.prev_price * 100, 2) if m.prev_price else 0,
            "unit": m.unit,
            "color": m.color,
            "fetched_at": m.fetched_at.isoformat() if m.fetched_at else None,
        }
        for m in metals
    ]


@app.get("/markets/history/{code}", tags=["Markets"])
def get_price_history(code: str, months: int = 6, db: Session = Depends(get_db)):
    """6-month price history for the selected metal chart."""
    metal = db.query(MetalPrice).filter(MetalPrice.code == code).first()
    if not metal:
        raise HTTPException(status_code=404, detail="Metal not found")
    since = datetime.utcnow() - timedelta(days=months * 30)
    rows = (
        db.query(MetalPriceHistory)
        .filter(
            MetalPriceHistory.metal_id == metal.id,
            MetalPriceHistory.recorded_at >= since,
        )
        .order_by(MetalPriceHistory.recorded_at)
        .all()
    )
    return [{"d": r.recorded_at.strftime("%b"), "v": r.price} for r in rows]


@app.get("/markets/forecasts", tags=["Markets"])
def get_forecasts(db: Session = Depends(get_db)):
    """AI price forecasts for the Markets page."""
    forecasts = db.query(AIForecast).order_by(AIForecast.generated_at.desc()).limit(6).all()
    return [
        {
            "metal": f.metal_code,
            "direction": f.direction,
            "confidence": f.confidence,
            "target_price": f.target_price,
            "period": f"{f.period_days}d",
        }
        for f in forecasts
    ]


@app.post("/markets/prices/refresh", tags=["Markets"])
async def refresh_metal_prices(db: Session = Depends(get_db)):
    """
    Fetch latest brass/copper price from Alpha Vantage and update DB.
    Keeps existing prices as prev_price.
    """
    if not ALPHA_VANTAGE_KEY:
        raise HTTPException(status_code=503, detail="ALPHA_VANTAGE_KEY not configured")

    url = (
        f"https://www.alphavantage.co/query?"
        f"function=GLOBAL_QUOTE&symbol=COPPER&apikey={ALPHA_VANTAGE_KEY}"
    )
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
    data = resp.json().get("Global Quote", {})
    price_usd = float(data.get("05. price", 0))
    if not price_usd:
        raise HTTPException(status_code=502, detail="Could not parse Alpha Vantage response")

    # USD/lb → INR/MT  (1 lb = 0.000453592 MT, 1 USD ≈ 83 INR)
    inr_per_mt = price_usd / 0.000453592 * 83

    copper = db.query(MetalPrice).filter(MetalPrice.code == "COP-8MM").first()
    if copper:
        copper.prev_price = copper.price
        copper.price = round(inr_per_mt)
        copper.fetched_at = datetime.utcnow()
        db.commit()
        return {"updated": "COP-8MM", "price": copper.price}
    return {"status": "COP-8MM not in DB — run seed first"}


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------

@app.get("/analytics/kpis", tags=["Analytics"])
def analytics_kpis(company_id: int, db: Session = Depends(get_db)):
    """
    FY KPI cards: revenue, margin, active customers, EBITDA.
    Computed from revenue_snapshots + orders.
    """
    fy_start = datetime(datetime.utcnow().year, 4, 1)   # Indian FY starts April

    fy_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.company_id == company_id,
        Order.order_date >= fy_start,
        Order.status.in_(["delivered", "dispatched"]),
    ).scalar() or 0.0

    active_customers = db.query(func.count(func.distinct(Order.customer_id))).filter(
        Order.company_id == company_id,
        Order.order_date >= datetime.utcnow() - timedelta(days=30),
    ).scalar() or 0

    # Stub margin / EBITDA — replace with real P&L logic
    net_margin = 32.6
    ebitda = fy_revenue * 0.29

    return {
        "fy_revenue": fy_revenue,
        "net_margin": net_margin,
        "active_customers": active_customers,
        "ebitda": ebitda,
    }


@app.get("/analytics/revenue-trend", tags=["Analytics"])
def analytics_revenue_trend(company_id: int, months: int = 12, db: Session = Depends(get_db)):
    """12-month revenue + profit trend for the Analytics LineChart."""
    results = []
    for i in range(months - 1, -1, -1):
        # Go back i months from today
        ref = datetime.utcnow().replace(day=1) - timedelta(days=i * 28)
        month_start = ref.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        rev = db.query(func.sum(Order.total_amount)).filter(
            Order.company_id == company_id,
            Order.order_date >= month_start,
            Order.order_date < month_end,
            Order.status.in_(["delivered", "dispatched"]),
        ).scalar() or 0.0
        results.append({
            "m": month_start.strftime("%b"),
            "r": round(rev / 100000, 1),       # ₹L
            "p": round(rev * 0.326 / 100000, 1),
        })
    return results


@app.get("/analytics/customer-growth", tags=["Analytics"])
def analytics_customer_growth(company_id: int, db: Session = Depends(get_db)):
    """Monthly active customer count for growth chart."""
    results = []
    for i in range(5, -1, -1):
        ref = datetime.utcnow().replace(day=1) - timedelta(days=i * 28)
        month_start = ref.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        n = db.query(func.count(func.distinct(Order.customer_id))).filter(
            Order.company_id == company_id,
            Order.order_date >= month_start,
            Order.order_date < month_end,
        ).scalar() or 0
        results.append({"m": month_start.strftime("%b"), "n": n})
    return results


@app.get("/analytics/category-revenue", tags=["Analytics"])
def analytics_category_revenue(company_id: int, db: Session = Depends(get_db)):
    """Revenue % by product category for the horizontal bar chart."""
    fy_start = datetime(datetime.utcnow().year, 4, 1)
    rows = (
        db.query(Product.category, func.sum(OrderItem.subtotal).label("total"))
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.company_id == company_id, Order.order_date >= fy_start)
        .group_by(Product.category)
        .all()
    )
    grand = sum(r.total for r in rows) or 1
    return [{"cat": r.category or "Other", "val": round(r.total / grand * 100, 1)} for r in rows]


@app.get("/analytics/health", tags=["Analytics"])
def analytics_health(company_id: int, db: Session = Depends(get_db)):
    """Business health score (latest snapshot)."""
    h = (
        db.query(BusinessHealthScore)
        .filter(BusinessHealthScore.company_id == company_id)
        .order_by(BusinessHealthScore.recorded_at.desc())
        .first()
    )
    if not h:
        return []
    return [
        {"label": "Revenue Growth",        "val": h.revenue_growth,       "color": "#22C55E"},
        {"label": "Margin Health",          "val": h.margin_health,        "color": "#F59E0B"},
        {"label": "Customer Retention",     "val": h.customer_retention,   "color": "#22C55E"},
        {"label": "Inventory Efficiency",   "val": h.inventory_efficiency, "color": "#F59E0B"},
        {"label": "Collections",            "val": h.collections,          "color": "#EF4444"},
    ]


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

@app.get("/settings/profile/{user_id}", tags=["Settings"])
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
    }


@app.patch("/settings/profile/{user_id}", tags=["Settings"])
def update_profile(user_id: int, body: ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.full_name: user.full_name = body.full_name
    if body.email:     user.email = body.email
    if body.phone:     user.phone = body.phone
    db.commit()
    return {"status": "saved"}


@app.get("/settings/notifications/{user_id}", tags=["Settings"])
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    s = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Settings not found")
    return {
        "notif_low_stock": s.notif_low_stock,
        "notif_new_order": s.notif_new_order,
        "notif_price_alert": s.notif_price_alert,
        "notif_weekly_report": s.notif_weekly_report,
        "session_timeout": s.session_timeout,
    }


@app.patch("/settings/notifications/{user_id}", tags=["Settings"])
def update_notifications(user_id: int, body: SettingsUpdate, db: Session = Depends(get_db)):
    s = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Settings not found")
    for field, val in body.dict(exclude_none=True).items():
        setattr(s, field, val)
    db.commit()
    return {"status": "saved"}


@app.get("/settings/company/{company_id}", tags=["Settings"])
def get_company(company_id: int, db: Session = Depends(get_db)):
    c = db.query(Company).filter(Company.id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"name": c.name, "gstin": c.gstin, "address": c.address, "industry": c.industry}


@app.patch("/settings/company/{company_id}", tags=["Settings"])
def update_company(company_id: int, body: CompanyUpdate, db: Session = Depends(get_db)):
    c = db.query(Company).filter(Company.id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
    for field, val in body.dict(exclude_none=True).items():
        setattr(c, field, val)
    db.commit()
    return {"status": "saved"}


# ---------------------------------------------------------------------------
# Integrations
# ---------------------------------------------------------------------------

@app.get("/settings/integrations/{company_id}", tags=["Settings"])
def list_integrations(company_id: int, db: Session = Depends(get_db)):
    rows = db.query(Integration).filter(Integration.company_id == company_id).all()
    return [{"id": r.id, "name": r.name, "status": r.status, "detail": r.detail} for r in rows]


@app.patch("/settings/integrations/{integration_id}", tags=["Settings"])
def update_integration(integration_id: int, body: IntegrationUpdate, db: Session = Depends(get_db)):
    r = db.query(Integration).filter(Integration.id == integration_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Integration not found")
    r.status = body.status
    if body.detail:
        r.detail = body.detail
    db.commit()
    return {"status": "saved"}


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------

@app.get("/alerts", tags=["Alerts"])
def list_alerts(company_id: int, unread_only: bool = False, db: Session = Depends(get_db)):
    q = db.query(Alert).filter(Alert.company_id == company_id)
    if unread_only:
        q = q.filter(Alert.is_read == False)
    alerts = q.order_by(Alert.created_at.desc()).limit(20).all()
    return [{"id": a.id, "type": a.type, "message": a.message, "created_at": a.created_at.isoformat(), "is_read": a.is_read} for a in alerts]


@app.patch("/alerts/{alert_id}/read", tags=["Alerts"])
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    a = db.query(Alert).filter(Alert.id == alert_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    a.is_read = True
    db.commit()
    return {"status": "ok"}
