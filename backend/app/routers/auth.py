from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import SavedComparison, User
from app.schemas import SavedComparisonCreate, SavedComparisonOut

router = APIRouter(prefix="/auth", tags=["User Profile & Auth"])

@router.get("/profile")
def get_user_profile(user_id: str = "demo_user_1", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == "rahul.verma@example.com").first()
    if not user:
        user = User(
            email="rahul.verma@example.com",
            full_name="Rahul Verma",
            city="Bengaluru",
            phone="+91 98765 43210",
            is_admin=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    saved_comps = db.query(SavedComparison).filter(SavedComparison.user_id == user_id).all()

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "city": user.city,
        "phone": user.phone,
        "is_admin": user.is_admin,
        "saved_comparisons_count": len(saved_comps),
        "auth_provider": "Supabase Auth / Local JWT Active"
    }

@router.get("/saved-comparisons", response_model=List[SavedComparisonOut])
def get_saved_comparisons(user_id: str = "demo_user_1", db: Session = Depends(get_db)):
    return db.query(SavedComparison).filter(SavedComparison.user_id == user_id).order_by(SavedComparison.created_at.desc()).all()

@router.post("/saved-comparisons", response_model=SavedComparisonOut)
def save_comparison(req: SavedComparisonCreate, db: Session = Depends(get_db)):
    comp = SavedComparison(
        user_id=req.user_id,
        title=req.title,
        vehicle_ids=req.vehicle_ids,
        notes=req.notes
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp

@router.delete("/saved-comparisons/{comp_id}")
def delete_saved_comparison(comp_id: int, db: Session = Depends(get_db)):
    comp = db.query(SavedComparison).filter(SavedComparison.id == comp_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Comparison not found")
    db.delete(comp)
    db.commit()
    return {"message": "Saved comparison deleted successfully"}
