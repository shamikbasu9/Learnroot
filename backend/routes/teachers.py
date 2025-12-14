from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from config.database import get_db, User, Teacher
from middleware.auth import get_current_user, check_role
from passlib.context import CryptContext
from datetime import date

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

class TeacherCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    grade: str
    subjects: str

class TeacherUpdate(BaseModel):
    name: str = None
    email: EmailStr = None
    grade: str = None
    subjects: str = None

@router.get("/", response_model=dict)
def get_teachers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    teachers = db.query(User).join(Teacher, User.id == Teacher.user_id).filter(
        User.role.in_(['moderator', 'teacher'])
    ).all()
    
    result = []
    for user in teachers:
        teacher_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at,
            "phone": user.teacher.phone if user.teacher else None,
            "gender": user.teacher.gender if user.teacher else None,
            "qualification": user.teacher.qualification if user.teacher else None,
            "experience_years": user.teacher.experience_years if user.teacher else None,
            "grade": user.teacher.grade if user.teacher else None,
            "subjects": user.teacher.subjects if user.teacher else None,
            "joining_date": user.teacher.joining_date if user.teacher else None,
            "salary": user.teacher.salary if user.teacher else None,
            "address": user.teacher.address if user.teacher else None,
            "status": user.teacher.status if user.teacher else None
        }
        result.append(teacher_data)
    
    return {"success": True, "data": result}

@router.post("/", response_model=dict)
def create_teacher(
    teacher: TeacherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(['school_admin']))
):
    # Validate input
    if not teacher.name:
        raise HTTPException(status_code=400, detail="Name is required")
    if len(teacher.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if not teacher.grade:
        raise HTTPException(status_code=400, detail="Grade is required")
    if not teacher.subjects:
        raise HTTPException(status_code=400, detail="Subject is required")
    
    # Check if email exists
    existing_user = db.query(User).filter(User.email == teacher.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create user and teacher
    hashed_password = get_password_hash(teacher.password)
    
    # Start transaction
    try:
        # Create user
        db_user = User(name=teacher.name, email=teacher.email, password=hashed_password, role='moderator')
        db.add(db_user)
        db.flush()  # Get user ID
        
        # Create teacher profile
        db_teacher = Teacher(
            user_id=db_user.id,
            name=teacher.name,
            email=teacher.email,
            grade=teacher.grade,
            subjects=teacher.subjects,
            joining_date=date.today(),
            role='teacher'
        )
        db.add(db_teacher)
        
        db.commit()
        db.refresh(db_user)
        
        return {
            "success": True,
            "message": "Teacher added successfully",
            "data": {
                "id": db_user.id,
                "name": db_user.name,
                "email": db_user.email,
                "grade": db_teacher.grade,
                "subjects": db_teacher.subjects
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Server error")

@router.put("/{teacher_id}", response_model=dict)
def update_teacher(
    teacher_id: int,
    teacher_update: TeacherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(['school_admin']))
):
    # Check if teacher exists
    db_user = db.query(User).filter(
        User.id == teacher_id,
        User.role.in_(['moderator', 'teacher'])
    ).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Check email uniqueness if updating email
    if teacher_update.email:
        existing = db.query(User).filter(
            User.email == teacher_update.email,
            User.id != teacher_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
    
    # Update user
    update_data = teacher_update.dict(exclude_unset=True)
    user_fields = ['name', 'email']
    teacher_fields = ['grade', 'subjects']
    
    user_updates = {k: v for k, v in update_data.items() if k in user_fields}
    teacher_updates = {k: v for k, v in update_data.items() if k in teacher_fields}
    
    if user_updates:
        for key, value in user_updates.items():
            setattr(db_user, key, value)
    
    if teacher_updates:
        db_teacher = db.query(Teacher).filter(Teacher.user_id == teacher_id).first()
        if db_teacher:
            for key, value in teacher_updates.items():
                setattr(db_teacher, key, value)
    
    db.commit()
    
    return {"success": True, "message": "Teacher updated successfully"}

@router.delete("/{teacher_id}", response_model=dict)
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_role(['school_admin']))
):
    # Check if teacher exists
    db_user = db.query(User).filter(
        User.id == teacher_id,
        User.role.in_(['moderator', 'teacher'])
    ).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Delete user (cascade will handle teacher)
    db.delete(db_user)
    db.commit()
    
    return {"success": True, "message": "Teacher deleted successfully"}

@router.get("/{teacher_id}", response_model=dict)
def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_user = db.query(User).join(Teacher, User.id == Teacher.user_id).filter(
        User.id == teacher_id,
        User.role.in_(['moderator', 'teacher'])
    ).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    teacher_data = {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "created_at": db_user.created_at,
        "phone": db_user.teacher.phone if db_user.teacher else None,
        "gender": db_user.teacher.gender if db_user.teacher else None,
        "qualification": db_user.teacher.qualification if db_user.teacher else None,
        "experience_years": db_user.teacher.experience_years if db_user.teacher else None,
        "grade": db_user.teacher.grade if db_user.teacher else None,
        "subjects": db_user.teacher.subjects if db_user.teacher else None,
        "joining_date": db_user.teacher.joining_date if db_user.teacher else None,
        "salary": db_user.teacher.salary if db_user.teacher else None,
        "address": db_user.teacher.address if db_user.teacher else None,
        "status": db_user.teacher.status if db_user.teacher else None
    }
    
    return {"success": True, "data": teacher_data}