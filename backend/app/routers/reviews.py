from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Review, Vehicle
from app.schemas import ReviewCreate, ReviewOut
from app.ai_service import analyze_review_sentiment

router = APIRouter(prefix="/reviews", tags=["Verified Owner Reviews"])

@router.get("", response_model=List[ReviewOut])
def get_reviews(
    vehicle_id: Optional[int] = None,
    verified_only: bool = False,
    sentiment: Optional[str] = None,
    sort_by: str = Query("recent", pattern="^(recent|rating_high|rating_low)$"),
    db: Session = Depends(get_db)
):
    query = db.query(Review).filter(Review.status == "Approved")

    if vehicle_id:
        query = query.filter(Review.vehicle_id == vehicle_id)
    if verified_only:
        query = query.filter(Review.is_verified_owner == True)
    if sentiment and sentiment != "All":
        query = query.filter(Review.sentiment == sentiment)

    if sort_by == "recent":
        query = query.order_by(Review.created_at.desc())
    elif sort_by == "rating_high":
        query = query.order_by(Review.overall_rating.desc())
    elif sort_by == "rating_low":
        query = query.order_by(Review.overall_rating.asc())

    return query.all()

@router.get("/summary/{vehicle_id}")
def get_vehicle_review_summary(vehicle_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.vehicle_id == vehicle_id, Review.status == "Approved").all()

    if not reviews:
        return {
            "vehicle_id": vehicle_id,
            "total_reviews": 0,
            "verified_owners_count": 0,
            "average_overall_rating": 0.0,
            "category_averages": {
                "comfort": 0.0,
                "mileage": 0.0,
                "performance": 0.0,
                "maintenance": 0.0,
                "reliability": 0.0
            },
            "sentiment_breakdown": {"Positive": 0, "Neutral": 0, "Critical": 0},
            "common_issues": [],
            "notice": "No verified owner reviews submitted yet for this vehicle."
        }

    total = len(reviews)
    verified = sum(1 for r in reviews if r.is_verified_owner)
    avg_overall = round(sum(r.overall_rating for r in reviews) / total, 1)

    avg_comfort = round(sum(r.rating_comfort for r in reviews) / total, 1)
    avg_mileage = round(sum(r.rating_mileage for r in reviews) / total, 1)
    avg_perf = round(sum(r.rating_performance for r in reviews) / total, 1)
    avg_maint = round(sum(r.rating_maintenance for r in reviews) / total, 1)
    avg_rel = round(sum(r.rating_reliability for r in reviews) / total, 1)

    sentiments = {"Positive": 0, "Neutral": 0, "Critical": 0}
    for r in reviews:
        sent = r.sentiment or "Neutral"
        if sent in sentiments:
            sentiments[sent] += 1
        else:
            sentiments["Neutral"] += 1

    common_issues = [r.common_problems_faced for r in reviews if r.common_problems_faced and r.common_problems_faced.strip()]

    return {
        "vehicle_id": vehicle_id,
        "total_reviews": total,
        "verified_owners_count": verified,
        "average_overall_rating": avg_overall,
        "category_averages": {
            "comfort": avg_comfort,
            "mileage": avg_mileage,
            "performance": avg_perf,
            "maintenance": avg_maint,
            "reliability": avg_rel
        },
        "sentiment_breakdown": sentiments,
        "common_issues": list(set(common_issues))[:4],
        "notice": f"Aggregated from {total} owner logs. Only reviews marked with the blue badge have verified RC/Invoice registration."
    }

@router.post("", response_model=ReviewOut)
def submit_review(req: ReviewCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    overall = round((
        req.rating_comfort +
        req.rating_mileage +
        req.rating_performance +
        req.rating_maintenance +
        req.rating_reliability
    ) / 5.0, 1)

    # Automated Sentiment Analysis
    sentiment = analyze_review_sentiment(req.review_text, overall)

    # Only mark verified if badge explicitly indicates proof uploaded
    is_verified = "Verified" in req.verification_badge

    new_rev = Review(
        vehicle_id=req.vehicle_id,
        user_name=req.user_name,
        user_city=req.user_city,
        is_verified_owner=is_verified,
        verification_badge=req.verification_badge if is_verified else "Unverified",
        ownership_duration_months=req.ownership_duration_months,
        odometer_reading_km=req.odometer_reading_km,
        rating_comfort=req.rating_comfort,
        rating_mileage=req.rating_mileage,
        rating_performance=req.rating_performance,
        rating_maintenance=req.rating_maintenance,
        rating_reliability=req.rating_reliability,
        overall_rating=overall,
        title=req.title,
        review_text=req.review_text,
        pros=req.pros,
        cons=req.cons,
        common_problems_faced=req.common_problems_faced,
        monthly_repair_cost_inr=req.monthly_repair_cost_inr,
        sentiment=sentiment,
        status="Approved"
    )
    db.add(new_rev)
    db.commit()
    db.refresh(new_rev)

    return new_rev
