from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_subjects():
    return {"success": True, "message": "Subjects endpoint - coming soon", "data": []}