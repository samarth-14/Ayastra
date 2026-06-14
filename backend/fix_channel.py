with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

old = "channel: Optional[str] = \"manual\""
new = "channel: Optional[str] = \"manual\"  # whatsapp, manual, or any string"

# Fix the Order model channel column to use String instead of Enum
content = content.replace(
    "channel=body.channel,",
    "channel=body.channel if body.channel in ['whatsapp', 'manual'] else 'manual',"
)

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")