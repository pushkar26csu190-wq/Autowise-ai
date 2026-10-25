from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Vehicle, CityProfile
from app.schemas import VehicleOut

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("", response_model=List[VehicleOut])
def get_vehicles(
    category: Optional[str] = None,
    fuel_type: Optional[str] = None,
    transmission: Optional[str] = None,
    max_price: Optional[int] = None,
    min_safety: Optional[float] = None,
    vehicle_type: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = Query("popular", pattern="^(price_asc|price_desc|mileage_desc|safety_desc|popular)$"),
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle)

    if category and category != "All":
        query = query.filter(Vehicle.category == category)
    if fuel_type and fuel_type != "All":
        query = query.filter(Vehicle.fuel_type == fuel_type)
    if transmission and transmission != "All":
        query = query.filter(Vehicle.transmission.ilike(f"%{transmission}%"))
    if vehicle_type and vehicle_type != "All":
        query = query.filter(Vehicle.vehicle_type == vehicle_type)
    if max_price:
        query = query.filter(Vehicle.price_ex_showroom_inr <= max_price)
    if min_safety:
        query = query.filter(
            (Vehicle.b_ncap_rating >= min_safety) | (Vehicle.g_ncap_rating >= min_safety)
        )
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Vehicle.name.ilike(s)) | (Vehicle.brand.ilike(s)) | (Vehicle.model.ilike(s))
        )

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Vehicle.price_ex_showroom_inr.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Vehicle.price_ex_showroom_inr.desc())
    elif sort_by == "mileage_desc":
        query = query.order_by(Vehicle.real_world_mixed_mileage.desc())
    elif sort_by == "safety_desc":
        query = query.order_by(Vehicle.b_ncap_rating.desc().nullslast(), Vehicle.g_ncap_rating.desc().nullslast())
    else:
        query = query.order_by(Vehicle.id.asc())

    return query.all()

@router.get("/meta/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = [r[0] for r in db.query(Vehicle.category).distinct().all()]
    brands = [r[0] for r in db.query(Vehicle.brand).distinct().all()]
    fuel_types = [r[0] for r in db.query(Vehicle.fuel_type).distinct().all()]
    return {
        "categories": categories,
        "brands": brands,
        "fuel_types": fuel_types,
        "transmissions": ["Manual", "Automatic", "DCT", "e-CVT", "Single Speed"]
    }

@router.get("/{vehicle_id}")
def get_vehicle_detail(vehicle_id: int, city: str = "Bengaluru", db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    city_profile = db.query(CityProfile).filter(CityProfile.city_name == city).first()
    if not city_profile:
        city_profile = db.query(CityProfile).first()

    # Calculate On-Road Price for Indian buyer:
    # Ex-Showroom + RTO Road Tax + Comprehensive Insurance (1yr OD + 3yr TP) + TCS + Fastag/Reg
    ex = vehicle.price_ex_showroom_inr

    rto_pct = city_profile.rto_road_tax_petrol_pct
    if vehicle.fuel_type == "Diesel":
        rto_pct = city_profile.rto_road_tax_diesel_pct
    elif vehicle.fuel_type == "Electric":
        rto_pct = city_profile.rto_road_tax_ev_pct

    rto_tax = int(ex * (rto_pct / 100.0))
    # Insurance: ~3.5% of ex-showroom
    insurance = int(ex * 0.035)
    tcs = int(ex * 0.01) if ex >= 1000000 else 0
    fastag_reg = 2500

    on_road_price = ex + rto_tax + insurance + tcs + fastag_reg

    return {
        "vehicle": VehicleOut.model_validate(vehicle),
        "pricing_breakdown": {
            "city": city_profile.city_name,
            "state": city_profile.state_name,
            "ex_showroom": ex,
            "rto_road_tax": rto_tax,
            "rto_pct": rto_pct,
            "insurance": insurance,
            "tcs": tcs,
            "registration_and_fastag": fastag_reg,
            "estimated_on_road_price": on_road_price
        },
        "reviews_count": len(vehicle.reviews),
        "mileage_reports_count": len(vehicle.mileage_reports)
    }
