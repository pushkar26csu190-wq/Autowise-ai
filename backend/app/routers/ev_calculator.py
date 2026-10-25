from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models import Vehicle
from app.schemas import EvCalculatorRequest, EvCalculatorResponse

router = APIRouter(prefix="/ev", tags=["EV Calculator & Charging"])

INDIAN_CHARGING_STATIONS = [
    {
        "id": 1,
        "name": "Tata Power EZ Charge - Indiranagar",
        "city": "Bengaluru",
        "lat": 12.9784,
        "lng": 77.6408,
        "address": "100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038",
        "charger_types": ["60 kW CCS2 DC Fast", "22 kW Type-2 AC"],
        "cost_per_kwh": 18.5,
        "status": "Available",
        "network": "Tata Power",
        "rating": 4.6
    },
    {
        "id": 2,
        "name": "Zeon Charging - Electronic City Phase 1",
        "city": "Bengaluru",
        "lat": 12.8452,
        "lng": 77.6602,
        "address": "Velankani Tech Park, Electronic City, Bengaluru, Karnataka 560100",
        "charger_types": ["50 kW CCS2 DC Fast", "7.4 kW AC"],
        "cost_per_kwh": 19.0,
        "status": "Available",
        "network": "Zeon Charging",
        "rating": 4.8
    },
    {
        "id": 3,
        "name": "Jio-bp pulse - Bandra Kurla Complex",
        "city": "Mumbai",
        "lat": 19.0657,
        "lng": 72.8687,
        "address": "G Block BKC, Bandra East, Mumbai, Maharashtra 400051",
        "charger_types": ["60 kW Dual Gun CCS2", "30 kW DC Fast"],
        "cost_per_kwh": 21.0,
        "status": "Available",
        "network": "Jio-bp pulse",
        "rating": 4.7
    },
    {
        "id": 4,
        "name": "Tata Power EV Station - Connaught Place",
        "city": "Delhi NCR",
        "lat": 28.6315,
        "lng": 77.2167,
        "address": "Outer Circle, Block E, Connaught Place, New Delhi 110001",
        "charger_types": ["50 kW CCS2", "15A 3.3 kW AC"],
        "cost_per_kwh": 17.0,
        "status": "Available",
        "network": "Tata Power",
        "rating": 4.4
    },
    {
        "id": 5,
        "name": "Ather Grid Fast Charger - Gachibowli",
        "city": "Hyderabad",
        "lat": 17.4401,
        "lng": 78.3489,
        "address": "Telecom Nagar, Gachibowli, Hyderabad, Telangana 500032",
        "charger_types": ["Ather Fast DC", "Type-2 AC"],
        "cost_per_kwh": 16.5,
        "status": "Available",
        "network": "Ather Grid",
        "rating": 4.9
    },
    {
        "id": 6,
        "name": "Bolt.Earth Fast Hub - Anna Nagar",
        "city": "Chennai",
        "lat": 13.0850,
        "lng": 80.2101,
        "address": "2nd Avenue, Anna Nagar, Chennai, Tamil Nadu 600040",
        "charger_types": ["30 kW CCS2 DC", "3.3 kW AC"],
        "cost_per_kwh": 18.0,
        "status": "Available",
        "network": "Bolt.Earth",
        "rating": 4.5
    }
]

@router.post("/calculate", response_model=EvCalculatorResponse)
def calculate_ev_metrics(req: EvCalculatorRequest, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    battery_capacity = vehicle.battery_capacity_kwh or 35.0
    full_range_km = vehicle.real_world_range_km or 265.0

    # SoC Delta
    soc_delta = max(req.desired_battery_pct - req.starting_battery_pct, 1.0)
    energy_added_kwh = round(battery_capacity * (soc_delta / 100.0), 2)

    # Efficiency factor based on ambient temperature, cruising speed, and AC
    # Base baseline: 25°C, 60 km/h, AC moderate
    speed_penalty = 1.0
    if req.average_speed_kmh > 80:
        speed_penalty += (req.average_speed_kmh - 80) * 0.008  # ~16% penalty at 100 km/h
    elif req.average_speed_kmh < 40:
        speed_penalty += 0.05  # Creep in traffic

    temp_penalty = 1.0
    if req.ambient_temp_celsius > 35:
        temp_penalty += (req.ambient_temp_celsius - 35) * 0.015  # Indian summer AC cooling penalty
    elif req.ambient_temp_celsius < 10:
        temp_penalty += 0.08  # Winter battery chilling

    ac_penalty = 1.12 if req.ac_running else 1.0

    combined_efficiency_factor = round(speed_penalty * temp_penalty * ac_penalty, 2)

    # Usable real range gained
    base_km_per_kwh = full_range_km / battery_capacity
    adjusted_km_per_kwh = base_km_per_kwh / combined_efficiency_factor
    range_gained = round(energy_added_kwh * adjusted_km_per_kwh, 1)

    # Charging Time Calculations across speeds:
    # 3.3 kW Home AC (90% charger efficiency)
    time_3_3kw = round((energy_added_kwh / (3.3 * 0.90)), 2)
    # 7.2 kW Wallbox (92% efficiency)
    time_7_2kw = round((energy_added_kwh / (7.2 * 0.92)), 2)
    # 30 kW DC Fast
    time_30kw_mins = int((energy_added_kwh / 30.0) * 60)
    # 50 kW Highway DC Fast
    time_50kw_mins = int((energy_added_kwh / min(50.0, vehicle.max_dc_charging_kw or 50.0)) * 60)

    # Costs
    charging_cost = round(energy_added_kwh * req.electricity_tariff_inr, 2)
    cost_per_km = round(charging_cost / max(range_gained, 1.0), 2)

    # Comparison to Petrol (assumes 13.5 kmpl @ ₹102/L = ₹7.55 / km)
    petrol_cost_for_same_distance = round(range_gained * 7.55, 2)
    savings = round(max(petrol_cost_for_same_distance - charging_cost, 0.0), 2)

    return EvCalculatorResponse(
        usable_energy_added_kwh=energy_added_kwh,
        estimated_range_gained_km=range_gained,
        temperature_speed_efficiency_factor=combined_efficiency_factor,
        charging_times={
            "home_3_3kw_hours": time_3_3kw,
            "wallbox_7_2kw_hours": time_7_2kw,
            "dc_30kw_mins": time_30kw_mins,
            "dc_50kw_highway_mins": time_50kw_mins
        },
        total_charging_cost_inr=charging_cost,
        cost_per_km_inr=cost_per_km,
        ice_petrol_equivalent_cost_inr=petrol_cost_for_same_distance,
        savings_vs_petrol_inr=savings
    )

@router.get("/chargers")
def get_charging_stations(city: str = None):
    if city and city != "All":
        return [s for s in INDIAN_CHARGING_STATIONS if s["city"].lower() == city.lower()]
    return INDIAN_CHARGING_STATIONS
