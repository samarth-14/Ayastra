with open('models.py', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''    channel      = Column(
        Enum("whatsapp", "manual", name="order_channel"), default="manual"
    )'''

new = '''    channel      = Column(String, default="manual")'''

if old in content:
    content = content.replace(old, new)
    with open('models.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Done")
else:
    print("Pattern not found")