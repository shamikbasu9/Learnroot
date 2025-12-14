from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Import routes
from routes.auth import router as auth_router
from routes.classes import router as classes_router
from routes.subjects import router as subjects_router
from routes.teachers import router as teachers_router
from routes.students import router as students_router
from routes.timetable import router as timetable_router
from routes.calendar import router as calendar_router
from routes.announcements import router as announcements_router
from routes.reports import router as reports_router
from routes.settings import router as settings_router

# Import database
from config.database import create_database, test_connection

load_dotenv()

app = FastAPI(title="Learnroot API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(classes_router, prefix="/api/classes", tags=["classes"])
app.include_router(subjects_router, prefix="/api/subjects", tags=["subjects"])
app.include_router(teachers_router, prefix="/api/teachers", tags=["teachers"])
app.include_router(students_router, prefix="/api/students", tags=["students"])
app.include_router(timetable_router, prefix="/api/timetable", tags=["timetable"])
app.include_router(calendar_router, prefix="/api/calendar", tags=["calendar"])
app.include_router(announcements_router, prefix="/api/announcements", tags=["announcements"])
app.include_router(reports_router, prefix="/api/reports", tags=["reports"])
app.include_router(settings_router, prefix="/api/settings", tags=["settings"])

# Health check
@app.get("/api/health")
def health_check():
    return {"status": "OK", "message": "Learnroot API is running"}

# Error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Something went wrong!"}
    )

@app.on_event("startup")
async def startup_event():
    print("🚀 Starting Learnroot API server...")
    
    # Test database connection
    try:
        test_connection()
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise
    
    # Initialize database tables
    try:
        create_database()
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        raise

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)