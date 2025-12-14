from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_reports():
    return {"success": True, "message": "Reports endpoint - coming soon", "data": []}