from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_classes():
    return {"success": True, "message": "Classes endpoint - coming soon", "data": []}