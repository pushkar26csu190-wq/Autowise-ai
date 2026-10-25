export interface Vehicle {
  id: number;
  name: string;
  brand: string;
  model: string;
  variant: string;
  category: string;
  vehicle_type: string;
  price_ex_showroom_inr: number;
  image_url?: string;
  description?: string;
  fuel_type: string;
  engine_cc?: number;
  battery_capacity_kwh?: number;
  max_power_bhp: number;
  max_torque_nm: number;
  transmission: string;
  drivetrain: string;
  seating_capacity: number;
  boot_space_litres?: number;
  ground_clearance_mm?: number;
  fuel_tank_capacity_l?: number;
  claimed_mileage: number;
  real_world_city_mileage: number;
  real_world_highway_mileage: number;
  real_world_mixed_mileage: number;
  mileage_sample_size: number;
  mileage_reliability_level: string;
  b_ncap_rating?: number;
  b_ncap_tested: boolean;
  b_ncap_adult_score?: string;
  b_ncap_child_score?: string;
  g_ncap_rating?: number;
  g_ncap_tested: boolean;
  g_ncap_protocol?: string;
  g_ncap_test_year?: number;
  tested_variant?: string;
  airbags_count: number;
  has_abs: boolean;
  has_esc: boolean;
  has_isofix: boolean;
  adas_level: number;
  adas_features?: string;
  annual_maintenance_inr: number;
  five_year_maintenance_inr: number;
  resale_value_5yr_pct: number;
  warranty_years: number;
  warranty_km: number;
  service_network_rating: number;
  real_world_range_km?: number;
  ac_charging_time_hours?: number;
  dc_fast_charging_mins_10_80?: number;
  max_dc_charging_kw?: number;
}

export interface RecommendedVehicle {
  vehicle: Vehicle;
  suitability_score: number;
  reasons_for_recommendation: string[];
  advantages: string[];
  disadvantages: string[];
  monthly_fuel_running_cost_inr: number;
  five_year_true_ownership_cost_inr: number;
  safety_summary: string;
  real_world_mileage_highlight: string;
  local_city_insight: string;
}

export interface RecommendationResponse {
  user_summary: string;
  top_recommendations: RecommendedVehicle[];
  ai_personalized_advice: string;
  best_value_pick_id: number;
  methodology_note: string;
}

export interface ComparisonAttribute {
  name: string;
  key: string;
  values: Record<number, any>;
  best_vehicle_id?: number;
  unit: string;
}

export interface ComparisonResponse {
  vehicles: Vehicle[];
  category_attributes: Record<string, ComparisonAttribute[]>;
  ai_comparison_verdict: string;
  recommended_vehicle_for_city: number;
  recommended_vehicle_for_highway: number;
  recommended_vehicle_for_value: number;
}

export interface YearCostBreakdown {
  year: number;
  fuel_or_power_cost: number;
  loan_emi_principal: number;
  loan_emi_interest: number;
  insurance_cost: number;
  scheduled_maintenance: number;
  repairs_and_tyres: number;
  cumulative_cost: number;
  vehicle_depreciated_value: number;
}

export interface OwnershipCostResponse {
  vehicle: Vehicle;
  ex_showroom_price: number;
  rto_road_tax: number;
  insurance_year_1: number;
  registration_fastag: number;
  on_road_purchase_price: number;
  down_payment: number;
  loan_amount: number;
  monthly_emi: number;
  total_loan_interest: number;
  five_year_fuel_cost: number;
  five_year_insurance_cost: number;
  five_year_maintenance_cost: number;
  five_year_total_expenditure: number;
  estimated_resale_value_year_5: number;
  five_year_true_net_ownership_cost: number;
  monthly_effective_cost: number;
  per_km_cost: number;
  yearly_breakdowns: YearCostBreakdown[];
}

export interface CityProfile {
  id: number;
  city_name: string;
  state_name: string;
  petrol_price: number;
  diesel_price: number;
  cng_price: number;
  electricity_unit_rate: number;
  traffic_congestion_index: string;
  average_city_speed_kmh: number;
  monsoon_waterlog_risk: string;
  recommended_min_ground_clearance: number;
  rto_road_tax_petrol_pct: number;
  rto_road_tax_diesel_pct: number;
  rto_road_tax_ev_pct: number;
  special_regulation_notes?: string;
  ev_charging_density: string;
  ev_chargers_count: number;
}

export interface Review {
  id: number;
  vehicle_id: number;
  user_name: string;
  user_city: string;
  is_verified_owner: boolean;
  verification_badge: string;
  ownership_duration_months: number;
  odometer_reading_km: number;
  rating_comfort: number;
  rating_mileage: number;
  rating_performance: number;
  rating_maintenance: number;
  rating_reliability: number;
  overall_rating: number;
  title: string;
  review_text: string;
  pros?: string;
  cons?: string;
  common_problems_faced?: string;
  monthly_repair_cost_inr: number;
  sentiment: string;
  status: string;
  created_at: string;
}

export interface MileageReport {
  id: number;
  vehicle_id: number;
  user_name: string;
  user_city: string;
  reported_kmpl: number;
  driving_condition: string;
  ac_usage_pct: number;
  driving_style: string;
  fuel_type_used: string;
  is_verified: boolean;
  proof_type: string;
  status: string;
  created_at: string;
}

export interface EvCalculatorResult {
  usable_energy_added_kwh: number;
  estimated_range_gained_km: number;
  temperature_speed_efficiency_factor: number;
  charging_times: {
    home_3_3kw_hours: number;
    wallbox_7_2kw_hours: number;
    dc_30kw_mins: number;
    dc_50kw_highway_mins: number;
  };
  total_charging_cost_inr: number;
  cost_per_km_inr: number;
  ice_petrol_equivalent_cost_inr: number;
  savings_vs_petrol_inr: number;
}

export interface ChargingStation {
  id: number;
  name: string;
  city: string;
  lat: number;
  lng: number;
  address: string;
  charger_types: string[];
  cost_per_kwh: number;
  status: string;
  network: string;
  rating: number;
}

export interface LocationAdvisorResponse {
  city_profile: CityProfile;
  local_fuel_economics: {
    monthly_commute_km: number;
    monthly_petrol_inr: number;
    monthly_diesel_inr: number;
    monthly_ev_electricity_inr: number;
    annual_ev_savings_vs_petrol_inr: number;
  };
  ground_clearance_guidance: string;
  regulatory_alert?: string;
  top_city_vehicle_picks: Vehicle[];
  ev_feasibility_verdict: string;
}

export interface SavedComparison {
  id: number;
  user_id: string;
  title: string;
  vehicle_ids: string;
  notes?: string;
  created_at: string;
}
