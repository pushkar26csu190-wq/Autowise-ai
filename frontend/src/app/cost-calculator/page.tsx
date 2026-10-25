"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { fetchVehicles, calculateOwnershipCost } from "@/lib/api";
import { Vehicle, OwnershipCostResponse } from "@/lib/types";
import { 
  Calculator, 
  IndianRupee, 
  Fuel, 
  Shield, 
  Wrench, 
  TrendingDown, 
  Sliders,
  ChevronRight,
  Info
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

function CostCalculatorContent() {
  const searchParams = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(1);
  const [annualTravelKm, setAnnualTravelKm] = useState<number>(12000);
  const [loanTenure, setLoanTenure] = useState<number>(5);
  const [interestRate, setInterestRate] = useState<number>(9.0);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20);
  const [stateRto, setStateRto] = useState("Karnataka");
  const [costData, setCostData] = useState<OwnershipCostResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicles().then((data) => {
      setVehicles(data);
      const urlId = searchParams.get("id");
      if (urlId && data.some((v: Vehicle) => v.id === Number(urlId))) {
        setSelectedVehicleId(Number(urlId));
      } else if (data.length > 0) {
        setSelectedVehicleId(data[0].id);
      }
    });
  }, [searchParams]);

  useEffect(() => {
    if (selectedVehicleId) {
      calculateCost();
    }
  }, [selectedVehicleId, annualTravelKm, loanTenure, interestRate, downPaymentPct, stateRto]);

  const calculateCost = async () => {
    setLoading(true);
    try {
      // Calculate custom down payment amount based on target pct
      const currentV = vehicles.find((v) => v.id === selectedVehicleId);
      const approxOnRoad = currentV ? currentV.price_ex_showroom_inr * 1.15 : 1500000;
      const dpAmount = Math.round(approxOnRoad * (downPaymentPct / 100));

      const res = await calculateOwnershipCost({
        vehicle_id: selectedVehicleId,
        down_payment_inr: dpAmount,
        loan_tenure_years: loanTenure,
        loan_interest_rate_pct: interestRate,
        annual_travel_km: annualTravelKm,
        state_for_rto: stateRto
      });
      setCostData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Transform yearly breakdowns for Recharts
  const chartData = costData?.yearly_breakdowns.map((b) => ({
    name: `Year ${b.year}`,
    Fuel: b.fuel_or_power_cost,
    EMI: b.loan_emi_principal + b.loan_emi_interest,
    Insurance: b.insurance_cost,
    Maintenance: b.scheduled_maintenance + b.repairs_and_tyres,
    ResaleValue: b.vehicle_depreciated_value
  })) || [];

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3 uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Financial Simulator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Five-Year True Ownership Cost (TCO) Calculator
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Purchasing a vehicle is only 55-60% of what you actually spend. Calculate true monthly expenditure including loan interest, local fuel rates, insurance renewals, and resale recovery.
          </p>
        </div>

        {/* Controls Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Vehicle Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Select Vehicle
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (₹{(v.price_ex_showroom_inr / 100000).toFixed(1)}L)
                  </option>
                ))}
              </select>
            </div>

            {/* Annual Running Km */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Annual Travel (Km)
                </label>
                <span className="text-xs font-black text-emerald-400">
                  {annualTravelKm.toLocaleString()} km
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="30000"
                step="1000"
                value={annualTravelKm}
                onChange={(e) => setAnnualTravelKm(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>5,000 km</span>
                <span>15,000 km</span>
                <span>30,000 km</span>
              </div>
            </div>

            {/* Loan Tenure & Interest Rate */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Loan Tenure & Interest
                </label>
                <span className="text-xs font-black text-white">
                  {loanTenure} Yrs @ {interestRate}%
                </span>
              </div>
              <div className="flex gap-2">
                <select
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(Number(e.target.value))}
                  className="w-1/2 px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white"
                >
                  <option value={3}>3 Years</option>
                  <option value={4}>4 Years</option>
                  <option value={5}>5 Years</option>
                  <option value={7}>7 Years</option>
                </select>
                <select
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-1/2 px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white"
                >
                  <option value={8.5}>8.5% p.a.</option>
                  <option value={9.0}>9.0% p.a.</option>
                  <option value={9.5}>9.5% p.a.</option>
                  <option value={10.5}>10.5% p.a.</option>
                </select>
              </div>
            </div>

            {/* State for RTO tax */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                State for RTO Tax
              </label>
              <select
                value={stateRto}
                onChange={(e) => setStateRto(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Karnataka">Karnataka (18% RTO)</option>
                <option value="Delhi">Delhi (10% RTO)</option>
                <option value="Maharashtra">Maharashtra (11% RTO)</option>
                <option value="Telangana">Telangana (14% RTO)</option>
                <option value="Tamil Nadu">Tamil Nadu (13% RTO)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Banner Grid */}
        {costData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                Total On-Road Acquisition
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                ₹{(costData.on_road_purchase_price / 100000).toFixed(2)} Lakh
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Ex-Showroom + RTO (₹{costData.rto_road_tax.toLocaleString()}) + 1st Yr Ins.
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                Monthly Loan EMI
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                ₹{costData.monthly_emi.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ mo</span>
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Total interest paid: ₹{costData.total_loan_interest.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                5-Year Fuel / Power Cost
              </span>
              <span className="text-2xl font-black text-teal-400 mt-1 block">
                ₹{costData.five_year_fuel_cost.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Based on {annualTravelKm * 5} total km
              </span>
            </div>

            <div className="bg-gradient-to-tr from-emerald-950 to-slate-900 border border-emerald-500/40 rounded-2xl p-5">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">
                5-Year Net True Ownership Cost
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                ₹{(costData.five_year_true_net_ownership_cost / 100000).toFixed(2)} Lakh
              </span>
              <span className="text-[11px] text-emerald-300 font-semibold mt-1 block">
                Effective: ₹{costData.per_km_cost} per km (₹{costData.monthly_effective_cost.toLocaleString()} / mo)
              </span>
            </div>
          </div>
        )}

        {/* Interactive Charts Section */}
        {costData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Stacked Annual Outflow */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-base font-black text-white mb-2 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                Yearly Expense Outflow Breakdown
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Visualizing fuel running cost, EMI repayment, insurance, and routine servicing.
              </p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, ""]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Bar dataKey="Fuel" stackId="a" fill="#10b981" />
                    <Bar dataKey="EMI" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="Insurance" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="Maintenance" stackId="a" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Resale Value Depreciation Curve */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h3 className="text-base font-black text-white mb-2 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-teal-400" />
                5-Year Resale Value Retention Curve
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Estimated resale recovery value at the end of each year in the Indian pre-owned market.
              </p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Resale Value"]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Line type="monotone" dataKey="ResaleValue" stroke="#2dd4bf" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Financial Summary Table */}
        {costData && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-lg font-black text-white mb-4">Complete 5-Year Financial Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60">
                    <th className="py-3 px-4 font-bold text-slate-400">Financial Head</th>
                    <th className="py-3 px-4 font-bold text-slate-400">Year 1</th>
                    <th className="py-3 px-4 font-bold text-slate-400">Year 2</th>
                    <th className="py-3 px-4 font-bold text-slate-400">Year 3</th>
                    <th className="py-3 px-4 font-bold text-slate-400">Year 4</th>
                    <th className="py-3 px-4 font-bold text-slate-400">Year 5</th>
                    <th className="py-3 px-4 font-bold text-emerald-400">5-Yr Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Fuel / Energy</td>
                    {costData.yearly_breakdowns.map((b) => (
                      <td key={b.year} className="py-3 px-4 text-slate-300">₹{b.fuel_or_power_cost.toLocaleString()}</td>
                    ))}
                    <td className="py-3 px-4 font-bold text-emerald-400">₹{costData.five_year_fuel_cost.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Loan EMI Repayment</td>
                    {costData.yearly_breakdowns.map((b) => (
                      <td key={b.year} className="py-3 px-4 text-slate-300">
                        ₹{(b.loan_emi_principal + b.loan_emi_interest).toLocaleString()}
                      </td>
                    ))}
                    <td className="py-3 px-4 font-bold text-blue-400">
                      ₹{(costData.monthly_emi * loanTenure * 12).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Comprehensive Insurance</td>
                    {costData.yearly_breakdowns.map((b) => (
                      <td key={b.year} className="py-3 px-4 text-slate-300">₹{b.insurance_cost.toLocaleString()}</td>
                    ))}
                    <td className="py-3 px-4 font-bold text-amber-400">₹{costData.five_year_insurance_cost.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Service & Tyres</td>
                    {costData.yearly_breakdowns.map((b) => (
                      <td key={b.year} className="py-3 px-4 text-slate-300">₹{(b.scheduled_maintenance + b.repairs_and_tyres).toLocaleString()}</td>
                    ))}
                    <td className="py-3 px-4 font-bold text-purple-400">₹{costData.five_year_maintenance_cost.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-slate-950/80 font-bold">
                    <td className="py-3 px-4 text-white">Vehicle Asset Resale Value</td>
                    {costData.yearly_breakdowns.map((b) => (
                      <td key={b.year} className="py-3 px-4 text-teal-400">₹{b.vehicle_depreciated_value.toLocaleString()}</td>
                    ))}
                    <td className="py-3 px-4 text-teal-400">₹{costData.estimated_resale_value_year_5.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CostCalculatorPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading ownership cost calculator...</div>}>
      <CostCalculatorContent />
    </Suspense>
  );
}
