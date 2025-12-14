from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_calendar():
    return {"success": True, "message": "Calendar endpoint - coming soon", "data": []}