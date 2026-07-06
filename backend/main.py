
"""
Ayastra — FastAPI Backend
Complete API matching the frontend dashboard requirements.
"""
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime, timedelta
from typing import Optional, List
import os, math, httpx
import traceback
import uuid
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from api.prediction_routes import router as prediction_router
from fastapi import FastAPI, Depends, HTTPException, Query, Request, File, Form, UploadFile
from collections import defaultdict
import time
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, func
from sqlalchemy.orm import Session, sessionmaker
from models import (
    Base, Company, User, UserSettings, Warehouse,
    Product, InventoryItem, Customer, Order, OrderItem,
    MetalPrice, MetalPriceHistory, AIForecast,
    RevenueSnapshot, BusinessHealthScore, Integration, Alert,
    ScrapInventory, ScrapInventoryImage, BuyerPrice, BuyerPriceImage,
)
# ---------------------------------------------------------------------------
# DB setup
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ayastra.db")
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(DATABASE_URL)
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
# ---------------------------------------------------------------------------
# Auth helper - get current user from JWT token
# ---------------------------------------------------------------------------
def get_current_user_id(authorization: str = None, db: Session = None):
    """Extract and verify JWT token, return user."""
    return None  # Optional auth for now 
def verify_token(token: str) -> dict:
    """Verify JWT and return payload."""
    from jose import jwt, JWTError
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback-change-in-production")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token") 
def get_token_from_header(request: Request) -> str:
    """Extract Bearer token from Authorization header."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    return auth.split(" ")[1] 
def get_current_company_id(request: Request, db: Session = Depends(get_db)) -> int:
    """Get company_id from JWT token."""
    token = get_token_from_header(request)
    payload = verify_token(token)
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user.company_id
def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Get current user from JWT token."""
    token = get_token_from_header(request)
    payload = verify_token(token)
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user 
# ---------------------------------------------------------------------------
# Input Sanitization & Validation
# ---------------------------------------------------------------------------
import re as _re
def sanitize_string(value: str, max_length: int = 255) -> str:
    """Remove dangerous characters and limit length."""
    if not value:
        return value
    # Remove SQL injection patterns
    value = _re.sub(r"[;'\"\\]", "", value)
    # Remove script injection
    value = _re.sub(r"<[^>]+>", "", value)
    # Remove command injection chars
    value = _re.sub(r"[|&;`$]", "", value)
    return value.strip()[:max_length]
def validate_email(email: str) -> str:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not _re.match(pattern, email):
        raise HTTPException(status_code=422, detail="Invalid email format")
    return email.lower().strip()
# ---------------------------------------------------------------------------
# Password hashing (single shared context)
# ---------------------------------------------------------------------------
# NOTE: passlib 1.7.4 is incompatible with bcrypt >= 4.1 — its backend self-test
# calls bcrypt.hashpw() and bcrypt 5.x raises "password cannot be longer than 72
# bytes", so .hash()/.verify() throw. requirements.txt pins bcrypt==4.0.1; keep
# the installed version in sync (pip install -r requirements.txt) or signup 500s.
from passlib.context import CryptContext
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto") 
def hash_password(raw: str) -> str:
    """Hash a password, converting any backend failure into a CORS-visible 500.
    Unhandled exceptions escape via Starlette's ServerErrorMiddleware, which
    sits OUTSIDE CORSMiddleware, so the 500 carries no Access-Control-Allow-Origin
    header and the browser reports it as 'Network Error'. Raising HTTPException
    instead routes the response back through CORSMiddleware (headers intact).
    """
    try:
        return _pwd_context.hash(raw)
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Password hashing failed on the server.")
def verify_password(raw: str, hashed: str) -> bool:
    try:
        return _pwd_context.verify(raw, hashed)
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Password verification failed on the server.")
def validate_positive_number(value: float, field: str) -> float:
    """Ensure number is positive."""
    if value < 0:
        raise HTTPException(status_code=422, detail=f"{field} must be positive")
    return value
# ---------------------------------------------------------------------------
# Rate Limiting (in-memory, per IP)
# ---------------------------------------------------------------------------
from collections import defaultdict
import time as _time
_rate_store = defaultdict(list)  # ip -> [timestamps] 
def rate_limit(ip: str, endpoint: str, max_calls: int, window_seconds: int):
    """Raise 429 if IP exceeds max_calls in window_seconds."""
    key = f"{ip}:{endpoint}"
    now = _time.time()
    window_start = now - window_seconds
    # Purge old entries
    _rate_store[key] = [t for t in _rate_store[key] if t > window_start]
    if len(_rate_store[key]) >= max_calls:
        raise HTTPException(
            status_code=429,
            detail=f"Too many requests. Try again in {window_seconds} seconds."
        )
    _rate_store[key].append(now)
def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
 
# Simple in-memory rate limiter for login attempts
login_attempts: dict = defaultdict(list)
def check_rate_limit(ip: str, max_attempts: int = 5, window: int = 300):
    """Allow max 5 login attempts per IP per 5 minutes."""
    now = time.time()
    attempts = login_attempts[ip]
    # Remove old attempts outside window
    login_attempts[ip] = [t for t in attempts if now - t < window]
    if len(login_attempts[ip]) >= max_attempts:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please wait 5 minutes."
        )
    login_attempts[ip].append(now)
app.include_router(prediction_router)
# CORS. `allow_origins=["*"]` together with `allow_credentials=True` is invalid
# per the CORS spec — a browser rejects a wildcard origin on a credentialed
# request, which can surface as net::ERR_FAILED. This app authenticates with a
# Bearer token in the Authorization header (not cookies), so credentials are not
# needed and the wildcard stays valid. If explicit origins are provided via the
# ALLOWED_ORIGINS env var (comma-separated), honour them and re-enable
# credentials for future cookie-based auth.
_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "").strip()
if _allowed_origins_env:
    _allow_origins = [o.strip() for o in _allowed_origins_env.split(",") if o.strip()]
    _allow_credentials = True
else:
    _allow_origins = ["*"]
    _allow_credentials = False
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=_allow_credentials,
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
    is_onboarding_completed: bool = False
    marketplace_role: Optional[str] = None 
class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str
    company_name: str
class OnboardingRequest(BaseModel):
    marketplace_role: str   # "seller" | "buyer" | "both"
    # Personal details (name is pre-filled from signup/Google but editable here).
    full_name: Optional[str] = None
    # Optional company profile collected during onboarding (mainly for buyers,
    # so buying offers can be pre-filled and never re-typed).
    company_name: Optional[str] = None
    company_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    gst_number: Optional[str] = None
    contact_number: Optional[str] = None
class MarketplaceProfileUpdate(BaseModel):
    """Editable company/profile fields (Company Settings)."""
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    company_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    gst_number: Optional[str] = None
    contact_number: Optional[str] = None 
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
class SimpleInventoryCreate(BaseModel):
    product_name: str
    sku: Optional[str] = ""
    warehouse_name: Optional[str] = "Main Warehouse"
    quantity_on_hand: float
    unit: Optional[str] = "MT"
    unit_cost: Optional[float] = 0.0
    reorder_point: Optional[float] = 20.0
    status: Optional[str] = "ok"
    company_id: int 
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
    phone: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    gstin: Optional[str] = None
# --- Order ---
class OrderItemIn(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
class OrderCreate(BaseModel):
    customer_id: int
    channel: Optional[str] = "manual"
    items: List[OrderItemIn]
    eta: Optional[datetime] = None
    notes: Optional[str] = None 
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
@app.post("/auth/google", tags=["Auth"])
def google_auth(body: dict, db: Session = Depends(get_db)):
    email = body.get("email")
    full_name = body.get("full_name", email)
    print("=== GOOGLE AUTH START ===")
    print("Incoming email:", email)
    user = db.query(User).filter(User.email == email).first()
    print("Existing user:", user)
    if not user:
        print("Creating new company...")
        company = Company(
            name=f"{full_name} Business",
            industry="Metal Manufacturing",
        )
        db.add(company)
        db.flush()
        print("Company ID after flush:", company.id)
        user = User(
            full_name=full_name,
            email=email,
            password_hash="google-oauth",
            role="admin",
            company_id=company.id,
        )
        db.add(user)
        print("About to commit...")
        db.commit()
        print("Commit successful")
        db.refresh(user)
    print("Returning user:", user.id, user.email)
    print("=== GOOGLE AUTH END ===")
    from jose import jwt
    from datetime import datetime, timedelta
    token = jwt.encode(
        {"sub": user.email, "exp": datetime.utcnow() + timedelta(hours=24)},
        os.getenv("SECRET_KEY", "fallback-change-in-production"),
        algorithm="HS256"
    )
    return {
        "token": token,
        "user_id": user.id,
        "company_id": user.company_id,
        "full_name": user.full_name,
        "is_onboarding_completed": bool(user.is_onboarding_completed),
        "marketplace_role": user.marketplace_role,
    }
@app.post("/auth/signup", tags=["Auth"])
def signup(body: SignupRequest, request: Request, db: Session = Depends(get_db)):
    rate_limit(get_client_ip(request), "signup", max_calls=3, window_seconds=3600)
    # Validate and sanitize inputs
    body.email = validate_email(body.email)
    body.full_name = sanitize_string(body.full_name, 100)
    body.company_name = sanitize_string(body.company_name, 200)
    if len(body.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    password_hash = hash_password(body.password)  # CORS-visible 500 on backend failure
    company = Company(name=body.company_name, industry="Metal Manufacturing")
    db.add(company)
    db.flush()
    user = User(
        full_name=body.full_name,
        email=body.email,
        password_hash=password_hash,
        role="admin",
        company_id=company.id,
    )
    db.add(user)
    db.commit()
    from jose import jwt
    from datetime import datetime, timedelta
    token = jwt.encode({"sub": user.email, "exp": datetime.utcnow() + timedelta(hours=24)}, os.getenv("SECRET_KEY", "fallback-change-in-production"), algorithm="HS256")
    return {
        "message": "Account created",
        "token": token,
        "user_id": user.id,
        "company_id": company.id,
        "full_name": user.full_name,
        "is_onboarding_completed": bool(user.is_onboarding_completed),
        "marketplace_role": user.marketplace_role,
    }
@app.post("/auth/login", response_model=LoginResponse, tags=["Auth"])
def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):
    rate_limit(get_client_ip(request), "login", max_calls=5, window_seconds=60)
    check_rate_limit(request.client.host)
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")   
    # Block Google OAuth users from password login
    if user.password_hash == "google-oauth":
        raise HTTPException(status_code=401, detail="Please use Google Sign In for this account")   
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")   
    from jose import jwt
    from datetime import datetime, timedelta
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback-change-in-production")
    token = jwt.encode(
        {"sub": user.email, "exp": datetime.utcnow() + timedelta(hours=24)},
        SECRET_KEY,
        algorithm="HS256"
    )   
    return LoginResponse(
        token=token,
        user_id=user.id,
        full_name=user.full_name,
        role=user.role,
        company_id=user.company_id,
        is_onboarding_completed=bool(user.is_onboarding_completed),
        marketplace_role=user.marketplace_role,
    )
# ---------------------------------------------------------------------------
# Onboarding — marketplace role selection (runs once after first signup)
# ---------------------------------------------------------------------------
ALLOWED_MARKETPLACE_ROLES = {"seller", "buyer", "both"}
@app.post("/api/users/onboarding", tags=["Users"])
def complete_onboarding(body: OnboardingRequest, request: Request, db: Session = Depends(get_db)):
    """Persist the current user's marketplace role + company profile, and mark
    onboarding complete. Company details are optional so the flow stays backward
    compatible, but collecting them here means buyers never re-enter them."""
    current_user = get_current_user(request, db)
    role = (body.marketplace_role or "").strip().lower()
    if role not in ALLOWED_MARKETPLACE_ROLES:
        raise HTTPException(
            status_code=422,
            detail="marketplace_role must be one of: seller, buyer, both",
        )
    current_user.marketplace_role = role
    current_user.is_onboarding_completed = True
    if body.full_name:
        current_user.full_name = sanitize_string(body.full_name, 100) or current_user.full_name
    # Persist company/profile details onto the user's Company + User records.
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if company:
        if body.company_name:    company.name = sanitize_string(body.company_name, 200)
        if body.company_address: company.address = sanitize_string(body.company_address, 300)
        if body.city:            company.city = sanitize_string(body.city, 100)
        if body.state:           company.state = sanitize_string(body.state, 100)
        if body.gst_number is not None: company.gstin = sanitize_string(body.gst_number, 30) or None
    if body.contact_number is not None:
        current_user.contact_number = sanitize_string(body.contact_number, 20) 
    db.commit()
    return {
        "success": True,
        "marketplace_role": current_user.marketplace_role,
        "is_onboarding_completed": True,
    } 
# ---------------------------------------------------------------------------
# Marketplace — profile, listings, buyer offers, Supabase image uploads
# ---------------------------------------------------------------------------
SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").rstrip("/")
SUPABASE_SERVICE_KEY = (
    os.getenv("SUPABASE_SERVICE_KEY")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_KEY")
    or ""
) 
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
_EXT_BY_TYPE = {"image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024   # 5MB
MAX_IMAGES = 5
ALLOWED_METALS = {"Copper", "Aluminium", "Brass", "Steel", "Iron", "Lead", "Nickel", "Mixed Scrap"}
ALLOWED_UNITS = {"KG", "MT", "Ton"}
ALLOWED_SETTLEMENTS = {"Immediate", "Within 24 Hours", "Within 3 Days", "Within 7 Days", "Negotiable"}
def _read_and_validate_images(images):
    """Return a list of (bytes, content_type, ext), enforcing count/size/type."""
    files = [im for im in (images or []) if im is not None and getattr(im, "filename", "")]
    if len(files) > MAX_IMAGES:
        raise HTTPException(status_code=422, detail=f"At most {MAX_IMAGES} images are allowed.")
    out = []
    for im in files:
        ctype = (im.content_type or "").lower()
        if ctype not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(status_code=422, detail=f"Unsupported image type: {ctype or 'unknown'}. Use JPG, PNG or WEBP.")
        data = im.file.read()
        if len(data) > MAX_IMAGE_BYTES:
            raise HTTPException(status_code=422, detail=f"'{im.filename}' exceeds the 5MB limit.")
        if not data:
            continue
        out.append((data, ctype, _EXT_BY_TYPE.get(ctype, "jpg")))
    return out 
def _upload_images_to_supabase(bucket: str, folder: str, files) -> list:
    """Upload validated (bytes, ctype, ext) files to Supabase Storage and return
    their public URLs. Raises a clear 500 if storage isn't configured."""
    if not files:
        return []
    if not (SUPABASE_URL and SUPABASE_SERVICE_KEY):
        raise HTTPException(
            status_code=500,
            detail="Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY on the backend.",
        )
    urls = []
    with httpx.Client(timeout=30) as client:
        for i, (data, ctype, ext) in enumerate(files):
            path = f"{folder}/{i}_{uuid.uuid4().hex}.{ext}"
            r = client.post(
                f"{SUPABASE_URL}/storage/v1/object/{bucket}/{path}",
                content=data,
                headers={
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                    "Content-Type": ctype,
                    "x-upsert": "true",
                },
            )
            if r.status_code not in (200, 201):
                raise HTTPException(status_code=502, detail=f"Image upload failed ({r.status_code}): {r.text[:200]}")
            urls.append(f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}")
    return urls
def _profile_payload(user: User, db: Session) -> dict:
    company = db.query(Company).filter(Company.id == user.company_id).first()
    return {
        "full_name": user.full_name,
        "email": user.email,
        "marketplace_role": user.marketplace_role,
        "company_name": company.name if company else "",
        "company_address": (company.address if company else "") or "",
        "city": (company.city if company else "") or "",
        "state": (company.state if company else "") or "",
        "gst_number": (company.gstin if company else "") or "",
        "contact_number": user.contact_number or "",
    }
@app.get("/api/users/profile", tags=["Users"])
def get_profile(request: Request, db: Session = Depends(get_db)):
    """Current user's profile — used to pre-fill the Create Buying Offer form."""
    user = get_current_user(request, db)
    return _profile_payload(user, db) 
@app.put("/api/users/profile", tags=["Users"])
def update_profile(body: MarketplaceProfileUpdate, request: Request, db: Session = Depends(get_db)):
    """Edit company/profile details from Company Settings. Future offers use the
    updated values; already-published offers keep their snapshot."""
    user = get_current_user(request, db)
    company = db.query(Company).filter(Company.id == user.company_id).first()
    if company:
        if body.company_name is not None:    company.name = sanitize_string(body.company_name, 200) or company.name
        if body.company_address is not None: company.address = sanitize_string(body.company_address, 300)
        if body.city is not None:            company.city = sanitize_string(body.city, 100)
        if body.state is not None:           company.state = sanitize_string(body.state, 100)
        if body.gst_number is not None:      company.gstin = sanitize_string(body.gst_number, 30) or None
    if body.contact_number is not None:
        user.contact_number = sanitize_string(body.contact_number, 20)
    if body.full_name is not None:
        user.full_name = sanitize_string(body.full_name, 100) or user.full_name
    db.commit()
    return _profile_payload(user, db)
def _validate_marketplace_fields(metal, unit, quantity, settlement=None):
    if metal not in ALLOWED_METALS:
        raise HTTPException(status_code=422, detail=f"metal must be one of: {', '.join(sorted(ALLOWED_METALS))}")
    if unit not in ALLOWED_UNITS:
        raise HTTPException(status_code=422, detail="unit must be one of: KG, MT, Ton")
    if quantity is None or quantity <= 0:
        raise HTTPException(status_code=422, detail="quantity must be a positive number")
    if settlement is not None and settlement not in ALLOWED_SETTLEMENTS:
        raise HTTPException(status_code=422, detail=f"settlement_time must be one of: {', '.join(ALLOWED_SETTLEMENTS)}")
def _listing_payload(listing: ScrapInventory) -> dict:
    return {
        "id": listing.id,
        "seller_id": listing.seller_id,
        "metal": listing.metal,
        "quantity": listing.quantity,
        "unit": listing.unit,
        "grade": listing.grade or "",
        "description": listing.description or "",
        "city": listing.city or "",
        "state": listing.state or "",
        "images": [img.image_url for img in listing.images],
        "created_at": listing.created_at.isoformat() if listing.created_at else None,
    } 
def _offer_payload(offer: BuyerPrice) -> dict:
    return {
        "id": offer.id,
        "buyer_id": offer.buyer_id,
        "company_name": offer.company_name or "",
        "company_address": offer.company_address or "",
        "city": offer.city or "",
        "state": offer.state or "",
        "gst_number": offer.gst_number or "",
        "contact_number": offer.contact_number or "",
        "metal": offer.metal,
        "buying_price": offer.buying_price,
        "quantity": offer.quantity,
        "unit": offer.unit,
        "settlement_time": offer.settlement_time or "",
        "notes": offer.notes or "",
        "images": [img.image_url for img in offer.images],
        "created_at": offer.created_at.isoformat() if offer.created_at else None,
    }
@app.post("/api/scrap-listings", tags=["Marketplace"])
def create_scrap_listing(
    request: Request,
    metal: str = Form(...),
    quantity: float = Form(...),
    unit: str = Form(...),
    grade: str = Form(""),
    description: str = Form(""),
    city: str = Form(""),
    state: str = Form(""),
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    """Seller (or Both) publishes a scrap listing. Images → Supabase
    scrap-listings/{seller_id}/{listing_id}/; URLs → scrap_inventory_images."""
    user = get_current_user(request, db)
    if user.marketplace_role not in ("seller", "both"):
        raise HTTPException(status_code=403, detail="Only sellers can upload scrap.")
    _validate_marketplace_fields(metal, unit, quantity)
    validated = _read_and_validate_images(images) 
    listing = ScrapInventory(
        seller_id=user.id, metal=metal, quantity=quantity, unit=unit,
        grade=sanitize_string(grade, 100), description=sanitize_string(description, 1000),
        city=sanitize_string(city, 100), state=sanitize_string(state, 100),
    )
    db.add(listing)
    db.flush()  # obtain listing.id for the storage folder
    urls = _upload_images_to_supabase("scrap-listings", f"{user.id}/{listing.id}", validated)
    for url in urls:
        db.add(ScrapInventoryImage(scrap_inventory_id=listing.id, image_url=url))
    db.commit()
    db.refresh(listing)
    return {"success": True, "listing": _listing_payload(listing)}
@app.get("/api/scrap-listings", tags=["Marketplace"])
def list_scrap_listings(request: Request, mine: bool = False, db: Session = Depends(get_db)):
    """Active scrap listings. `mine=true` returns only the current user's."""
    q = db.query(ScrapInventory).filter(ScrapInventory.is_active == True)  # noqa: E712
    if mine:
        user = get_current_user(request, db)
        q = q.filter(ScrapInventory.seller_id == user.id)
    listings = q.order_by(ScrapInventory.created_at.desc()).all()
    return {"listings": [_listing_payload(l) for l in listings]}
@app.post("/api/buyer-offers", tags=["Marketplace"])
def create_buyer_offer(
    request: Request,
    metal: str = Form(...),
    buying_price: float = Form(...),
    quantity: float = Form(...),
    unit: str = Form(...),
    settlement_time: str = Form(""),
    notes: str = Form(""),
    # Company details are optional overrides; default to the saved profile.
    company_name: str = Form(None),
    company_address: str = Form(None),
    city: str = Form(None),
    state: str = Form(None),
    gst_number: str = Form(None),
    contact_number: str = Form(None),
    images: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    """Buyer (or Both) publishes a buying offer. Company details are snapshot
    from the saved profile (editable per offer). Images → Supabase
    buyer-offers/{buyer_id}/{offer_id}/; URLs → buyer_price_images."""
    user = get_current_user(request, db)
    if user.marketplace_role not in ("buyer", "both"):
        raise HTTPException(status_code=403, detail="Only buyers can create buying offers.")
    if settlement_time:
        _validate_marketplace_fields(metal, unit, quantity, settlement_time)
    else:
        _validate_marketplace_fields(metal, unit, quantity)
    if buying_price is None or buying_price <= 0:
        raise HTTPException(status_code=422, detail="buying_price must be a positive number")
    validated = _read_and_validate_images(images)
 
    profile = _profile_payload(user, db)
    offer = BuyerPrice(
        buyer_id=user.id,
        company_name=sanitize_string(company_name, 200) if company_name is not None else profile["company_name"],
        company_address=sanitize_string(company_address, 300) if company_address is not None else profile["company_address"],
        city=sanitize_string(city, 100) if city is not None else profile["city"],
        state=sanitize_string(state, 100) if state is not None else profile["state"],
        gst_number=sanitize_string(gst_number, 30) if gst_number is not None else profile["gst_number"],
        contact_number=sanitize_string(contact_number, 20) if contact_number is not None else profile["contact_number"],
        metal=metal, buying_price=buying_price, quantity=quantity, unit=unit,
        settlement_time=settlement_time or None, notes=sanitize_string(notes, 1000),
    )
    db.add(offer)
    db.flush()
    urls = _upload_images_to_supabase(
        "buyer-offers",
        f"{user.id}/{offer.id}",
        validated,
    )
 
    for index, url in enumerate(urls):
        db.add(
            BuyerPriceImage(
                buyer_price_id=offer.id,
                image_url=url,
                storage_path=url,
                display_order=index + 1,
            )
        )
    db.commit()
    db.refresh(offer)
    return {
        "success": True,
        "offer": _offer_payload(offer),
    }
@app.get("/api/buyer-offers", tags=["Marketplace"])
def list_buyer_offers(db: Session = Depends(get_db)):
    """All active buyer offers (Find Buyers). Public within the app."""
    offers = (
        db.query(BuyerPrice)
        .filter(BuyerPrice.is_active == True)  # noqa: E712
        .order_by(BuyerPrice.created_at.desc())
        .all()
    )
    return {"offers": [_offer_payload(o) for o in offers]}

# ---------------------------------------------------------------------------
# Marketplace analytics — Scrap Optimizer 7-day trend (real data only)
# ---------------------------------------------------------------------------
# Quantity → metric-tonne factor. Listings/offers may be priced per KG/MT/Ton;
# we normalise to MT so a metal's market price (quoted per MT) values it.
_UNIT_TO_MT = {"KG": 0.001, "MT": 1.0, "Ton": 1.0}


def _market_unit_prices(db: Session) -> dict:
    """Map each allowed metal → its current market price (₹ per MT) from the
    live MetalPrice table. Seller listings carry no price of their own, so their
    "sale value" is derived from the metal's real market quote. Metals without a
    quote map to 0 (they still contribute quantity, just no ₹ value)."""
    prices = {}
    rows = db.query(MetalPrice).all()
    for metal in ALLOWED_METALS:
        key = metal.lower()
        match = next((r for r in rows if r.name and key.split()[0] in r.name.lower()), None)
        prices[metal] = float(match.price) if match else 0.0
    return prices


@app.get("/api/marketplace/analytics", tags=["Marketplace"])
def marketplace_analytics(request: Request, db: Session = Depends(get_db)):
    """Real 7-day buying/selling activity for the current user, aggregated by
    day across ALL metals. Purchases come from the user's buyer offers (which
    carry a real price); sales come from the user's scrap listings, valued at
    the metal's current market price (listings store no price). Returns empty
    counts when there is no activity so the UI can show its empty state."""
    user = get_current_user(request, db)

    # Window = the last 7 calendar days, inclusive of today (UTC).
    today = datetime.utcnow().date()
    window_start = today - timedelta(days=6)
    start_dt = datetime(window_start.year, window_start.month, window_start.day)
    day_keys = [window_start + timedelta(days=i) for i in range(7)]

    # bucket[date][metal] = {"quantity": q, "value": v, "unit": unit}
    def _empty_buckets():
        return {d: {} for d in day_keys}

    purchase_buckets = _empty_buckets()
    sale_buckets = _empty_buckets()

    # ── Purchases: the user's buyer offers (real per-unit price). ──
    offers = (
        db.query(BuyerPrice)
        .filter(BuyerPrice.buyer_id == user.id, BuyerPrice.created_at >= start_dt)
        .all()
    )
    for o in offers:
        d = o.created_at.date()
        if d not in purchase_buckets:
            continue
        slot = purchase_buckets[d].setdefault(o.metal, {"quantity": 0.0, "value": 0.0, "unit": o.unit})
        slot["quantity"] += o.quantity
        slot["value"] += o.buying_price * o.quantity

    # ── Sales: the user's scrap listings, valued at current market price. ──
    unit_prices = _market_unit_prices(db)
    listings = (
        db.query(ScrapInventory)
        .filter(ScrapInventory.seller_id == user.id, ScrapInventory.created_at >= start_dt)
        .all()
    )
    for l in listings:
        d = l.created_at.date()
        if d not in sale_buckets:
            continue
        qty_mt = l.quantity * _UNIT_TO_MT.get(l.unit, 1.0)
        value = unit_prices.get(l.metal, 0.0) * qty_mt
        slot = sale_buckets[d].setdefault(l.metal, {"quantity": 0.0, "value": 0.0, "unit": l.unit})
        slot["quantity"] += l.quantity
        slot["value"] += value

    def _serialise(buckets):
        series = []
        for d in day_keys:
            metals = []
            total = 0.0
            for metal, agg in buckets[d].items():
                qty = agg["quantity"]
                val = agg["value"]
                total += val
                metals.append({
                    "metal": metal,
                    "quantity": round(qty, 3),
                    "unit": agg["unit"],
                    "price": round(val / qty, 2) if qty else 0.0,  # effective ₹/unit
                    "value": round(val, 2),
                })
            series.append({
                "date": d.isoformat(),
                "label": d.strftime("%a"),
                "total": round(total, 2),
                "metals": metals,
            })
        return series

    purchase_series = _serialise(purchase_buckets)
    sale_series = _serialise(sale_buckets)

    return {
        "role": user.marketplace_role,
        "purchases": {"series": purchase_series, "count": len(offers)},
        "sales": {"series": sale_series, "count": len(listings)},
    }


@app.get("/api/marketplace/best-buyer-rate", tags=["Marketplace"])
def best_buyer_rate(db: Session = Depends(get_db)):
    """Highest active buyer offer from buyer_prices — powers the seller's
    "Best Buyer's Rate" card with live data. Returns best_rate=None when no
    active offers exist so the UI can fall back to an empty state."""
    offer = (
        db.query(BuyerPrice)
        .filter(BuyerPrice.is_active == True)  # noqa: E712
        .order_by(BuyerPrice.buying_price.desc())
        .first()
    )
    if not offer:
        return {"best_rate": None, "metal": None, "unit": None, "company_name": None, "city": None, "state": None}
    return {
        "best_rate": offer.buying_price,
        "metal": offer.metal,
        "unit": offer.unit,
        "company_name": offer.company_name or "",
        "city": offer.city or "",
        "state": offer.state or "",
    }

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
 
 
@app.post("/inventory/simple", tags=["Inventory"])
def add_simple_inventory(body: SimpleInventoryCreate, request: Request, db: Session = Depends(get_db)):
    rate_limit(get_client_ip(request), "inventory_write", max_calls=30, window_seconds=60)
    warehouse = db.query(Warehouse).filter(
        Warehouse.company_id == body.company_id
    ).first()
    if not warehouse:
        warehouse = Warehouse(
            name=body.warehouse_name or "Main Warehouse",
            company_id=body.company_id,
        )
        db.add(warehouse)
        db.flush()
    product = db.query(Product).filter(Product.name == body.product_name).first()
    if not product:
        import uuid
        sku = body.sku or (body.product_name[:8].upper().replace(" ", "-") + "-" + str(uuid.uuid4())[:4].upper())
        product = Product(name=body.product_name, sku=sku, unit=body.unit or "MT")
        db.add(product)
        db.flush()
    item = InventoryItem(
        product_id=product.id,
        warehouse_id=warehouse.id,
        quantity=body.quantity_on_hand,
        cost_price=body.unit_cost or 0.0,
        reorder_point=body.reorder_point or 20.0,
    )
    db.add(item)
    db.commit()
    return {"message": "SKU added successfully", "product": body.product_name}
 
 
@app.get("/inventory", tags=["Inventory"])
def list_inventory(  # patched
 
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
def inventory_kpis(company_id: int, request: Request, db: Session = Depends(get_db)):
    rate_limit(get_client_ip(request), "inventory_read", max_calls=60, window_seconds=60)
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
def add_inventory(body: InventoryCreate, request: Request, db: Session = Depends(get_db)):
    rate_limit(get_client_ip(request), "inventory_write", max_calls=30, window_seconds=60)
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
def update_inventory(item_id: int, body: InventoryUpdate, request: Request, db: Session = Depends(get_db)):
    """Update quantity / cost / reorder for a specific inventory row."""
    current_user = get_current_user(request, db)
    item = db.query(InventoryItem).join(Warehouse).filter(
        InventoryItem.id == item_id,
        Warehouse.company_id == current_user.company_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found or access denied")
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
def delete_inventory(item_id: int, request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user(request, db)
    item = db.query(InventoryItem).join(Warehouse).filter(
        InventoryItem.id == item_id,
        Warehouse.company_id == current_user.company_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found or access denied")
    db.delete(item)
    db.commit()
    return {"deleted": item_id}
 
 
# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------
 
@app.get("/products", tags=["Products"])
def list_products(company_id: Optional[int] = None, db: Session = Depends(get_db)):
    if company_id:
        # Return only products that have inventory for this company
        items = db.query(InventoryItem).join(Warehouse).filter(
            Warehouse.company_id == company_id
        ).all()
        product_ids = list({i.product_id for i in items})
        products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    else:
        products = db.query(Product).all()
    return [{"id": p.id, "name": p.name, "sku": p.sku, "category": p.category, "unit": p.unit, "cost_price": None} for p in products]
 
 
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
    # Validate inputs
    body.name = sanitize_string(body.name, 200)
    if body.email:
        body.email = validate_email(body.email)
    if body.phone:
        body.phone = _re.sub(r'[^0-9+\-\s]', '', body.phone)[:20]
    c = Customer(company_id=company_id, **body.dict())
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"id": c.id, "name": c.name}
 
 
# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------
 
@app.get("/orders", tags=["Orders"])
def list_orders(  # patched
 
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
def create_order(company_id: int, body: OrderCreate, request: Request, db: Session = Depends(get_db)):
    rate_limit(get_client_ip(request), "orders_write", max_calls=20, window_seconds=60)
    """Create a new sales order with line items."""
    order_number = _generate_order_number(db)
    total = sum(i.quantity * i.unit_price for i in body.items)
 
    order = Order(
        order_number=order_number,
        customer_id=body.customer_id,
        company_id=company_id,
        channel=body.channel if body.channel in ['whatsapp', 'manual'] else 'manual',
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
    # Deduct inventory for each line item
    for it in body.items:
        inv = db.query(InventoryItem).filter(
            InventoryItem.product_id == it.product_id
        ).first()
        if inv:
            inv.quantity = max(0.0, inv.quantity - it.quantity)
    db.commit()
    db.refresh(order)
    return {"id": order.id, "order_number": order.order_number, "total": total}
@app.patch("/orders/{order_id}/status", tags=["Orders"])
def update_order_status(order_id: int, body: OrderStatusUpdate, request: Request, db: Session = Depends(get_db)):
    """Update order status (pending → confirmed → processing → dispatched → delivered)."""
    current_user = get_current_user(request, db)
    valid = ["pending", "confirmed", "processing", "dispatched", "delivered"]
    if body.status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid}")
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.company_id == current_user.company_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found or access denied")
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
def get_profile(user_id: int, request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user(request, db)
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
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
def update_profile(user_id: int, body: ProfileUpdate, request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user(request, db)
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
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
def get_company(company_id: int, request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user(request, db)
    if current_user.company_id != company_id:
        raise HTTPException(status_code=403, detail="Access denied")
    c = db.query(Company).filter(Company.id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"name": c.name, "gstin": c.gstin, "address": c.address, "industry": c.industry} 
@app.patch("/settings/company/{company_id}", tags=["Settings"])
def update_company(company_id: int, body: CompanyUpdate, request: Request, db: Session = Depends(get_db)):
    current_user = get_current_user(request, db)
    if current_user.company_id != company_id:
        raise HTTPException(status_code=403, detail="Access denied")
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
    return {"status": "saved "}
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