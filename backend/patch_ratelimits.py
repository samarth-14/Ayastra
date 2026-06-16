with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

patches = [
    # Login - already has request, just add rate_limit call inside body
    (
        'def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):',
        'def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):\n    rate_limit(get_client_ip(request), "login", max_calls=5, window_seconds=60)'
    ),
    # add_simple_inventory
    (
        'def add_simple_inventory(body: SimpleInventoryCreate, db: Session = Depends(get_db)):',
        'def add_simple_inventory(body: SimpleInventoryCreate, request: Request, db: Session = Depends(get_db)):\n    rate_limit(get_client_ip(request), "inventory_write", max_calls=30, window_seconds=60)'
    ),
    # list_inventory
    (
        'def list_inventory(',
        'def list_inventory(  # patched\n'
    ),
    # inventory_kpis
    (
        'def inventory_kpis(company_id: int, db: Session = Depends(get_db)):',
        'def inventory_kpis(company_id: int, request: Request, db: Session = Depends(get_db)):\n    rate_limit(get_client_ip(request), "inventory_read", max_calls=60, window_seconds=60)'
    ),
    # add_inventory
    (
        'def add_inventory(body: InventoryCreate, db: Session = Depends(get_db)):',
        'def add_inventory(body: InventoryCreate, request: Request, db: Session = Depends(get_db)):\n    rate_limit(get_client_ip(request), "inventory_write", max_calls=30, window_seconds=60)'
    ),
    # list_orders
    (
        'def list_orders(',
        'def list_orders(  # patched\n'
    ),
    # create_order
    (
        'def create_order(company_id: int, body: OrderCreate, db: Session = Depends(get_db)):',
        'def create_order(company_id: int, body: OrderCreate, request: Request, db: Session = Depends(get_db)):\n    rate_limit(get_client_ip(request), "orders_write", max_calls=20, window_seconds=60)'
    ),
]

for old, new in patches:
    if old in content:
        content = content.replace(old, new)
        print(f"Patched: {old[:60]}...")
    else:
        print(f"NOT FOUND: {old[:60]}...")

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")