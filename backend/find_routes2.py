content = open('main.py', encoding='utf-8').read()
lines = content.split('\n')
for i, l in enumerate(lines):
    if l.strip().startswith('def ') and ('order' in l.lower() or 'inventor' in l.lower() or 'market' in l.lower() or 'login' in l.lower()):
        print(f'Line {i+1}: {l}')