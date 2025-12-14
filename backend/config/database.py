import os
from sqlalchemy import create_engine, Column, Integer, String, Text, Date, Time, DateTime, Enum, DECIMAL, JSON, ForeignKey, UniqueConstraint, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.pool import QueuePool
from dotenv import load_dotenv

load_dotenv()

load_dotenv()

DATABASE_URL = f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', '')}@{os.getenv('DB_HOST', 'localhost')}/{os.getenv('DB_NAME', 'learnroot_db')}"

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum('super_admin', 'school_admin', 'moderator'), nullable=False)
    created_at = Column(DateTime, default=DateTime.utcnow)
    updated_at = Column(DateTime, default=DateTime.utcnow, onupdate=DateTime.utcnow)

    # Relationships
    teacher = relationship("Teacher", back_populates="user", uselist=False)
    created_events = relationship("Event", back_populates="creator")
    created_announcements = relationship("Announcement", back_populates="creator")

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    gender = Column(Enum('male', 'female', 'other'))
    qualification = Column(String(255))
    experience_years = Column(Integer, default=0)
    subjects = Column(Text)
    joining_date = Column(Date)
    salary = Column(DECIMAL(10, 2))
    address = Column(Text)
    status = Column(Enum('active', 'inactive'), default='active')
    role = Column(Enum('teacher', 'admin'), default='teacher')
    grade = Column(String(50))
    created_at = Column(DateTime, default=DateTime.utcnow)
    updated_at = Column(DateTime, default=DateTime.utcnow, onupdate=DateTime.utcnow)

    # Relationships
    user = relationship("User", back_populates="teacher")
    timetables = relationship("Timetable", back_populates="teacher")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    type = Column(Enum('core', 'elective', 'optional'), default='core')
    stream = Column(Enum('science', 'commerce', 'humanities', 'general'))
    grades = Column(Text)
    description = Column(Text)
    created_at = Column(DateTime, default=DateTime.utcnow)
    updated_at = Column(DateTime, default=DateTime.utcnow, onupdate=DateTime.utcnow)

    # Relationships
    timetables = relationship("Timetable", back_populates="subject")

class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    segment = Column(Enum('primary', 'secondary', 'sr_secondary'), nullable=False)
    subjects = Column(JSON)
    description = Column(Text)
    created_at = Column(DateTime, default=DateTime.utcnow)
    updated_at = Column(DateTime, default=DateTime.utcnow, onupdate=DateTime.utcnow)

class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    segment = Column(Enum('primary', 'secondary', 'sr_secondary'), nullable=False)
    grade = Column(String(20), nullable=False)
    section = Column(String(10))
    class_teacher_id = Column(Integer, ForeignKey("teachers.id"))
    max_students = Column(Integer, default=40)
    current_students = Column(Integer, default=0)
    created_at = Column(DateTime, default=DateTime.utcnow)
    updated_at = Column(DateTime, default=DateTime.utcnow, onupdate=DateTime.utcnow)

    # Relationships
    class_teacher = relationship("Teacher")
    students = relationship("Student", back_populates="class_")
    timetables = relationship("Timetable", back_populates="class_")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admission_number = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(20))
    gender = Column(Enum('male', 'female', 'other'))
    date_of_birth = Column(Date)
    class_id = Column(Integer, ForeignKey("classes.id"))
    section = Column(String(10))
    roll_number = Column(Integer)
    parent_name = Column(String(255))
    parent_phone = Column(String(20))
    parent_email = Column(String(255))
    address = Column(Text)
    admission_date = Column(Date)
    status = Column(Enum('active', 'inactive', 'transferred'), default='active')
    created_at = Column(DateTime, default=DateTime.utcnow)
    updated_at = Column(DateTime, default=DateTime.utcnow, onupdate=DateTime.utcnow)

    # Relationships
    class_ = relationship("Class", back_populates="students")

class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    day_of_week = Column(Enum('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'), nullable=False)
    period_number = Column(Integer, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    room = Column(String(50))
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    academic_year = Column(String(20))
    created_at = Column(DateTime, default=DateTime.utcnow)
    updated_at = Column(DateTime, default=DateTime.utcnow, onupdate=DateTime.utcnow)

    __table_args__ = (
        UniqueConstraint('class_id', 'day_of_week', 'period_number', name='unique_schedule'),
    )

    # Relationships
    class_ = relationship("Class", back_populates="timetables")
    subject = relationship("Subject", back_populates="timetables")
    teacher = relationship("Teacher", back_populates="timetables")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(Enum('holiday', 'exam', 'ptm', 'activity', 'other'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    location = Column(String(255))
    target_audience = Column(Text)
    status = Column(Enum('upcoming', 'ongoing', 'completed', 'cancelled'), default='upcoming')
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=DateTime.utcnow)
    updated_at = Column(DateTime, default=DateTime.utcnow, onupdate=DateTime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="created_events")

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(Enum('general', 'urgent', 'academic', 'event'), default='general')
    target_audience = Column(Text)
    attachments = Column(Text)
    expiry_date = Column(Date)
    status = Column(Enum('active', 'expired'), default='active')
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=DateTime.utcnow)
    updated_at = Column(DateTime, default=DateTime.utcnow, onupdate=DateTime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="created_announcements")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_database():
    """Create database and tables"""
    db_name = os.getenv('DB_NAME', 'learnroot_db')
    
    # Create database if not exists
    temp_engine = create_engine(f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', '')}@{os.getenv('DB_HOST', 'localhost')}")
    with temp_engine.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
        conn.commit()
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables initialized successfully")

def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise