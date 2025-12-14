from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_grades():
    return {"success": True, "message": "Grades endpoint - coming soon", "data": []}