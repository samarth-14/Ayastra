with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''    db.commit()
    db.refresh(order)
    return {"id": order.id, "order_number": order.order_number, "total": total}'''

new = '''    # Deduct inventory for each line item
    for it in body.items:
        inv = db.query(InventoryItem).filter(
            InventoryItem.product_id == it.product_id
        ).first()
        if inv:
            inv.quantity = max(0.0, inv.quantity - it.quantity)
    db.commit()
    db.refresh(order)
    return {"id": order.id, "order_number": order.order_number, "total": total}'''

if old in content:
    content = content.replace(old, new, 1)
    open('main.py', 'w', encoding='utf-8').write(content)
    print("Done")
else:
    print("Pattern not found")