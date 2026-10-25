from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Vehicle, MileageReport
from app.schemas import MileageSubmissionRequest, MileageReportOut, VehicleOut

router = APIRouter(prefix="/mileage", tags=["Real-World Mileage"])

@router.get("/explorer")
def get_mileage_explorer(
    category: Optional[str] = None,
    fuel_type: Optional[str] = None,
    sort_by: str = Query("efficiency", pattern="^(efficiency|difference|sample_size)$"),
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle)
    if category and category != "All":
        query = query.filter(Vehicle.category == category)
    if fuel_type and fuel_type != "All":
        query = query.filter(Vehicle.fuel_type == fuel_type)

    vehicles = query.all()

    result = []
    for v in vehicles:
        diff_pct = round(((v.claimed_mileage - v.real_world_mixed_mileage) / v.claimed_mileage) * 100, 1) if v.claimed_mileage else 0
        result.append({
            "vehicle_id": v.id,
            "name": v.name,
            "brand": v.brand,
            "category": v.category,
            "fuel_type": v.fuel_type,
            "claimed_mileage": v.claimed_mileage,
            "real_world_city_mileage": v.real_world_city_mileage,
            "real_world_highway_mileage": v.real_world_highway_mileage,
            "real_world_mixed_mileage": v.real_world_mixed_mileage,
            "difference_pct": diff_pct,
            "sample_size": v.mileage_sample_size,
            "reliability_level": v.mileage_reliability_level,
            "reliability_disclaimer": "Crowd-aggregated owner data. Not officially certified by ARAI/ICAT.",
            "image_url": v.image_url
        })

    if sort_by == "efficiency":
        result.sort(key=lambda x: x["real_world_mixed_mileage"], reverse=True)
    elif sort_by == "difference":
        result.sort(key=lambda x: x["difference_pct"], reverse=True)
    elif sort_by == "sample_size":
        result.sort(key=lambda x: x["sample_size"], reverse=True)

    return result

@router.get("/reports/{vehicle_id}", response_model=List[MileageReportOut])
def get_vehicle_mileage_reports(
    vehicle_id: int,
    condition: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MileageReport).filter(
        MileageReport.vehicle_id == vehicle_id,
        MileageReport.status == "Approved"
    )
    if condition and condition != "All":
        query = query.filter(MileageReport.driving_condition.ilike(f"%{condition}%"))

    return query.order_by(MileageReport.created_at.desc()).all()

@router.post("/submit")
def submit_mileage_report(req: MileageSubmissionRequest, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    report = MileageReport(
        vehicle_id=req.vehicle_id,
        user_name=req.user_name,
        user_city=req.user_city,
        reported_kmpl=req.reported_kmpl,
        driving_condition=req.driving_condition,
        ac_usage_pct=req.ac_usage_pct,
        driving_style=req.driving_style,
        fuel_type_used=req.fuel_type_used,
        odometer_km=req.odometer_km,
        is_verified=False,  # Unverified until invoice / fuel slip review
        proof_type=req.proof_type,
        status="Approved"  # Set to approved for live interaction
    )
    db.add(report)

    # Increment sample size
    vehicle.mileage_sample_size += 1
    db.commit()
    db.refresh(report)

    return {
        "message": "Mileage report submitted successfully! Thank you for helping Indian car buyers.",
        "report_id": report.id,
        "is_verified": report.is_verified
    }
