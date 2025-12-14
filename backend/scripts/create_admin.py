#!/usr/bin/env python3

import os
from passlib.context import CryptContext
from sqlalchemy.orm import sessionmaker
from config.database import engine, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin():
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        hashed_password = get_password_hash('admin123')
        
        admin = User(
            name='Admin User',
            email='admin@learnroot.com',
            password=hashed_password,
            role='super_admin'
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print('✅ Admin user created successfully!')
        print('📧 Email: admin@learnroot.com')
        print('🔑 Password: admin123')
        print(f'🆔 User ID: {admin.id}')
        
    except Exception as e:
        if "Duplicate entry" in str(e):
            print('ℹ️  Admin user already exists')
            print('📧 Email: admin@learnroot.com')
            print('🔑 Password: admin123')
        else:
            print(f'❌ Error creating admin: {e}')
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()