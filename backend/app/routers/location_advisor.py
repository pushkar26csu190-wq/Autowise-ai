from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models import CityProfile, Vehicle
from app.schemas import LocationAdvisorRequest, LocationAdvisorResponse, VehicleOut

router = APIRouter(prefix="/location", tags=["Location-Based Advisor"])

@router.get("/cities")
def list_cities(db: Session = Depends(get_db)):
    return db.query(CityProfile).all()

@router.post("/advise", response_model=LocationAdvisorResponse)
def advise_by_location(req: LocationAdvisorRequest, db: Session = Depends(get_db)):
    city = db.query(CityProfile).filter(CityProfile.city_name.ilike(f"%{req.city_name}%")).first()
    if not city:
        city = db.query(CityProfile).first()

    # Ground clearance advice based on documented waterlogging & road topology
    clearance_guidance = (
        f"Based on civic monsoon rainfall data in {city.city_name}, roads frequently experience waterlogging in low-lying sectors. "
        f"A minimum ground clearance of {city.recommended_min_ground_clearance} mm is strongly advised to prevent underbody water ingress and scraping."
    )
    if city.monsoon_waterlog_risk == "High":
        clearance_guidance += " Due to high flood vulnerability during peak monsoons, compact/midsize SUVs with elevated air intakes are strongly favored over low-slung sedans."

    # Regulatory Alert
    reg_alert = city.special_regulation_notes

    # Select top city vehicle picks
    # 1. High ground clearance
    # 2. Fits budget
    # 3. Fits city powertrain needs (e.g. EV/Hybrid in Delhi/BLR, high-clearance in Mumbai)
    all_v = db.query(Vehicle).filter(Vehicle.price_ex_showroom_inr <= req.budget_inr * 1.1).all()

    def city_suitability_score(v: Vehicle):
        score = 0
        if (v.ground_clearance_mm or 0) >= city.recommended_min_ground_clearance:
            score += 30
        if "Automatic" in v.transmission or "DCT" in v.transmission or "e-CVT" in v.transmission or "Single Speed" in v.transmission:
            score += 25  # Automatics essential for city traffic
        if city.city_name == "Delhi NCR":
            if v.fuel_type in ["Electric", "CNG", "Strong Hybrid"]:
                score += 30
            elif v.fuel_type == "Diesel":
                score -= 20  # NGT 10-year limit
        elif city.city_name == "Bengaluru":
            if v.fuel_type == "Electric":
                score += 35  # 0% road tax in Karnataka vs 18% petrol
        return score

    all_v.sort(key=city_suitability_score, reverse=True)
    top_picks = [VehicleOut.model_validate(v) for v in all_v[:3]]

    # Local fuel economics breakdown
    monthly_km = req.daily_commute_km * 30
    petrol_cost = round((monthly_km / 13.0) * city.petrol_price, 2)
    diesel_cost = round((monthly_km / 16.0) * city.diesel_price, 2)
    ev_cost = round((monthly_km * 0.14) * city.electricity_unit_rate, 2)

    ev_verdict = (
        f"EV Infrastructure in {city.city_name} is ranked '{city.ev_charging_density}' with {city.ev_chargers_count}+ active public charging stations. "
        f"Switching to an EV for your {req.daily_commute_km} km daily commute will save approx. ₹{int(petrol_cost - ev_cost):,} every month in fuel alone."
    )

    return LocationAdvisorResponse(
        city_profile={
            "city_name": city.city_name,
            "state_name": city.state_name,
            "petrol_price": city.petrol_price,
            "diesel_price": city.diesel_price,
            "cng_price": city.cng_price,
            "electricity_unit_rate": city.electricity_unit_rate,
            "traffic_congestion_index": city.traffic_congestion_index,
            "average_city_speed_kmh": city.average_city_speed_kmh,
            "monsoon_waterlog_risk": city.monsoon_waterlog_risk,
            "recommended_min_ground_clearance": city.recommended_min_ground_clearance,
            "rto_road_tax_petrol_pct": city.rto_road_tax_petrol_pct,
            "rto_road_tax_diesel_pct": city.rto_road_tax_diesel_pct,
            "rto_road_tax_ev_pct": city.rto_road_tax_ev_pct,
            "ev_charging_density": city.ev_charging_density,
            "ev_chargers_count": city.ev_chargers_count
        },
        local_fuel_economics={
            "monthly_commute_km": monthly_km,
            "monthly_petrol_inr": petrol_cost,
            "monthly_diesel_inr": diesel_cost,
            "monthly_ev_electricity_inr": ev_cost,
            "annual_ev_savings_vs_petrol_inr": int((petrol_cost - ev_cost) * 12)
        },
        ground_clearance_guidance=clearance_guidance,
        regulatory_alert=reg_alert,
        top_city_vehicle_picks=top_picks,
        ev_feasibility_verdict=ev_verdict
    )
