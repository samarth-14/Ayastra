from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Product, BrassPrice, ScrapInventory
import os
import requests
from dotenv import load_dotenv
from pydantic import BaseModel
from auth import hash_password, verify_password, create_access_token, get_current_user
from models import Product, BrassPrice, ScrapInventory, User

load_dotenv()
ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ayastra API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency — opens and closes DB connection per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- INVENTORY ENDPOINTS ---

@app.get("/products")
def get_all_products(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Product).all()

@app.put("/products/{product_id}/stock")
def update_stock(product_id: int, quantity: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.stock = quantity
    db.commit()
    return {"message": "Stock updated", "product": product.name, "new_stock": quantity}

# --- BRASS PRICE ENDPOINTS ---

@app.get("/brass-prices")
def get_brass_prices(db: Session = Depends(get_db)):
    return db.query(BrassPrice).order_by(BrassPrice.recorded_at).all()

@app.post("/brass-prices")
def add_brass_price(price: float, db: Session = Depends(get_db)):
    new_price = BrassPrice(price_per_kg=price)
    db.add(new_price)
    db.commit()
    return {"message": "Price recorded", "price_per_kg": price}

# --- SCRAP OPTIMIZER ENDPOINT ---

@app.get("/scrap/recommendation")
def scrap_recommendation(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prices = db.query(BrassPrice).order_by(BrassPrice.recorded_at).all()
    if len(prices) < 2:
        return {"recommendation": "Not enough data yet"}
    
    latest = prices[-1].price_per_kg
    avg = sum(p.price_per_kg for p in prices) / len(prices)
    
    if latest > avg * 1.02:
        action = "SELL"
        reason = f"Current price ₹{latest} is above average ₹{avg:.0f} — good time to sell"
    else:
        action = "WAIT"
        reason = f"Current price ₹{latest} is below average ₹{avg:.0f} — wait for better rate"
    
    return {"action": action, "reason": reason, "current_price": latest, "7day_avg": round(avg, 2)}



# --- SELL ENDPOINT ---

@app.post("/products/{product_id}/sell")
def sell_product(product_id: int, quantity: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < quantity:
        raise HTTPException(status_code=400, detail=f"Not enough stock. Available: {product.stock}")
    
    product.stock -= quantity
    db.commit()
    
    return {
        "message": "Sale recorded",
        "product": product.name,
        "quantity_sold": quantity,
        "remaining_stock": product.stock
    }

# --- LIVE BRASS PRICE FETCH ---

@app.post("/brass-prices/fetch-live")
def fetch_live_brass_price(db: Session = Depends(get_db)):
    url = f"https://www.alphavantage.co/query?function=COPPER&interval=monthly&apikey={ALPHA_VANTAGE_KEY}"
    
    response = requests.get(url)
    data = response.json()
    
    if "data" not in data:
        raise HTTPException(status_code=500, detail="Failed to fetch price data")
    
    latest = data["data"][0]
    price_usd_per_ton = float(latest["value"])
    price_inr_per_kg = round((price_usd_per_ton / 1000) * 84, 2)
    price = price_inr_per_kg
    
    new_price = BrassPrice(price_per_kg=price)
    db.add(new_price)
    db.commit()
    
    return {
        "message": "Live price fetched and saved",
        "price_per_kg": price,
        "date": latest["date"]
    }


# --- AUTH ENDPOINTS ---

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/auth/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        name=request.name,
        email=request.email,
        hashed_password=hash_password(request.password)
    )
    db.add(new_user)
    db.commit()
    return {"message": "Account created successfully", "email": request.email}

@app.post("/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "name": user.name}

@app.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}