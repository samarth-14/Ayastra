new_endpoint = '''
@app.post("/auth/signup", tags=["Auth"])
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    from passlib.context import CryptContext
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
    company = Company(name=body.company_name, industry="Metal Manufacturing")
    db.add(company)
    db.flush()
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
    token = jwt.encode({"sub": user.email, "exp": datetime.utcnow() + timedelta(hours=24)}, "ayastra-secret-key", algorithm="HS256")
    return {"message": "Account created", "token": token, "user_id": user.id, "company_id": company.id, "full_name": user.full_name}

'''

content = open('main.py', 'r').read()
insert_before = '@app.post("/auth/login"'
content = content.replace(insert_before, new_endpoint + insert_before)
open('main.py', 'w').write(content)
print("Done")