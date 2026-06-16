with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

old = 'value = _re.sub(r"[\';\"\\]", "", value)'
new = "value = _re.sub(r\"[';\\\"]\", \"\", value)"

if old in content:
    content = content.replace(old, new)
    print("Fixed")
else:
    # Find the line manually
    for i, line in enumerate(content.split('\n')):
        if '_re.sub' in line and 'value' in line and i < 120:
            print(f"Line {i}: {line}")