from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_settings():
    return {"success": True, "message": "Settings endpoint - coming soon", "data": []}