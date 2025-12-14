from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from config.database import get_db, User
from middleware.auth import create_access_token, get_current_user
import re

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user: dict

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def validate_role(role: str):
    allowed_roles = ['super_admin', 'school_admin', 'moderator']
    if role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role")

@router.post("/register", response_model=dict)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Validate input
    if len(user.name) < 3:
        raise HTTPException(status_code=400, detail="Name must be at least 3 characters")
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    validate_role(user.role)
    
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create user
    hashed_password = get_password_hash(user.password)
    db_user = User(name=user.name, email=user.email, password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {
        "success": True,
        "message": "User registered successfully",
        "data": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role
        }
    }

@router.post("/login", response_model=dict)
def login(user: UserLogin, db: Session = Depends(get_db)):
    # Find user
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create token
    access_token = create_access_token(
        data={"userId": db_user.id, "email": db_user.email, "role": db_user.role}
    )
    
    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "token": access_token,
            "user": {
                "id": db_user.id,
                "name": db_user.name,
                "email": db_user.email,
                "role": db_user.role
            }
        }
    }

@router.get("/me", response_model=dict)
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "data": {
            "user": {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email,
                "role": current_user.role,
                "created_at": current_user.created_at
            }
        }
    }

@router.post("/logout", response_model=dict)
def logout():
    return {"success": True, "message": "Logout successful"}

@router.post("/forgot-password", response_model=dict)
def forgot_password(email: EmailStr, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == email).first()
    
    # Always return success for security
    return {
        "success": True,
        "message": "If an account with that email exists, a password reset link has been sent"
    }

@router.post("/reset-password", response_model=dict)
def reset_password(token: str, password: str):
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # TODO: Implement token validation and password reset
    return {"success": True, "message": "Password reset successful"}