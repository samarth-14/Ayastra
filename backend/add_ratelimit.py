with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

rate_limit_code = '''
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

'''

# Insert after the sanitization block
insert_after = "# Simple in-memory rate limiter for login attempts"
if insert_after in content:
    content = content.replace(insert_after, rate_limit_code + insert_after)
    print("Rate limit helpers inserted")
else:
    # fallback: insert after imports area
    content = rate_limit_code + content
    print("Rate limit helpers inserted at top (fallback)")

# --- Login endpoint ---
old_login = 'def login(body: LoginRequest, db: Session = Depends(get_db)):'
new_login = 'def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):\n    rate_limit(get_client_ip(request), "login", max_calls=5, window_seconds=60)'
if old_login in content:
    content = content.replace(old_login, new_login)
    print("Login rate limit added")
else:
    print("Login pattern not found")

# --- Signup endpoint ---
old_signup = 'def signup(body: SignupRequest, db: Session = Depends(get_db)):'
new_signup = 'def signup(body: SignupRequest, request: Request, db: Session = Depends(get_db)):\n    rate_limit(get_client_ip(request), "signup", max_calls=3, window_seconds=3600)'
if old_signup in content:
    content = content.replace(old_signup, new_signup)
    print("Signup rate limit added")
else:
    print("Signup pattern not found")

# --- General API endpoints (inventory, orders, markets) ---
for endpoint, route in [
    ("inventory_list", 'def get_simple_inventory('),
    ("orders_list",   'def get_orders('),
    ("markets",       'def get_market_prices('),
]:
    old = f'{route}company_id: int, db: Session = Depends(get_db)):'
    new = f'{route}company_id: int, request: Request, db: Session = Depends(get_db)):\n    rate_limit(get_client_ip(request), "{endpoint}", max_calls=60, window_seconds=60)'
    if old in content:
        content = content.replace(old, new)
        print(f"{endpoint} rate limit added")
    else:
        print(f"{endpoint} pattern not found")

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")