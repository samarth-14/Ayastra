with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''class CustomerCreate(BaseModel):
    name: str
    phone: Optional[str]
    email: Optional[str]
    city: Optional[str]
    gstin: Optional[str]'''

new = '''class CustomerCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    gstin: Optional[str] = None'''

if old in content:
    content = content.replace(old, new)
    open('main.py', 'w', encoding='utf-8').write(content)
    print("Done")
else:
    print("Pattern not found")