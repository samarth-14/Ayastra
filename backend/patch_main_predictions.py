with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import at top
old_import = 'from fastapi import'
new_import = '''import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from api.prediction_routes import router as prediction_router
from fastapi import'''

if 'prediction_router' not in content:
    content = content.replace(old_import, new_import, 1)
    print("Import added")
else:
    print("Import already present")

# Register router
old_app = 'app = FastAPI('
new_app = 'app = FastAPI('

# Find where other routers or app setup ends and add include
if 'app.include_router(prediction_router)' not in content:
    # Add after app = FastAPI(...) block — find first app. line after FastAPI init
    target = 'app.add_middleware('
    if target in content:
        content = content.replace(target, 'app.include_router(prediction_router)\n\n' + target, 1)
        print("Router registered")
    else:
        # fallback: add after FastAPI instantiation
        content = content.replace('app = FastAPI(', 'app = FastAPI(', 1)
        # find end of FastAPI(...) block
        idx = content.find('app = FastAPI(')
        end = content.find('\n\n', idx)
        content = content[:end] + '\n\napp.include_router(prediction_router)' + content[end:]
        print("Router registered (fallback)")
else:
    print("Router already registered")

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")