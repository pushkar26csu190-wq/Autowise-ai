from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    brand = Column(String, index=True, nullable=False)
    model = Column(String, nullable=False)
    variant = Column(String, nullable=False)
    category = Column(String, index=True, nullable=False)  # Compact SUV, Midsize SUV, Sedan, Hatchback, Electric SUV, Electric Car, Electric Scooter, Commuter Bike, Cruiser Bike
    vehicle_type = Column(String, index=True, default="Car")  # Car, Bike, Scooter, EV
    price_ex_showroom_inr = Column(Integer, nullable=False)
    image_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    # Engine & Powertrain
    fuel_type = Column(String, index=True, nullable=False)  # Petrol, Diesel, CNG, Strong Hybrid, Electric
    engine_cc = Column(Integer, nullable=True)
    battery_capacity_kwh = Column(Float, nullable=True)
    max_power_bhp = Column(Float, nullable=False)
    max_torque_nm = Column(Float, nullable=False)
    transmission = Column(String, nullable=False)  # Manual, Automatic, AMT, CVT, DCT, e-CVT, Single Speed
    drivetrain = Column(String, default="FWD")  # FWD, RWD, AWD, 4x4
    seating_capacity = Column(Integer, default=5)
    boot_space_litres = Column(Integer, nullable=True)
    ground_clearance_mm = Column(Integer, nullable=True)
    fuel_tank_capacity_l = Column(Float, nullable=True)

    # Mileage & Efficiency
    claimed_mileage = Column(Float, nullable=False)  # ARAI kmpl or km/charge
    real_world_city_mileage = Column(Float, nullable=False)
    real_world_highway_mileage = Column(Float, nullable=False)
    real_world_mixed_mileage = Column(Float, nullable=False)
    mileage_sample_size = Column(Integer, default=50)
    mileage_reliability_level = Column(String, default="High")  # High, Moderate, Preliminary

    # Safety
    b_ncap_rating = Column(Float, nullable=True)  # Stars (0-5)
    b_ncap_tested = Column(Boolean, default=False)
    b_ncap_adult_score = Column(String, nullable=True)  # e.g. "30.08 / 32.00"
    b_ncap_child_score = Column(String, nullable=True)  # e.g. "44.52 / 49.00"
    g_ncap_rating = Column(Float, nullable=True)
    g_ncap_tested = Column(Boolean, default=False)
    g_ncap_protocol = Column(String, nullable=True)  # e.g. "2022+ ESC & Side Pole Protocol" or "Pre-2022 Protocol"
    g_ncap_test_year = Column(Integer, nullable=True)
    tested_variant = Column(String, nullable=True)
    airbags_count = Column(Integer, default=6)
    has_abs = Column(Boolean, default=True)
    has_esc = Column(Boolean, default=True)
    has_isofix = Column(Boolean, default=True)
    adas_level = Column(Integer, default=0)  # 0, 1, 2
    adas_features = Column(Text, nullable=True)  # JSON or comma-separated: "Adaptive Cruise, Lane Keep Assist, AEB"

    # Financials & Ownership
    annual_maintenance_inr = Column(Integer, default=8000)
    five_year_maintenance_inr = Column(Integer, default=45000)
    resale_value_5yr_pct = Column(Float, default=58.0)  # percentage retained after 5 years
    warranty_years = Column(Integer, default=3)
    warranty_km = Column(Integer, default=100000)
    service_network_rating = Column(Float, default=4.2)  # out of 5

    # EV specifics
    real_world_range_km = Column(Float, nullable=True)
    ac_charging_time_hours = Column(Float, nullable=True)
    dc_fast_charging_mins_10_80 = Column(Integer, nullable=True)
    max_dc_charging_kw = Column(Float, nullable=True)

    # Relationships
    reviews = relationship("Review", back_populates="vehicle", cascade="all, delete-orphan")
    mileage_reports = relationship("MileageReport", back_populates="vehicle", cascade="all, delete-orphan")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    user_name = Column(String, nullable=False)
    user_city = Column(String, nullable=False)
    is_verified_owner = Column(Boolean, default=False)
    verification_badge = Column(String, default="Unverified")  # "RC Verified Owner", "Invoice Verified", "Unverified"
    ownership_duration_months = Column(Integer, default=12)
    odometer_reading_km = Column(Integer, default=10000)

    # Ratings 1-5
    rating_comfort = Column(Float, default=4.0)
    rating_mileage = Column(Float, default=4.0)
    rating_performance = Column(Float, default=4.0)
    rating_maintenance = Column(Float, default=4.0)
    rating_reliability = Column(Float, default=4.0)
    overall_rating = Column(Float, default=4.0)

    title = Column(String, nullable=False)
    review_text = Column(Text, nullable=False)
    pros = Column(Text, nullable=True)
    cons = Column(Text, nullable=True)
    common_problems_faced = Column(Text, nullable=True)
    monthly_repair_cost_inr = Column(Integer, default=0)
    sentiment = Column(String, default="Positive")  # Positive, Neutral, Critical
    status = Column(String, default="Approved")  # Approved, Pending, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="reviews")

class MileageReport(Base):
    __tablename__ = "mileage_reports"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    user_name = Column(String, nullable=False)
    user_city = Column(String, nullable=False)
    reported_kmpl = Column(Float, nullable=False)
    driving_condition = Column(String, nullable=False)  # "Heavy Bumper-to-Bumper City", "Normal City Traffic", "Highway Cruising (80-100 km/h)", "Mixed 50-50"
    ac_usage_pct = Column(Integer, default=80)  # e.g. 100%, 50%, 0%
    driving_style = Column(String, default="Moderate")  # "Sedate / Eco", "Moderate", "Aggressive"
    fuel_type_used = Column(String, default="Petrol")
    odometer_km = Column(Integer, default=5000)
    is_verified = Column(Boolean, default=False)
    proof_type = Column(String, default="Tank-to-Tank Method")  # "Tank-to-Tank Method", "MID Dash Photo", "OBD Telematics"
    status = Column(String, default="Approved")  # Approved, Pending
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="mileage_reports")

class CityProfile(Base):
    __tablename__ = "city_profiles"

    id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String, unique=True, index=True, nullable=False)
    state_name = Column(String, nullable=False)
    petrol_price = Column(Float, nullable=False)
    diesel_price = Column(Float, nullable=False)
    cng_price = Column(Float, nullable=False)
    electricity_unit_rate = Column(Float, default=7.5)  # INR per kWh
    traffic_congestion_index = Column(String, default="High")  # Very High, High, Moderate, Low
    average_city_speed_kmh = Column(Float, default=18.5)
    monsoon_waterlog_risk = Column(String, default="Moderate")  # High, Moderate, Low
    recommended_min_ground_clearance = Column(Integer, default=180)  # mm
    rto_road_tax_petrol_pct = Column(Float, default=10.0)
    rto_road_tax_diesel_pct = Column(Float, default=12.5)
    rto_road_tax_ev_pct = Column(Float, default=0.0)  # Many states have 0% road tax for EV
    special_regulation_notes = Column(Text, nullable=True)  # e.g. "Delhi NCR: 10-year diesel, 15-year petrol ban. Odd-Even & GRAP restrictions apply."
    ev_charging_density = Column(String, default="Good")  # High, Good, Emerging, Limited
    ev_chargers_count = Column(Integer, default=450)

class SavedComparison(Base):
    __tablename__ = "saved_comparisons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    vehicle_ids = Column(String, nullable=False)  # Comma-separated: "1,3,7"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    city = Column(String, default="Bengaluru")
    phone = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
