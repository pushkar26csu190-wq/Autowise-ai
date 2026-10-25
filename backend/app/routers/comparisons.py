from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.models import Vehicle, CityProfile
from app.schemas import ComparisonRequest, ComparisonResponse, ComparisonAttribute, VehicleOut
from app.ai_service import generate_comparison_verdict

router = APIRouter(prefix="/comparisons", tags=["Smart Comparisons"])

@router.post("", response_model=ComparisonResponse)
def compare_vehicles(req: ComparisonRequest, db: Session = Depends(get_db)):
    if not req.vehicle_ids or len(req.vehicle_ids) > 4:
        raise HTTPException(status_code=400, detail="Please select between 1 and 4 vehicles to compare.")

    vehicles = db.query(Vehicle).filter(Vehicle.id.in_(req.vehicle_ids)).all()
    if not vehicles:
        raise HTTPException(status_code=404, detail="None of the selected vehicles were found.")

    city_prof = db.query(CityProfile).filter(CityProfile.city_name == req.city_name).first()
    if not city_prof:
        city_prof = db.query(CityProfile).first()

    # Build attribute matrices by category
    category_attributes: Dict[str, List[ComparisonAttribute]] = {}

    def build_attr(name: str, key: str, extract_fn, best_fn=None, unit: str = "") -> ComparisonAttribute:
        values = {}
        for v in vehicles:
            val = extract_fn(v)
            values[v.id] = val

        best_id = None
        if best_fn and len(vehicles) > 1:
            try:
                best_id = best_fn(vehicles)
            except Exception:
                best_id = None

        return ComparisonAttribute(
            name=name,
            key=key,
            values=values,
            best_vehicle_id=best_id,
            unit=unit
        )

    # 1. Pricing & Value
    def best_price(v_list):
        return min(v_list, key=lambda x: x.price_ex_showroom_inr).id

    category_attributes["Pricing & Value"] = [
        build_attr("Ex-Showroom Price", "price", lambda v: f"₹{v.price_ex_showroom_inr:,}", best_price),
        build_attr("Est. 5-Yr Resale Retention", "resale", lambda v: f"{v.resale_value_5yr_pct}%",
                   lambda v_list: max(v_list, key=lambda x: x.resale_value_5yr_pct).id),
        build_attr("Warranty", "warranty", lambda v: f"{v.warranty_years} Years / {v.warranty_km:,} km"),
        build_attr("Service Network Rating", "network", lambda v: f"{v.service_network_rating} / 5.0",
                   lambda v_list: max(v_list, key=lambda x: x.service_network_rating).id)
    ]

    # 2. Performance & Powertrain
    def best_power(v_list):
        return max(v_list, key=lambda x: x.max_power_bhp).id
    def best_torque(v_list):
        return max(v_list, key=lambda x: x.max_torque_nm).id

    category_attributes["Engine & Performance"] = [
        build_attr("Fuel / Powertrain", "fuel_type", lambda v: v.fuel_type),
        build_attr("Displacement / Battery", "displacement",
                   lambda v: f"{v.battery_capacity_kwh} kWh" if v.fuel_type == "Electric" else f"{v.engine_cc} cc" if v.engine_cc else "N/A"),
        build_attr("Max Power", "power", lambda v: f"{v.max_power_bhp} bhp", best_power),
        build_attr("Max Torque", "torque", lambda v: f"{v.max_torque_nm} Nm", best_torque),
        build_attr("Transmission", "transmission", lambda v: v.transmission),
        build_attr("Drivetrain", "drivetrain", lambda v: v.drivetrain)
    ]

    # 3. Efficiency & Mileage
    def best_mixed_mileage(v_list):
        return max(v_list, key=lambda x: x.real_world_mixed_mileage).id

    category_attributes["Real-World Mileage & Range"] = [
        build_attr("Claimed Efficiency", "claimed",
                   lambda v: f"{v.claimed_mileage} km/charge" if v.fuel_type == "Electric" else f"{v.claimed_mileage} km/l"),
        build_attr("Real-World City", "real_city",
                   lambda v: f"{v.real_world_city_mileage} km" if v.fuel_type == "Electric" else f"{v.real_world_city_mileage} km/l"),
        build_attr("Real-World Highway", "real_highway",
                   lambda v: f"{v.real_world_highway_mileage} km" if v.fuel_type == "Electric" else f"{v.real_world_highway_mileage} km/l"),
        build_attr("Real-World Mixed (Verified)", "real_mixed",
                   lambda v: f"{v.real_world_mixed_mileage} km" if v.fuel_type == "Electric" else f"{v.real_world_mixed_mileage} km/l",
                   best_mixed_mileage),
        build_attr("Reliability Sample Size", "sample_size", lambda v: f"{v.mileage_sample_size} Owners ({v.mileage_reliability_level} confidence)")
    ]

    # 4. Safety & Crash Test
    def best_safety(v_list):
        # Prefer B-NCAP 5 or G-NCAP 5
        scored = [(v.id, (v.b_ncap_rating or 0) * 10 + (v.g_ncap_rating or 0) * 5 + (v.airbags_count or 0)) for v in v_list]
        return max(scored, key=lambda x: x[1])[0]

    category_attributes["Safety & Build Intelligence"] = [
        build_attr("Bharat NCAP Crash Rating", "b_ncap",
                   lambda v: f"{int(v.b_ncap_rating)} Stars ★" if v.b_ncap_tested and v.b_ncap_rating else "Not Tested"),
        build_attr("Global NCAP Crash Rating", "g_ncap",
                   lambda v: f"{int(v.g_ncap_rating)} Stars ★ ({v.g_ncap_protocol})" if v.g_ncap_tested and v.g_ncap_rating else "Not Tested / B-NCAP Adopted"),
        build_attr("Airbags Count", "airbags", lambda v: f"{v.airbags_count} Airbags Standard",
                   lambda v_list: max(v_list, key=lambda x: x.airbags_count).id),
        build_attr("ESC (Stability Control)", "esc", lambda v: "Standard" if v.has_esc else "Unavailable"),
        build_attr("ADAS Level", "adas",
                   lambda v: f"Level {v.adas_level} ({v.adas_features})" if v.adas_level > 0 else "None",
                   lambda v_list: max(v_list, key=lambda x: x.adas_level).id if any(x.adas_level > 0 for x in v_list) else None)
    ]

    # 5. Dimensions & Indian Road Suitability
    def best_ground_clearance(v_list):
        valid = [v for v in v_list if v.ground_clearance_mm]
        return max(valid, key=lambda x: x.ground_clearance_mm).id if valid else None

    category_attributes["Comfort & Road Resilience"] = [
        build_attr("Ground Clearance", "clearance",
                   lambda v: f"{v.ground_clearance_mm} mm" if v.ground_clearance_mm else "N/A", best_ground_clearance),
        build_attr("Boot Space", "boot",
                   lambda v: f"{v.boot_space_litres} Litres" if v.boot_space_litres else "N/A",
                   lambda v_list: max([v for v in v_list if v.boot_space_litres], key=lambda x: x.boot_space_litres, default=v_list[0]).id),
        build_attr("Seating Capacity", "seating", lambda v: f"{v.seating_capacity} Persons")
    ]

    # 6. Maintenance & Running Cost
    def best_maintenance(v_list):
        return min(v_list, key=lambda x: x.five_year_maintenance_inr).id

    category_attributes["Long-Term Maintenance"] = [
        build_attr("Annual Service Estimate", "annual_maint", lambda v: f"₹{v.annual_maintenance_inr:,}"),
        build_attr("5-Year Scheduled Service", "five_yr_maint", lambda v: f"₹{v.five_year_maintenance_inr:,}", best_maintenance)
    ]

    # Generate AI Comparative Verdict
    ai_verdict = generate_comparison_verdict(
        [v.__dict__ for v in vehicles],
        {"city_name": req.city_name, "driving_km_per_month": req.driving_km_per_month}
    )

    # Calculate recommended winners for use-cases
    rec_city = max(vehicles, key=lambda x: (1 if "Automatic" in x.transmission or "DCT" in x.transmission or "e-CVT" in x.transmission or "Single Speed" in x.transmission else 0) + (1 if x.fuel_type in ["Electric", "Strong Hybrid"] else 0)).id
    rec_hwy = max(vehicles, key=lambda x: (x.max_power_bhp * 0.4) + ((x.b_ncap_rating or x.g_ncap_rating or 0) * 15)).id
    rec_val = min(vehicles, key=lambda x: x.price_ex_showroom_inr + (x.five_year_maintenance_inr * 1.5)).id

    return ComparisonResponse(
        vehicles=[VehicleOut.model_validate(v) for v in vehicles],
        category_attributes=category_attributes,
        ai_comparison_verdict=ai_verdict,
        recommended_vehicle_for_city=rec_city,
        recommended_vehicle_for_highway=rec_hwy,
        recommended_vehicle_for_value=rec_val
    )
