from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Vehicle, CityProfile
from app.schemas import OwnershipCostRequest, OwnershipCostResponse, YearCostBreakdown, VehicleOut

router = APIRouter(prefix="/ownership-cost", tags=["Ownership Cost"])

@router.post("/calculate", response_model=OwnershipCostResponse)
def calculate_ownership_cost(req: OwnershipCostRequest, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Fetch city profile for RTO road tax & fuel rate
    city_prof = db.query(CityProfile).filter(CityProfile.state_name.ilike(f"%{req.state_for_rto}%")).first()
    if not city_prof:
        city_prof = db.query(CityProfile).first()

    ex = vehicle.price_ex_showroom_inr

    # 1. State RTO Road Tax
    rto_pct = city_prof.rto_road_tax_petrol_pct
    if vehicle.fuel_type == "Diesel":
        rto_pct = city_prof.rto_road_tax_diesel_pct
    elif vehicle.fuel_type == "Electric":
        rto_pct = city_prof.rto_road_tax_ev_pct

    rto_tax = int(ex * (rto_pct / 100.0))
    # 2. Year 1 Comprehensive Insurance (1-yr Own Damage + 3-yr Third Party)
    insurance_y1 = int(ex * 0.038)
    # 3. Registration, Fastag & TCS (1% if ex >= 10 Lakh)
    tcs = int(ex * 0.01) if ex >= 1000000 else 0
    fastag_reg = 2500 + tcs

    on_road = ex + rto_tax + insurance_y1 + fastag_reg

    # 4. Loan & Down Payment
    down_payment = req.down_payment_inr if req.down_payment_inr is not None else int(on_road * 0.20)
    # Ensure down payment is reasonable
    down_payment = min(max(down_payment, 0), on_road)
    loan_principal = on_road - down_payment

    monthly_emi = 0
    total_interest = 0
    total_months = req.loan_tenure_years * 12

    if loan_principal > 0 and req.loan_interest_rate_pct > 0 and total_months > 0:
        monthly_rate = (req.loan_interest_rate_pct / 100.0) / 12.0
        # EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
        factor = (1 + monthly_rate) ** total_months
        monthly_emi = int((loan_principal * monthly_rate * factor) / (factor - 1))
        total_loan_amount_paid = monthly_emi * total_months
        total_interest = total_loan_amount_paid - loan_principal

    # 5. Fuel / Power Cost
    fuel_rate = req.fuel_price_override or city_prof.petrol_price
    if vehicle.fuel_type == "Diesel":
        fuel_rate = req.fuel_price_override or city_prof.diesel_price
    elif vehicle.fuel_type == "CNG":
        fuel_rate = req.fuel_price_override or city_prof.cng_price

    annual_km = req.annual_travel_km
    annual_fuel_cost = 0

    if vehicle.fuel_type == "Electric":
        kwh_per_km = (vehicle.battery_capacity_kwh or 30.0) / (vehicle.real_world_range_km or 250.0)
        annual_fuel_cost = int(annual_km * kwh_per_km * city_prof.electricity_unit_rate)
    else:
        annual_fuel_cost = int((annual_km / max(vehicle.real_world_mixed_mileage, 6.0)) * fuel_rate)

    five_yr_fuel = annual_fuel_cost * 5

    # 6. Scheduled Maintenance & Periodic Wear (Tyres, Battery)
    annual_sched_maint = vehicle.annual_maintenance_inr
    five_yr_maintenance = vehicle.five_year_maintenance_inr

    # 7. Insurance for Years 2 to 5 (assuming No Claim Bonus discounts: 20%, 25%, 35%, 45%)
    ins_y2 = int(insurance_y1 * 0.80)
    ins_y3 = int(insurance_y1 * 0.72)
    ins_y4 = int(insurance_y1 * 0.65)
    ins_y5 = int(insurance_y1 * 0.58)
    five_yr_insurance = insurance_y1 + ins_y2 + ins_y3 + ins_y4 + ins_y5

    # 8. Depreciated Resale Value at End of Year 5
    resale_pct = vehicle.resale_value_5yr_pct / 100.0
    estimated_resale_y5 = int(ex * resale_pct)

    # 9. Total 5-Year Out-of-Pocket Expenditure
    # Down Payment + All EMIs + 5yr Fuel + 5yr Maintenance + 5yr Insurance (Years 2-5, as Y1 is in On-Road)
    five_yr_total_expenditure = (
        down_payment +
        (monthly_emi * total_months) +
        five_yr_fuel +
        five_yr_maintenance +
        (ins_y2 + ins_y3 + ins_y4 + ins_y5)
    )

    # True Net Ownership Cost = Total Out-of-Pocket minus Resale Recovery
    true_net_cost = five_yr_total_expenditure - estimated_resale_y5
    monthly_effective = int(true_net_cost / 60)
    per_km_cost = round(true_net_cost / (annual_km * 5), 2)

    # Build Year-by-Year Progression for Recharts
    yearly_breakdowns: List[YearCostBreakdown] = []
    cumulative = down_payment
    depreciation_schedule = [0.85, 0.75, 0.68, 0.62, resale_pct]
    insurance_schedule = [insurance_y1, ins_y2, ins_y3, ins_y4, ins_y5]

    for yr in range(1, 6):
        # Principal and interest split for the year
        yr_emi_principal = int(loan_principal / req.loan_tenure_years) if yr <= req.loan_tenure_years else 0
        yr_emi_interest = int(total_interest / req.loan_tenure_years) if yr <= req.loan_tenure_years else 0
        yr_ins = insurance_schedule[yr - 1]
        yr_maint = annual_sched_maint
        yr_repairs = 12000 if yr == 4 else 2000  # Year 4 tyre change allowance

        # Cumulative out of pocket
        yr_cash_flow = (yr_emi_principal + yr_emi_interest) + annual_fuel_cost + yr_maint + yr_repairs + (yr_ins if yr > 1 else 0)
        cumulative += yr_cash_flow

        depreciated_val = int(ex * depreciation_schedule[yr - 1])

        yearly_breakdowns.append(YearCostBreakdown(
            year=yr,
            fuel_or_power_cost=annual_fuel_cost,
            loan_emi_principal=yr_emi_principal,
            loan_emi_interest=yr_emi_interest,
            insurance_cost=yr_ins,
            scheduled_maintenance=yr_maint,
            repairs_and_tyres=yr_repairs,
            cumulative_cost=cumulative,
            vehicle_depreciated_value=depreciated_val
        ))

    return OwnershipCostResponse(
        vehicle=VehicleOut.model_validate(vehicle),
        ex_showroom_price=ex,
        rto_road_tax=rto_tax,
        insurance_year_1=insurance_y1,
        registration_fastag=fastag_reg,
        on_road_purchase_price=on_road,
        down_payment=down_payment,
        loan_amount=loan_principal,
        monthly_emi=monthly_emi,
        total_loan_interest=total_interest,
        five_year_fuel_cost=five_yr_fuel,
        five_year_insurance_cost=five_yr_insurance,
        five_year_maintenance_cost=five_yr_maintenance,
        five_year_total_expenditure=five_yr_total_expenditure,
        estimated_resale_value_year_5=estimated_resale_y5,
        five_year_true_net_ownership_cost=true_net_cost,
        monthly_effective_cost=monthly_effective,
        per_km_cost=per_km_cost,
        yearly_breakdowns=yearly_breakdowns
    )
