# Run this to add signup endpoint to main.py
new_endpoint = '''
@app.post("/auth/signup", tags=["Auth"])
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    from passlib.context import CryptContext
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Create company first
    company = Company(
        name=body.company_name,
        industry="Metal Manufacturing",
    )
    db.add(company)
    db.flush()
    
    # Create user
    user = User(
        full_name=body.full_name,
        email=body.email,
        password_hash=pwd.hash(body.password),
        role="admin",
        company_id=company.id,
    )
    db.add(user)
    db.commit()
    
    from jose import jwt
    from datetime import datetime, timedelta
    token = jwt.encode(
        {"sub": user.email, "exp": datetime.utcnow() + timedelta(hours=24)},
        "ayastra-secret-key",
        algorithm="HS256"
    )
    
    return {
        "message": "Account created successfully",
        "token": token,
        "user_id": user.id,
        "company_id": company.id,
        "full_name": user.full_name,
    }
'''

signup_model = '''
class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str
    company_name: str
'''

content = open('main.py', 'r').read()

# Add SignupRequest model after LoginResponse
insert_after = 'class LoginResponse(BaseModel):\n    token: str\n    user_id: int\n    full_name: str\n    role: str\n    company_id: int'
content = content.replace(insert_after, insert_after + '\n' + signup_model)

# Add signup endpoint before login endpoint
insert_before = '@app.post("/auth/login"'
content = content.replace(insert_before, new_endpoint + '\n' + insert_before)

open('main.py', 'w').write(content)
print("Done")