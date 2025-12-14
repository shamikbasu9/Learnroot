from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_timetable():
    return {"success": True, "message": "Timetable endpoint - coming soon", "data": []}