from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Vehicle, Review, MileageReport, CityProfile
from app.seed_data import init_db_data

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_vehicles = db.query(Vehicle).count()
    total_reviews = db.query(Review).count()
    verified_reviews = db.query(Review).filter(Review.is_verified_owner == True).count()
    total_mileage_reports = db.query(MileageReport).count()
    cities_count = db.query(CityProfile).count()

    ev_count = db.query(Vehicle).filter(Vehicle.fuel_type == "Electric").count()
    five_star_safety_count = db.query(Vehicle).filter(
        (Vehicle.b_ncap_rating == 5.0) | (Vehicle.g_ncap_rating == 5.0)
    ).count()

    pending_reviews = db.query(Review).filter(Review.status == "Pending").count()
    pending_mileage = db.query(MileageReport).filter(MileageReport.status == "Pending").count()

    return {
        "total_vehicles": total_vehicles,
        "total_reviews": total_reviews,
        "verified_reviews": verified_reviews,
        "total_mileage_reports": total_mileage_reports,
        "cities_count": cities_count,
        "ev_count": ev_count,
        "five_star_safety_count": five_star_safety_count,
        "pending_moderation": {
            "reviews": pending_reviews,
            "mileage_reports": pending_mileage
        }
    }

@router.post("/reviews/{review_id}/moderate")
def moderate_review(review_id: int, status: str, db: Session = Depends(get_db)):
    if status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    rev = db.query(Review).filter(Review.id == review_id).first()
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found")
    rev.status = status
    db.commit()
    return {"message": f"Review {review_id} status updated to {status}"}

@router.post("/mileage/{report_id}/moderate")
def moderate_mileage(report_id: int, status: str, db: Session = Depends(get_db)):
    if status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    rep = db.query(MileageReport).filter(MileageReport.id == report_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Mileage report not found")
    rep.status = status
    db.commit()
    return {"message": f"Mileage report {report_id} status updated to {status}"}

@router.post("/reset-seed")
def reset_seed_data(db: Session = Depends(get_db)):
    init_db_data(db)
    return {"message": "Database successfully checked and re-seeded with Indian automotive catalog."}
