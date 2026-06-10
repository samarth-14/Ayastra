"""
Ayastra — Seed Script
Populates the database with sample data matching the frontend mock data exactly.
Run: python seed.py
"""

from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import (
    Base, Company, User, UserSettings, Warehouse,
    Product, InventoryItem, Customer, Order, OrderItem,
    MetalPrice, MetalPriceHistory, AIForecast,
    RevenueSnapshot, BusinessHealthScore, Integration, Alert,
)
from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

DATABASE_URL = "sqlite:///./ayastra.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)
db = Session()

print("🌱 Seeding Ayastra database...")

# ---------------------------------------------------------------------------
# Company
# ---------------------------------------------------------------------------
company = Company(
    name="Sharma Metals Pvt. Ltd.",
    gstin="27AABCS1429B1Z1",
    address="Dharavi, Mumbai 400017",
    industry="Metal Trading & Distribution",
)
db.add(company)
db.flush()

# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
user = User(
    company_id=company.id,
    full_name="Rajesh Sharma",
    email="rajesh@example.com",
    phone="+91 98765 43210",
    role="admin",
    password_hash=pwd_ctx.hash("ayastra123"),
)
db.add(user)
db.flush()

settings = UserSettings(
    user_id=user.id,
    notif_low_stock=True,
    notif_new_order=True,
    notif_price_alert=True,
    notif_weekly_report=False,
    session_timeout=30,
)
db.add(settings)

# ---------------------------------------------------------------------------
# Warehouses
# ---------------------------------------------------------------------------
wh_data = [
    ("Mumbai Main", "Mumbai"),
    ("Pune Annex", "Pune"),
    ("Delhi North", "Delhi"),
    ("Surat Hub", "Surat"),
]
warehouses = {}
for name, city in wh_data:
    w = Warehouse(company_id=company.id, name=name, city=city)
    db.add(w)
    db.flush()
    warehouses[name] = w

# ---------------------------------------------------------------------------
# Products (master catalogue)
# ---------------------------------------------------------------------------
product_data = [
    ("Steel Billets 100mm",  "STL-B100", "Steel",    "MT"),
    ("Copper Rods 8mm",      "COP-R008", "Copper",   "MT"),
    ("Aluminium Sheets 3mm", "ALU-S003", "Aluminium","MT"),
    ("Zinc Ingots",          "ZNC-I001", "Zinc",     "MT"),
    ("MS Angles 50x50",      "MSA-5050", "Steel",    "MT"),
    ("HR Coils 3mm",         "HRC-003",  "Steel",    "MT"),
    ("Lead Ingots",          "PB-I001",  "Lead",     "MT"),
    ("SS Sheets 304",        "SS-304",   "Steel",    "MT"),
]
products = {}
for name, sku, cat, unit in product_data:
    p = Product(name=name, sku=sku, category=cat, unit=unit)
    db.add(p)
    db.flush()
    products[sku] = p

# ---------------------------------------------------------------------------
# Inventory (matches DashboardInventory mock data)
# ---------------------------------------------------------------------------
inv_data = [
    # sku,       warehouse,       qty,  cost,     reorder
    ("STL-B100", "Mumbai Main",   2840, 46200,    500),
    ("COP-R008", "Pune Annex",    156,  782000,   200),
    ("ALU-S003", "Mumbai Main",   890,  216000,   150),
    ("ZNC-I001", "Delhi North",   44,   239000,   100),
    ("MSA-5050", "Mumbai Main",   1200, 48000,    200),
    ("HRC-003",  "Surat Hub",     320,  52000,    100),
    ("PB-I001",  "Delhi North",   88,   185000,   120),
    ("SS-304",   "Pune Annex",    42,   320000,   60),
]
for sku, wh, qty, cost, reorder in inv_data:
    ratio = qty / reorder
    if ratio < 0.5:
        status = "critical"
    elif ratio < 1.0:
        status = "low"
    else:
        status = "ok"
    item = InventoryItem(
        product_id=products[sku].id,
        warehouse_id=warehouses[wh].id,
        quantity=qty,
        cost_price=cost,
        reorder_point=reorder,
        status=status,
    )
    db.add(item)

# ---------------------------------------------------------------------------
# Customers
# ---------------------------------------------------------------------------
customer_data = [
    ("Rajesh Metals",    "+91 9876543210", "Delhi"),
    ("Gupta Iron Works", "+91 9812345678", "Mumbai"),
    ("Patel Alloys",     "+91 9823456789", "Ahmedabad"),
    ("Delhi Steel Depot","+91 9834567890", "Delhi"),
    ("Mumbai Traders",   "+91 9845678901", "Mumbai"),
    ("Surat Metals Co.", "+91 9856789012", "Surat"),
    ("Chennai Iron",     "+91 9867890123", "Chennai"),
]
customers = {}
for name, phone, city in customer_data:
    c = Customer(company_id=company.id, name=name, phone=phone, city=city)
    db.add(c)
    db.flush()
    customers[name] = c

# ---------------------------------------------------------------------------
# Orders (matches DashboardOrders mock data)
# ---------------------------------------------------------------------------
today = datetime.utcnow().replace(hour=10, minute=0, second=0, microsecond=0)

orders_data = [
    # order_num,       customer,          status,       channel,    items_sku, qty, unit_price,       order_offset_days, eta_offset
    ("SO-2024-8821", "Rajesh Metals",    "dispatched",  "whatsapp", "STL-B100", 50, 57000,  0, 1),
    ("SO-2024-8820", "Gupta Iron Works", "processing",  "manual",   "COP-R008", 12, 782000, 0, 3),
    ("SO-2024-8819", "Patel Alloys",     "pending",     "whatsapp", "MSA-5050", 200, 48000, 0, 4),
    ("SO-2024-8818", "Delhi Steel Depot","dispatched",  "manual",   "HRC-003",  80, 52000,  1, 0),
    ("SO-2024-8817", "Mumbai Traders",   "confirmed",   "whatsapp", "ZNC-I001", 5,  240000, 1, 2),
    ("SO-2024-8816", "Surat Metals Co.", "confirmed",   "manual",   "ALU-S003", 30, 216000, 2, 1),
    ("SO-2024-8815", "Chennai Iron",     "delivered",   "whatsapp", "STL-B100", 100, 57000, 3, -1),
]

for (
    order_num, cust_name, status, channel,
    sku, qty, unit_price, order_offset, eta_offset
) in orders_data:
    total = qty * unit_price
    order = Order(
        order_number=order_num,
        customer_id=customers[cust_name].id,
        company_id=company.id,
        status=status,
        channel=channel,
        total_amount=total,
        order_date=today - timedelta(days=order_offset),
        eta=today + timedelta(days=eta_offset) if eta_offset >= 0 else today - timedelta(days=abs(eta_offset)),
    )
    db.add(order)
    db.flush()

    line = OrderItem(
        order_id=order.id,
        product_id=products[sku].id,
        quantity=qty,
        unit_price=unit_price,
        subtotal=total,
    )
    db.add(line)

# ---------------------------------------------------------------------------
# Metal Prices (matches DashboardMarkets)
# ---------------------------------------------------------------------------
metal_data = [
    ("STL-100",  "Steel Billet",  "MCX",  48200,  47640, "#3B82F6"),
    ("COP-8MM",  "Copper Rod",    "MCX",  784500, 790800,"#F59E0B"),
    ("ALU-1050", "Aluminium",     "MCX",  218000, 213400,"#8B5CF6"),
    ("ZNC-SHG",  "Zinc Ingot",    "MCX",  241000, 241700,"#22C55E"),
    ("PB-99.97", "Lead Ingot",    "MCX",  187500, 186600,"#EF4444"),
    ("NI-99.8",  "Nickel",        "LME",  1420000,1391600,"#06B6D4"),
]
metals_db = {}
for code, name, exchange, price, prev, color in metal_data:
    m = MetalPrice(code=code, name=name, exchange=exchange, price=price,
                   prev_price=prev, color=color)
    db.add(m)
    db.flush()
    metals_db[code] = m

# 6-month history for STL, COP, ALU
history_data = {
    "STL-100": [45200, 46100, 44800, 46500, 47300, 48200],
    "COP-8MM": [768000, 771000, 760000, 775000, 780000, 784500],
    "ALU-1050":[207000, 210000, 208000, 213000, 215000, 218000],
}
for code, prices in history_data.items():
    metal = metals_db[code]
    for i, price in enumerate(prices):
        recorded = datetime.utcnow() - timedelta(days=(5 - i) * 30)
        db.add(MetalPriceHistory(metal_id=metal.id, price=price, recorded_at=recorded))

# AI forecasts
for metal_code, direction, confidence, target in [
    ("Steel",     "up",   87, 49800),
    ("Copper",    "down", 74, 772000),
    ("Aluminium", "up",   81, 224000),
]:
    db.add(AIForecast(
        metal_code=metal_code, direction=direction,
        confidence=confidence, target_price=target, period_days=30,
    ))

# ---------------------------------------------------------------------------
# Analytics — Revenue snapshots (12 months)
# ---------------------------------------------------------------------------
rev_12m = [42,48,45,54,61,58,67,72,78,84,91,98]
profit_pct = [0.19,0.21,0.20,0.24,0.26,0.26,0.28,0.29,0.31,0.32,0.32,0.33]
for i, (r, pp) in enumerate(zip(rev_12m, profit_pct)):
    month = datetime(2025, 7, 1) + timedelta(days=i * 30)
    db.add(RevenueSnapshot(
        company_id=company.id,
        period=month.strftime("%Y-%m"),
        revenue=r * 100000,
        profit=r * pp * 100000,
    ))

# Business health scores
db.add(BusinessHealthScore(
    company_id=company.id,
    revenue_growth=88,
    margin_health=74,
    customer_retention=92,
    inventory_efficiency=67,
    collections=58,
))

# ---------------------------------------------------------------------------
# Integrations
# ---------------------------------------------------------------------------
for name, status, detail in [
    ("WhatsApp Business", "connected",    "+91 98765 43210"),
    ("Tally Prime",       "connected",    "v6.6.3 · Sync every 15m"),
    ("MCX Data Feed",     "connected",    "Live · Latency 800ms"),
    ("Google Sheets",     "disconnected", "Not configured"),
    ("Zoho CRM",          "disconnected", "Not configured"),
]:
    db.add(Integration(company_id=company.id, name=name, status=status, detail=detail))

# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------
for typ, msg, mins_ago in [
    ("warn", "Zinc Ingot stock critically low — 44MT remaining", 2),
    ("ok",   "WhatsApp order SO-2024-8821 confirmed and dispatched", 8),
    ("warn", "Copper prices up 1.4% — margin impact on 3 open orders", 15),
    ("ok",   "Delhi North warehouse restocked: +800MT Steel Billets", 60),
]:
    db.add(Alert(
        company_id=company.id,
        type=typ,
        message=msg,
        created_at=datetime.utcnow() - timedelta(minutes=mins_ago),
    ))

db.commit()
db.close()
print("✅ Database seeded successfully!")
print("   Company: Sharma Metals Pvt. Ltd.")
print(f"   Admin login: rajesh@example.com / ayastra123")
print("   8 products, 8 inventory rows, 7 orders seeded")
