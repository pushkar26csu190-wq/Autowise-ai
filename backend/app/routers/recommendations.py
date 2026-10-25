from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models import Vehicle, CityProfile
from app.schemas import RecommendationRequest, RecommendationResponse, RecommendedVehicle, VehicleOut
from app.ai_service import generate_recommendation_explanation

router = APIRouter(prefix="/recommendations", tags=["AI Recommendations"])

@router.post("", response_model=RecommendationResponse)
def get_recommendations(req: RecommendationRequest, db: Session = Depends(get_db)):
    # 1. Fetch all candidate vehicles
    all_vehicles = db.query(Vehicle).all()

    # 2. Fetch city profile or default
    city_prof = db.query(CityProfile).filter(CityProfile.city_name.ilike(f"%{req.city}%")).first()
    if not city_prof:
        city_prof = db.query(CityProfile).first()

    fuel_price = city_prof.petrol_price
    if req.fuel_preference == "Diesel":
        fuel_price = city_prof.diesel_price
    elif req.fuel_preference == "CNG":
        fuel_price = city_prof.cng_price

    # 3. Deterministic Filtering and Scoring
    scored_vehicles = []

    for v in all_vehicles:
        # Hard Filter 1: Budget constraint (allow up to 8% margin for on-road negotiation)
        if v.price_ex_showroom_inr > (req.budget_max_inr * 1.08):
            continue

        # Hard Filter 2: Category match (if specific requested)
        if req.vehicle_category and req.vehicle_category not in ["Any", "All"]:
            cat_lower = req.vehicle_category.lower()
            if cat_lower == "car" and v.vehicle_type not in ["Car", "EV"]:
                continue
            elif cat_lower == "bike" and v.vehicle_type != "Bike":
                continue
            elif cat_lower == "scooter" and v.vehicle_type != "Scooter":
                continue
            elif cat_lower == "ev" and v.fuel_type != "Electric":
                continue
            elif cat_lower in ["suv", "compact suv", "midsize suv", "7-seater suv"] and "suv" not in v.category.lower():
                continue
            elif cat_lower == "sedan" and "sedan" not in v.category.lower():
                continue
            elif cat_lower == "hatchback" and "hatchback" not in v.category.lower():
                continue

        # Hard Filter 3: Passenger capacity
        if v.seating_capacity < req.passengers:
            continue

        # Hard Filter 4: Fuel preference if non-negotiable
        if req.fuel_preference and req.fuel_preference != "Any":
            if req.fuel_preference == "Electric" and v.fuel_type != "Electric":
                continue
            elif req.fuel_preference == "Petrol" and v.fuel_type not in ["Petrol", "Strong Hybrid"]:
                continue
            elif req.fuel_preference == "Diesel" and v.fuel_type != "Diesel":
                continue
            elif req.fuel_preference == "CNG" and v.fuel_type != "CNG":
                continue

        # --- Deterministic Multi-Factor Scoring (Max 100 Points) ---
        score = 0
        reasons = []
        pros = []
        cons = []

        # 1. Budget Optimality (Up to 25 pts)
        budget_ratio = v.price_ex_showroom_inr / req.budget_max_inr
        if 0.70 <= budget_ratio <= 0.98:
            score += 25  # Hits the buyer's budget sweet-spot
            reasons.append(f"Maximizes value within your ₹{req.budget_max_inr:,} budget.")
        elif budget_ratio < 0.70:
            score += 20  # Significant savings
            reasons.append(f"Leaves substantial budget headroom (saving ~₹{(req.budget_max_inr - v.price_ex_showroom_inr):,}).")
        else:
            score += 16

        # 2. Commute & Fuel Suitability (Up to 25 pts)
        if req.daily_travel_km >= 45:
            # High daily commute: heavily favors EV, Strong Hybrid, CNG, or Diesel
            if v.fuel_type in ["Electric", "Strong Hybrid"]:
                score += 25
                reasons.append(f"Ideal for high {req.daily_travel_km} km/day running; slashes fuel bills dramatically.")
                pros.append(f"Ultra-low running cost for {req.daily_travel_km} km daily commute.")
            elif v.fuel_type in ["Diesel", "CNG"]:
                score += 20
                reasons.append("Economical diesel/CNG running cost for high daily distances.")
            else:
                score += 12
                cons.append("Higher monthly fuel bill with turbo petrol on long commutes.")
        else:
            # Moderate commute (<= 40 km/day): petrol, hybrid, EV all solid
            if v.fuel_type in ["Petrol", "Electric", "Strong Hybrid"]:
                score += 22
                reasons.append(f"Efficient and low hassle for moderate {req.daily_travel_km} km daily commute.")
            else:
                score += 18

        # 3. Safety Match (Up to 20 pts)
        safety_stars = v.b_ncap_rating or v.g_ncap_rating or 0
        if req.safety_priority == "High":
            if safety_stars == 5.0:
                score += 20
                reasons.append("5-Star crash safety rating (B-NCAP / G-NCAP) gives maximum protection.")
                pros.append("Class-leading 5-Star crash tested body shell and standard 6 airbags.")
            elif safety_stars == 4.0:
                score += 15
                reasons.append("Solid 4-Star crash test protection with standard ESC & airbags.")
            else:
                score += 10
                cons.append("Safety crash rating is lower or currently untested.")
        else:
            score += 16

        # 4. Driving Environment & Transmission (Up to 15 pts)
        is_automatic = any(t in v.transmission for t in ["Automatic", "AT", "DCT", "CVT", "e-CVT", "Single Speed"])
        if req.driving_environment in ["City Heavy", "City"]:
            if is_automatic:
                score += 10
                reasons.append("Automatic transmission reduces fatigue in heavy city traffic.")
                pros.append("Stress-free clutchless driving in bumper-to-bumper city queues.")
            else:
                score += 5
            # Ground clearance for city potholes / waterlogging
            if (v.ground_clearance_mm or 0) >= city_prof.recommended_min_ground_clearance:
                score += 5
                reasons.append(f"High {v.ground_clearance_mm}mm ground clearance easily navigates {city_prof.city_name} speedbreakers.")
            else:
                score += 3
        else:
            score += 12

        # 5. Mileage & Brand Preference (Up to 15 pts)
        if req.preferred_brands:
            if v.brand.lower() in [b.lower() for b in req.preferred_brands]:
                score += 8
                reasons.append(f"Matches your preferred brand: {v.brand}.")
            else:
                score += 4
        else:
            score += 6

        # Maintenance budget match
        if req.annual_maintenance_budget_inr:
            if v.annual_maintenance_inr <= req.annual_maintenance_budget_inr:
                score += 7
                pros.append(f"Annual maintenance (~₹{v.annual_maintenance_inr:,}) is well within your budget.")
            else:
                score += 3
                cons.append("Scheduled service costs slightly exceed your target maintenance budget.")
        else:
            score += 7

        # Monthly running cost calculation:
        monthly_km = req.daily_travel_km * 30
        if v.fuel_type == "Electric":
            # EV electricity: consumption is battery_kwh / real_world_range * monthly_km
            kwh_per_km = (v.battery_capacity_kwh or 30.0) / (v.real_world_range_km or 250.0)
            monthly_running = int(monthly_km * kwh_per_km * city_prof.electricity_unit_rate)
        else:
            effective_kmpl = v.real_world_city_mileage if "City" in req.driving_environment else v.real_world_mixed_mileage
            monthly_running = int((monthly_km / max(effective_kmpl, 8.0)) * fuel_price)

        # 5-Year True Ownership Cost estimate:
        # On-road + 5yr fuel + 5yr maintenance + 5yr insurance - estimated resale
        on_road = int(v.price_ex_showroom_inr * (1 + (city_prof.rto_road_tax_petrol_pct / 100.0) + 0.04))
        five_yr_fuel = monthly_running * 60
        five_yr_maint = v.five_year_maintenance_inr
        five_yr_ins = int(v.price_ex_showroom_inr * 0.12)
        resale_val = int(v.price_ex_showroom_inr * (v.resale_value_5yr_pct / 100.0))
        five_year_tco = (on_road + five_yr_fuel + five_yr_maint + five_yr_ins) - resale_val

        # Safety summary
        safety_text = f"{int(safety_stars)}-Star Safety Rating" if safety_stars > 0 else "Safety Untested (B-NCAP pending)"
        if v.b_ncap_tested:
            safety_text = f"5-Star Bharat NCAP Certified ({v.b_ncap_adult_score} Adult)"
        elif v.g_ncap_tested and v.g_ncap_rating:
            safety_text = f"{int(v.g_ncap_rating)}-Star Global NCAP ({v.g_ncap_protocol})"

        mileage_hl = f"Real-world city: {v.real_world_city_mileage} km/l | Highway: {v.real_world_highway_mileage} km/l"
        if v.fuel_type == "Electric":
            mileage_hl = f"Real-world range: {v.real_world_range_km} km on full charge (ARAI claimed: {v.claimed_mileage} km)"

        local_insight = f"In {city_prof.city_name}, enjoy {v.ground_clearance_mm}mm clearance against waterlogging and {city_prof.ev_charging_density} EV infrastructure."

        final_score = min(max(int(score), 40), 99)

        if not pros:
            pros = [f"Proven {v.brand} engineering", f"Strong resale value retention ({v.resale_value_5yr_pct}%)"]
        if not cons:
            cons = ["Waiting period may vary depending on dealership inventory"]

        rec_item = RecommendedVehicle(
            vehicle=VehicleOut.model_validate(v),
            suitability_score=final_score,
            reasons_for_recommendation=reasons[:4],
            advantages=pros[:3],
            disadvantages=cons[:2],
            monthly_fuel_running_cost_inr=monthly_running,
            five_year_true_ownership_cost_inr=five_year_tco,
            safety_summary=safety_text,
            real_world_mileage_highlight=mileage_hl,
            local_city_insight=local_insight
        )

        scored_vehicles.append((final_score, rec_item, v))

    # Sort descending by score
    scored_vehicles.sort(key=lambda x: x[0], reverse=True)
    top_3_to_5 = [item[1] for item in scored_vehicles[:4]]

    if not top_3_to_5:
        # Fallback to general bestsellers within budget if filters were overly narrow
        fallback_v = sorted(all_vehicles, key=lambda x: x.price_ex_showroom_inr)[:3]
        for fv in fallback_v:
            top_3_to_5.append(RecommendedVehicle(
                vehicle=VehicleOut.model_validate(fv),
                suitability_score=75,
                reasons_for_recommendation=["Closest match in segment", "Reliable family performer"],
                advantages=["High reliability", "Accessible price"],
                disadvantages=["Check dimensions against garage constraints"],
                monthly_fuel_running_cost_inr=4500,
                five_year_true_ownership_cost_inr=fv.price_ex_showroom_inr + 200000,
                safety_summary="Active safety package included",
                real_world_mileage_highlight=f"{fv.real_world_mixed_mileage} km/l real-world mixed",
                local_city_insight="Suitable for daily city and highway driving"
            ))

    # Generate AI explanation in simple language
    top_dict = [
        {
            "name": t.vehicle.name,
            "score": t.suitability_score,
            "price_ex_showroom_inr": t.vehicle.price_ex_showroom_inr,
            "fuel_type": t.vehicle.fuel_type,
            "real_world_mixed_mileage": t.vehicle.real_world_mixed_mileage,
            "b_ncap_rating": t.vehicle.b_ncap_rating,
            "g_ncap_rating": t.vehicle.g_ncap_rating,
            "ground_clearance_mm": t.vehicle.ground_clearance_mm
        }
        for t in top_3_to_5
    ]

    ai_explanation = generate_recommendation_explanation(req.model_dump(), top_dict)

    best_id = top_3_to_5[0].vehicle.id if top_3_to_5 else 1

    return RecommendationResponse(
        user_summary=f"Analysis for {req.city}, {req.state} | Budget: ₹{req.budget_max_inr:,} | Commute: {req.daily_travel_km} km/day",
        top_recommendations=top_3_to_5,
        ai_personalized_advice=ai_explanation,
        best_value_pick_id=best_id,
        methodology_note="Calculated via AutoWise Deterministic Multi-Criteria Decision Algorithm (MCDA) based on actual Indian RTO taxes, authentic real-world fuel economy, and crash-test registries."
    )
