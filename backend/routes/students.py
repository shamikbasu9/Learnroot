from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_students():
    return {"success": True, "message": "Students endpoint - coming soon", "data": []}