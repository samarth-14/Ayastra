with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add validation helper after imports
validation_code = '''
# ---------------------------------------------------------------------------
# Input Sanitization & Validation
# ---------------------------------------------------------------------------
import re as _re

def sanitize_string(value: str, max_length: int = 255) -> str:
    """Remove dangerous characters and limit length."""
    if not value:
        return value
    # Remove SQL injection patterns
    value = _re.sub(r"[';\"\\]", "", value)
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

def validate_positive_number(value: float, field: str) -> float:
    """Ensure number is positive."""
    if value < 0:
        raise HTTPException(status_code=422, detail=f"{field} must be positive")
    return value

'''

# Insert after the IDOR helper functions
insert_after = '# Simple in-memory rate limiter for login attempts'
content = content.replace(insert_after, validation_code + insert_after)

# Add validation to signup endpoint
old_signup = '''def signup(body: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    from passlib.context import CryptContext
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    company = Company(name=body.company_name, industry="Metal Manufacturing")'''

new_signup = '''def signup(body: SignupRequest, db: Session = Depends(get_db)):
    # Validate and sanitize inputs
    body.email = validate_email(body.email)
    body.full_name = sanitize_string(body.full_name, 100)
    body.company_name = sanitize_string(body.company_name, 200)
    if len(body.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    from passlib.context import CryptContext
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    company = Company(name=body.company_name, industry="Metal Manufacturing")'''

if old_signup in content:
    content = content.replace(old_signup, new_signup)
    print("Signup validation added")
else:
    print("Signup pattern not found")

# Add validation to inventory simple endpoint
old_inv = '''def add_simple_inventory(body: SimpleInventoryCreate, db: Session = Depends(get_db)):
    # Find or create product'''

new_inv = '''def add_simple_inventory(body: SimpleInventoryCreate, db: Session = Depends(get_db)):
    # Validate inputs
    body.product_name = sanitize_string(body.product_name, 200)
    body.sku = sanitize_string(body.sku or "", 50)
    body.warehouse_name = sanitize_string(body.warehouse_name or "Main Warehouse", 200)
    body.quantity_on_hand = validate_positive_number(body.quantity_on_hand, "Quantity")
    body.unit_cost = validate_positive_number(body.unit_cost or 0, "Unit cost")
    # Find or create product'''

if old_inv in content:
    content = content.replace(old_inv, new_inv)
    print("Inventory validation added")
else:
    print("Inventory pattern not found")

# Add validation to customer creation
old_cust = '''def create_customer(company_id: int, body: CustomerCreate, db: Session = Depends(get_db)):
    c = Customer(company_id=company_id, **body.dict())'''

new_cust = '''def create_customer(company_id: int, body: CustomerCreate, db: Session = Depends(get_db)):
    # Validate inputs
    body.name = sanitize_string(body.name, 200)
    if body.email:
        body.email = validate_email(body.email)
    if body.phone:
        body.phone = _re.sub(r'[^0-9+\-\s]', '', body.phone)[:20]
    c = Customer(company_id=company_id, **body.dict())'''

if old_cust in content:
    content = content.replace(old_cust, new_cust)
    print("Customer validation added")
else:
    print("Customer pattern not found")

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")