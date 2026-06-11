content = open('main.py', 'r').read()

# Find the first occurrence and remove it
first = content.find('@app.post("/auth/signup"')
second = content.find('@app.post("/auth/signup"', first + 1)

# Remove everything from first occurrence up to second occurrence
content = content[:first] + content[second:]

open('main.py', 'w').write(content)
print("Done")