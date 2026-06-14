with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''app.get("/products", tags=["Products"])
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return [{"id": p.id, "name": p.name, "sku": p.sku, "category": p.category, "unit": p.unit} for p in products]'''

new = '''app.get("/products", tags=["Products"])
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
    return [{"id": p.id, "name": p.name, "sku": p.sku, "category": p.category, "unit": p.unit, "cost_price": None} for p in products]'''

if old in content:
    content = content.replace(old, new)
    open('main.py', 'w', encoding='utf-8').write(content)
    print("Done")
else:
    print("Pattern not found")