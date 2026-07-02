with open('train.py', 'r', encoding='utf-8') as f:
    content = f.read()

old = '    X = df[FEATURE_COLS]\n    y = df["target"]'
new = '''    X = df[FEATURE_COLS].replace([float("inf"), float("-inf")], float("nan")).dropna()
    y = df["target"].loc[X.index]'''

if old in content:
    content = content.replace(old, new)
    print("Fixed")
else:
    print("Pattern not found")

with open('train.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")