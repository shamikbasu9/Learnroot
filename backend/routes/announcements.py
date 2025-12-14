from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_announcements():
    return {"success": True, "message": "Announcements endpoint - coming soon", "data": []}