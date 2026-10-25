"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getRecommendations } from "@/lib/api";
import { RecommendationResponse, RecommendedVehicle } from "@/lib/types";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Fuel, 
  Calculator, 
  MapPin, 
  IndianRupee, 
  Sliders, 
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Car
} from "lucide-react";

export default function RecommendationsPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form State (12 criteria)
  const [budgetMaxInr, setBudgetMaxInr] = useState<number>(1500000);
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [dailyTravelKm, setDailyTravelKm] = useState<number>(35);
  const [vehicleCategory, setVehicleCategory] = useState("Compact SUV");
  const [passengers, setPassengers] = useState<number>(5);
  const [fuelPreference, setFuelPreference] = useState("Any");
  const [transmissionPreference, setTransmissionPreference] = useState("Automatic");
  const [drivingEnvironment, setDrivingEnvironment] = useState("City Heavy");
  const [safetyPriority, setSafetyPriority] = useState("High");
  const [mileageImportance, setMileageImportance] = useState("High");
  const [maintenanceBudget, setMaintenanceBudget] = useState<number>(10000);
  const [preferredBrands, setPreferredBrands] = useState<string[]>(["Tata", "Maruti Suzuki"]);

  // Result state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const indianCities = [
    { city: "Bengaluru", state: "Karnataka" },
    { city: "Delhi NCR", state: "Delhi" },
    { city: "Mumbai", state: "Maharashtra" },
    { city: "Hyderabad", state: "Telangana" },
    { city: "Chennai", state: "Tamil Nadu" },
    { city: "Pune", state: "Maharashtra" },
    { city: "Kolkata", state: "West Bengal" },
    { city: "Ahmedabad", state: "Gujarat" }
  ];

  const brandOptions = ["Tata", "Maruti Suzuki", "Hyundai", "Mahindra", "Honda", "Ather", "Royal Enfield"];

  const toggleBrand = (b: string) => {
    if (preferredBrands.includes(b)) {
      setPreferredBrands(preferredBrands.filter((x) => x !== b));
    } else {
      setPreferredBrands([...preferredBrands, b]);
    }
  };

  const handleCityChange = (cityName: string) => {
    setCity(cityName);
    const found = indianCities.find((c) => c.city === cityName);
    if (found) setState(found.state);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecommendations({
        budget_max_inr: budgetMaxInr,
        city: city,
        state: state,
        daily_travel_km: dailyTravelKm,
        vehicle_category: vehicleCategory,
        passengers: passengers,
        fuel_preference: fuelPreference,
        transmission_preference: transmissionPreference,
        driving_environment: drivingEnvironment,
        safety_priority: safetyPriority,
        mileage_importance: mileageImportance,
        annual_maintenance_budget_inr: maintenanceBudget,
        preferred_brands: preferredBrands
      });
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch AI recommendations. Please check if the backend service is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recommendation Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Personalized Vehicle Decision Advisor
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Combines strict deterministic multi-factor scoring with Gemini AI to recommend vehicles tailored to your daily running, local roads, and family budget.
          </p>
        </div>

        {!result ? (
          /* Wizard Form */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800 text-xs font-bold">
              {[
                { step: 1, label: "Budget & City" },
                { step: 2, label: "Commute & Vehicle" },
                { step: 3, label: "Fuel & Transmission" },
                { step: 4, label: "Safety & Brands" }
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-center gap-2 ${
                    currentStep === s.step
                      ? "text-emerald-400"
                      : currentStep > s.step
                      ? "text-slate-300"
                      : "text-slate-600"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep === s.step
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                        : currentStep > s.step
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/50"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {s.step}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Budget and City */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-400" />
                  Step 1: Your Target Budget and City
                </h3>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-sm font-semibold text-slate-300">
                      Maximum Ex-Showroom Budget (INR)
                    </label>
                    <span className="text-lg font-extrabold text-emerald-400">
                      ₹{(budgetMaxInr / 100000).toFixed(1)} Lakh (₹{budgetMaxInr.toLocaleString()})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="150000"
                    max="3500000"
                    step="50000"
                    value={budgetMaxInr}
                    onChange={(e) => setBudgetMaxInr(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>₹1.5 Lakh (Bikes/Scooters)</span>
                    <span>₹15 Lakh (Compact SUVs)</span>
                    <span>₹35 Lakh (Luxury/7-Str)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Your City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-emerald-500"
                    >
                      {indianCities.map((c) => (
                        <option key={c.city} value={c.city}>
                          {c.city} ({c.state})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      State (For Local RTO Road Tax)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={state}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Commute & Vehicle Category */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  Step 2: Commute & Body Style Requirements
                </h3>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-sm font-semibold text-slate-300">
                      Average Daily Travel Distance
                    </label>
                    <span className="text-base font-extrabold text-emerald-400">
                      {dailyTravelKm} km / day (~{dailyTravelKm * 30} km / month)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="5"
                    value={dailyTravelKm}
                    onChange={(e) => setDailyTravelKm(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>5 km (Short errands)</span>
                    <span>40 km (Standard commute)</span>
                    <span>100+ km (High running / EV sweet spot)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Vehicle Category
                    </label>
                    <select
                      value={vehicleCategory}
                      onChange={(e) => setVehicleCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Any">Any Category</option>
                      <option value="Compact SUV">Compact SUV (High Clearance, City Friendly)</option>
                      <option value="Midsize SUV">Midsize SUV (Spacious & Highway Comfort)</option>
                      <option value="7-Seater SUV">7-Seater SUV (Large Family & Luggage)</option>
                      <option value="Sedan">Sedan (Plush Ride, Executive Boot)</option>
                      <option value="Hatchback">Hatchback (Agile, High Mileage)</option>
                      <option value="Electric Car">Electric Car (Zero Emission & Low Running)</option>
                      <option value="Electric Scooter">Electric Scooter (Daily 2-Wheeler)</option>
                      <option value="Cruiser Bike">Cruiser / Classic Motorcycle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Regular Passengers Occupancy
                    </label>
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value={2}>2 Persons (Bike / Solo / Couple)</option>
                      <option value={4}>4 Persons (Small Family)</option>
                      <option value={5}>5 Persons (Standard Indian Family)</option>
                      <option value={7}>7 Persons (Joint Family / 3 Rows)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Fuel & Transmission */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-emerald-400" />
                  Step 3: Fuel Type & Driving Environment
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Fuel Preference
                    </label>
                    <select
                      value={fuelPreference}
                      onChange={(e) => setFuelPreference(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Any">Any Fuel (Algorithm will optimize)</option>
                      <option value="Petrol">Petrol (Refined, standard city usage)</option>
                      <option value="Diesel">Diesel (Torquey, long distance touring)</option>
                      <option value="Strong Hybrid">Strong Hybrid (Self-charging 23+ kmpl)</option>
                      <option value="Electric">Electric (Zero fuel bills, home charging)</option>
                      <option value="CNG">CNG (Economical factory-fitted)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Transmission Preference
                    </label>
                    <select
                      value={transmissionPreference}
                      onChange={(e) => setTransmissionPreference(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Any">Any Transmission</option>
                      <option value="Automatic">Automatic (DCA, CVT, Torque Converter - Traffic friendly)</option>
                      <option value="Manual">Manual (Driver engagement, lower initial cost)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Primary Driving Route
                    </label>
                    <select
                      value={drivingEnvironment}
                      onChange={(e) => setDrivingEnvironment(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="City Heavy">Heavy Bumper-to-Bumper City (Silk Board / WEH)</option>
                      <option value="City Moderate">Normal City & Ring Roads</option>
                      <option value="Highway">Frequent Highway & Expressways</option>
                      <option value="Mixed">50% City / 50% Highway Split</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Mileage Importance
                    </label>
                    <select
                      value={mileageImportance}
                      onChange={(e) => setMileageImportance(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="High">Extremely High (Fuel efficiency is #1 priority)</option>
                      <option value="Medium">Medium (Balanced with power & comfort)</option>
                      <option value="Not Crucial">Low (Prefer performance & road presence)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Safety & Preferred Brands */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Step 4: Safety Priorities & Preferred Brands
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Safety Priority
                    </label>
                    <select
                      value={safetyPriority}
                      onChange={(e) => setSafetyPriority(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="High">Top Priority (5-Star Bharat/Global NCAP & 6 Airbags)</option>
                      <option value="Medium">Medium (Solid active safety: ABS, ESC, ISOFIX)</option>
                      <option value="Standard">Standard Regulatory Compliance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Max Desired Annual Service Bill
                    </label>
                    <select
                      value={maintenanceBudget}
                      onChange={(e) => setMaintenanceBudget(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value={6000}>Under ₹6,000 / year (Maruti / EV level)</option>
                      <option value={10000}>Under ₹10,000 / year (Standard Compact SUV)</option>
                      <option value={15000}>Under ₹15,000 / year (Turbo / Diesel SUV)</option>
                      <option value={25000}>No hard constraint</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Preferred Brands (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {brandOptions.map((brand) => (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          preferredBrands.includes(brand)
                            ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
              ) : <div />}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  Continue
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>Processing Scoring Engine...</>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate AI Recommendations
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="space-y-8 animate-in fade-in">
            {/* AI Verdict Box */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>AI Automotive Consultant Verdict</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-4">
                Recommended For {city}, {state}
              </h2>
              <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line space-y-3 font-normal">
                {result.ai_personalized_advice}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
                <span>{result.user_summary}</span>
                <button
                  onClick={() => setResult(null)}
                  className="text-emerald-400 hover:underline font-bold mt-2 sm:mt-0"
                >
                  Modify Preferences & Re-run
                </button>
              </div>
            </div>

            {/* Top Recommended Cards */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Top Recommended Vehicles (Ranked by Suitability Score)
              </h3>

              {result.top_recommendations.map((rec, index) => {
                const v = rec.vehicle;
                return (
                  <div
                    key={v.id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all shadow-xl"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left: Image & Score */}
                      <div className="lg:w-1/3 flex flex-col justify-between">
                        <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-950">
                          {v.image_url && (
                            <img
                              src={v.image_url}
                              alt={v.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute top-3 left-3 bg-slate-950/90 text-white font-bold text-xs px-2.5 py-1 rounded-lg backdrop-blur-md">
                            Rank #{index + 1}
                          </div>
                          <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-lg shadow-lg">
                            Score: {rec.suitability_score}/100
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                            Ex-Showroom Price
                          </span>
                          <span className="text-xl font-extrabold text-white">
                            ₹{(v.price_ex_showroom_inr / 100000).toFixed(2)} Lakh
                          </span>
                        </div>
                      </div>

                      {/* Right: Details & Reasoning */}
                      <div className="lg:w-2/3 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                              {v.brand} • {v.category}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">
                              {v.transmission} • {v.fuel_type}
                            </span>
                          </div>
                          <h4 className="text-xl font-extrabold text-white mt-1">
                            {v.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {v.description}
                          </p>
                        </div>

                        {/* Reasons for recommendation */}
                        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            Why it fits your profile:
                          </div>
                          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                            {rec.reasons_for_recommendation.map((reason, idx) => (
                              <li key={idx}>{reason}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Pros & Cons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
                            <div className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
                              <ThumbsUp className="w-3.5 h-3.5" />
                              Key Advantages
                            </div>
                            <ul className="text-slate-300 space-y-1">
                              {rec.advantages.map((adv, i) => (
                                <li key={i}>• {adv}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl">
                            <div className="font-bold text-rose-400 flex items-center gap-1 mb-1">
                              <ThumbsDown className="w-3.5 h-3.5" />
                              Things to Consider
                            </div>
                            <ul className="text-slate-300 space-y-1">
                              {rec.disadvantages.map((dis, i) => (
                                <li key={i}>• {dis}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Financial and Safety Badges row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2 border-t border-slate-800">
                          <div className="p-2 bg-slate-950 rounded-xl">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Monthly Fuel</span>
                            <span className="text-xs font-black text-emerald-400">₹{rec.monthly_fuel_running_cost_inr.toLocaleString()}</span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded-xl">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">5-Yr Total Cost</span>
                            <span className="text-xs font-black text-white">₹{(rec.five_year_true_ownership_cost_inr / 100000).toFixed(1)}L</span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded-xl">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Safety</span>
                            <span className="text-xs font-black text-blue-400 line-clamp-1">{rec.safety_summary}</span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded-xl">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">Clearance</span>
                            <span className="text-xs font-black text-amber-400">{v.ground_clearance_mm ? `${v.ground_clearance_mm} mm` : "N/A"}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Link
                            href={`/vehicles/${v.id}`}
                            className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl text-center transition-colors shadow-md"
                          >
                            Explore Full Specs & On-Road Price →
                          </Link>
                          <Link
                            href={`/cost-calculator?id=${v.id}`}
                            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
                          >
                            Customize 5-Yr Cost
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
