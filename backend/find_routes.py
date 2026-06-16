content = open('main.py', encoding='utf-8').read()
lines = content.split('\n')
for i, l in enumerate(lines):
    if any(x in l for x in ['def login', 'def get_simple_inventory', 'def get_orders', 'def get_market']):
        print(f'Line {i+1}: {l}')