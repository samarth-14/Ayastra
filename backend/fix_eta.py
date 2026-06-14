with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''class OrderCreate(BaseModel):
    customer_id: int
    channel: Optional[str] = "manual"
    items: List[OrderItemIn]
    eta: Optional[datetime]
    notes: Optional[str]'''

new = '''class OrderCreate(BaseModel):
    customer_id: int
    channel: Optional[str] = "manual"
    items: List[OrderItemIn]
    eta: Optional[datetime] = None
    notes: Optional[str] = None'''

if old in content:
    content = content.replace(old, new)
    open('main.py', 'w', encoding='utf-8').write(content)
    print("Done")
else:
    print("Pattern not found")