from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Vehicle Schemas ---
class VehicleBase(BaseModel):
    name: str
    brand: str
    model: str
    variant: str
    category: str
    vehicle_type: str = "Car"
    price_ex_showroom_inr: int
    image_url: Optional[str] = None
    description: Optional[str] = None
    fuel_type: str
    engine_cc: Optional[int] = None
    battery_capacity_kwh: Optional[float] = None
    max_power_bhp: float
    max_torque_nm: float
    transmission: str
    drivetrain: str = "FWD"
    seating_capacity: int = 5
    boot_space_litres: Optional[int] = None
    ground_clearance_mm: Optional[int] = None
    fuel_tank_capacity_l: Optional[float] = None
    claimed_mileage: float
    real_world_city_mileage: float
    real_world_highway_mileage: float
    real_world_mixed_mileage: float
    mileage_sample_size: int = 50
    mileage_reliability_level: str = "High"
    b_ncap_rating: Optional[float] = None
    b_ncap_tested: bool = False
    b_ncap_adult_score: Optional[str] = None
    b_ncap_child_score: Optional[str] = None
    g_ncap_rating: Optional[float] = None
    g_ncap_tested: bool = False
    g_ncap_protocol: Optional[str] = None
    g_ncap_test_year: Optional[int] = None
    tested_variant: Optional[str] = None
    airbags_count: int = 6
    has_abs: bool = True
    has_esc: bool = True
    has_isofix: bool = True
    adas_level: int = 0
    adas_features: Optional[str] = None
    annual_maintenance_inr: int = 8000
    five_year_maintenance_inr: int = 45000
    resale_value_5yr_pct: float = 58.0
    warranty_years: int = 3
    warranty_km: int = 100000
    service_network_rating: float = 4.2
    real_world_range_km: Optional[float] = None
    ac_charging_time_hours: Optional[float] = None
    dc_fast_charging_mins_10_80: Optional[int] = None
    max_dc_charging_kw: Optional[float] = None

class VehicleOut(VehicleBase):
    id: int

    class Config:
        from_attributes = True

# --- Recommendation Schemas ---
class RecommendationRequest(BaseModel):
    budget_max_inr: int = Field(..., description="Maximum budget in INR (e.g. 1500000 for 15 Lakh)")
    city: str = Field(..., description="User's City (e.g. Bengaluru, Delhi, Mumbai)")
    state: str = Field(..., description="User's State (e.g. Karnataka, Delhi, Maharashtra)")
    daily_travel_km: float = Field(..., description="Daily travel distance in km")
    vehicle_category: str = Field("Any", description="Car, SUV, Sedan, Hatchback, Bike, Scooter, EV")
    passengers: int = Field(5, description="Number of passengers regular occupancy")
    fuel_preference: str = Field("Any", description="Any, Petrol, Diesel, CNG, Strong Hybrid, Electric")
    transmission_preference: str = Field("Any", description="Any, Manual, Automatic")
    driving_environment: str = Field("City", description="City Heavy, City Moderate, Highway, Mixed")
    safety_priority: str = Field("High", description="High (5-Star NCAP), Medium, Standard")
    mileage_importance: str = Field("High", description="High, Medium, Not Crucial")
    annual_maintenance_budget_inr: Optional[int] = Field(None, description="Max annual maintenance budget")
    preferred_brands: List[str] = Field(default_factory=list, description="Brands liked by user")

class RecommendedVehicle(BaseModel):
    vehicle: VehicleOut
    suitability_score: int  # 0 to 100
    reasons_for_recommendation: List[str]
    advantages: List[str]
    disadvantages: List[str]
    monthly_fuel_running_cost_inr: int
    five_year_true_ownership_cost_inr: int
    safety_summary: str
    real_world_mileage_highlight: str
    local_city_insight: str

class RecommendationResponse(BaseModel):
    user_summary: str
    top_recommendations: List[RecommendedVehicle]
    ai_personalized_advice: str
    best_value_pick_id: int
    methodology_note: str

# --- Comparison Schemas ---
class ComparisonRequest(BaseModel):
    vehicle_ids: List[int] = Field(..., max_length=4)
    driving_km_per_month: float = 1200.0
    city_name: str = "Bengaluru"

class ComparisonAttribute(BaseModel):
    name: str
    key: str
    values: Dict[int, Any]
    best_vehicle_id: Optional[int] = None
    unit: str = ""

class ComparisonResponse(BaseModel):
    vehicles: List[VehicleOut]
    category_attributes: Dict[str, List[ComparisonAttribute]]
    ai_comparison_verdict: str
    recommended_vehicle_for_city: int
    recommended_vehicle_for_highway: int
    recommended_vehicle_for_value: int

# --- True Ownership Cost Schemas ---
class OwnershipCostRequest(BaseModel):
    vehicle_id: int
    down_payment_inr: Optional[int] = None
    loan_tenure_years: int = 5
    loan_interest_rate_pct: float = 9.0
    annual_travel_km: float = 12000.0
    fuel_price_override: Optional[float] = None
    state_for_rto: str = "Karnataka"

class YearCostBreakdown(BaseModel):
    year: int
    fuel_or_power_cost: int
    loan_emi_principal: int
    loan_emi_interest: int
    insurance_cost: int
    scheduled_maintenance: int
    repairs_and_tyres: int
    cumulative_cost: int
    vehicle_depreciated_value: int

class OwnershipCostResponse(BaseModel):
    vehicle: VehicleOut
    ex_showroom_price: int
    rto_road_tax: int
    insurance_year_1: int
    registration_fastag: int
    on_road_purchase_price: int
    down_payment: int
    loan_amount: int
    monthly_emi: int
    total_loan_interest: int
    five_year_fuel_cost: int
    five_year_insurance_cost: int
    five_year_maintenance_cost: int
    five_year_total_expenditure: int
    estimated_resale_value_year_5: int
    five_year_true_net_ownership_cost: int
    monthly_effective_cost: int
    per_km_cost: float
    yearly_breakdowns: List[YearCostBreakdown]

# --- Real-World Mileage Schemas ---
class MileageSubmissionRequest(BaseModel):
    vehicle_id: int
    user_name: str
    user_city: str
    reported_kmpl: float
    driving_condition: str
    ac_usage_pct: int
    driving_style: str
    fuel_type_used: str
    odometer_km: int
    proof_type: str

class MileageReportOut(BaseModel):
    id: int
    vehicle_id: int
    user_name: str
    user_city: str
    reported_kmpl: float
    driving_condition: str
    ac_usage_pct: int
    driving_style: str
    fuel_type_used: str
    is_verified: bool
    proof_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- EV Calculator Schemas ---
class EvCalculatorRequest(BaseModel):
    vehicle_id: int
    starting_battery_pct: float = Field(20.0, ge=0, le=100)
    desired_battery_pct: float = Field(80.0, ge=0, le=100)
    average_speed_kmh: float = 65.0
    ac_running: bool = True
    ambient_temp_celsius: float = 32.0
    electricity_tariff_inr: float = 8.0

class EvCalculatorResponse(BaseModel):
    usable_energy_added_kwh: float
    estimated_range_gained_km: float
    temperature_speed_efficiency_factor: float
    charging_times: Dict[str, Any]  # "3.3kW_Home", "7.2kW_Wallbox", "30kW_DC", "50kW_DC"
    total_charging_cost_inr: float
    cost_per_km_inr: float
    ice_petrol_equivalent_cost_inr: float
    savings_vs_petrol_inr: float

# --- Location Advisor Schemas ---
class LocationAdvisorRequest(BaseModel):
    city_name: str
    daily_commute_km: float = 25.0
    budget_inr: int = 1500000

class LocationAdvisorResponse(BaseModel):
    city_profile: Dict[str, Any]
    local_fuel_economics: Dict[str, Any]
    ground_clearance_guidance: str
    regulatory_alert: Optional[str]
    top_city_vehicle_picks: List[VehicleOut]
    ev_feasibility_verdict: str

# --- Reviews Schemas ---
class ReviewCreate(BaseModel):
    vehicle_id: int
    user_name: str
    user_city: str
    verification_badge: str = "Unverified"
    ownership_duration_months: int = 12
    odometer_reading_km: int = 10000
    rating_comfort: float
    rating_mileage: float
    rating_performance: float
    rating_maintenance: float
    rating_reliability: float
    title: str
    review_text: str
    pros: Optional[str] = None
    cons: Optional[str] = None
    common_problems_faced: Optional[str] = None
    monthly_repair_cost_inr: int = 0

class ReviewOut(BaseModel):
    id: int
    vehicle_id: int
    user_name: str
    user_city: str
    is_verified_owner: bool
    verification_badge: str
    ownership_duration_months: int
    odometer_reading_km: int
    rating_comfort: float
    rating_mileage: float
    rating_performance: float
    rating_maintenance: float
    rating_reliability: float
    overall_rating: float
    title: str
    review_text: str
    pros: Optional[str] = None
    cons: Optional[str] = None
    common_problems_faced: Optional[str] = None
    monthly_repair_cost_inr: int
    sentiment: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Saved Comparison Schemas ---
class SavedComparisonCreate(BaseModel):
    user_id: str
    title: str
    vehicle_ids: str
    notes: Optional[str] = None

class SavedComparisonOut(BaseModel):
    id: int
    user_id: str
    title: str
    vehicle_ids: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
