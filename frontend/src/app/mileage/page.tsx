"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchMileageExplorer, submitMileageReport, fetchVehicles } from "@/lib/api";
import { Vehicle } from "@/lib/types";
import { 
  Fuel, 
  Plus, 
  CheckCircle2, 
  Users, 
  HelpCircle, 
  AlertCircle,
  Wind,
  Gauge,
  TrendingDown,
  ChevronRight
} from "lucide-react";

export default function MileagePage() {
  const [explorerData, setExplorerData] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFuel, setSelectedFuel] = useState("All");
  const [sortBy, setSortBy] = useState("efficiency");
  const [loading, setLoading] = useState(true);

  // Submit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form inputs
  const [formVehicleId, setFormVehicleId] = useState<number>(1);
  const [formName, setFormName] = useState("");
  const [formCity, setFormCity] = useState("Bengaluru");
  const [formKmpl, setFormKmpl] = useState<number>(14.5);
  const [formCondition, setFormCondition] = useState("Heavy Bumper-to-Bumper City");
  const [formAcUsage, setFormAcUsage] = useState<number>(100);
  const [formDrivingStyle, setFormDrivingStyle] = useState("Moderate");
  const [formFuelType, setFormFuelType] = useState("Petrol");
  const [formOdometer, setFormOdometer] = useState<number>(12000);
  const [formProofType, setFormProofType] = useState("Tank-to-Tank Method");

  useEffect(() => {
    loadMileageData();
    fetchVehicles().then((data) => {
      setVehicles(data);
      if (data.length > 0) setFormVehicleId(data[0].id);
    });
  }, [selectedCategory, selectedFuel, sortBy]);

  const loadMileageData = async () => {
    setLoading(true);
    try {
      const res = await fetchMileageExplorer(selectedCategory, selectedFuel, sortBy);
      setExplorerData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitMileageReport({
        vehicle_id: formVehicleId,
        user_name: formName || "Anonymous Owner",
        user_city: formCity,
        reported_kmpl: formKmpl,
        driving_condition: formCondition,
        ac_usage_pct: formAcUsage,
        driving_style: formDrivingStyle,
        fuel_type_used: formFuelType,
        odometer_km: formOdometer,
        proof_type: formProofType
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setModalOpen(false);
        loadMileageData();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Submission error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3 uppercase tracking-wider">
              <Fuel className="w-3.5 h-3.5" />
              <span>Real-World Efficiency Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Real-World Mileage vs Claimed ARAI Explorer
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Laboratory ARAI test cycles don&apos;t reflect 40°C Indian summer air conditioning, Silk Board crawling, or highway expressways. Compare real owner mileage across driving conditions.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Submit Your Mileage Log
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Category
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white"
              >
                <option value="All">All Categories</option>
                <option value="Compact SUV">Compact SUV</option>
                <option value="Midsize SUV">Midsize SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Electric Car">Electric Car</option>
                <option value="Cruiser Bike">Cruiser Bike</option>
              </select>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Fuel Type
              </span>
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white"
              >
                <option value="All">All Fuel Types</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Strong Hybrid">Strong Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400"
            >
              <option value="efficiency">Highest Real Efficiency</option>
              <option value="difference">Largest Gap from Claimed</option>
              <option value="sample_size">Largest Sample Size</option>
            </select>
          </div>
        </div>

        {/* Mileage Comparison Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading real-world mileage data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {explorerData.map((item) => {
              const unit = item.fuel_type === "Electric" ? "km range" : "kmpl";
              return (
                <div
                  key={item.vehicle_id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-emerald-400">{item.brand}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                        {item.fuel_type}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-white line-clamp-1">{item.name}</h3>

                    {/* Big Numbers Comparison Box */}
                    <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800/80 grid grid-cols-2 gap-4 text-center">
                      <div className="border-r border-slate-800">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Claimed ARAI</span>
                        <span className="text-xl font-bold text-slate-400">{item.claimed_mileage}</span>
                        <span className="text-[10px] text-slate-500 block">{unit}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 uppercase font-black block">Real Mixed</span>
                        <span className="text-xl font-black text-emerald-400">{item.real_world_mixed_mileage}</span>
                        <span className="text-[10px] text-emerald-400 block">{unit}</span>
                      </div>
                    </div>

                    {/* City vs Highway Driving breakdown */}
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-amber-400" />
                          Heavy City Traffic:
                        </span>
                        <strong className="text-white">{item.real_world_city_mileage} {unit}</strong>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Wind className="w-3.5 h-3.5 text-teal-400" />
                          Highway Cruising:
                        </span>
                        <strong className="text-white">{item.real_world_highway_mileage} {unit}</strong>
                      </div>
                    </div>

                    {/* Gap & Sample Size badge */}
                    <div className="mt-4 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        Sample: {item.sample_size} owners ({item.reliability_level})
                      </span>
                      <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        {item.difference_pct}% from claim
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-800 flex gap-2">
                    <Link
                      href={`/vehicles/${item.vehicle_id}`}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl text-center transition-colors flex items-center justify-center gap-1"
                    >
                      View Vehicle
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submission Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Fuel className="w-4 h-4" />
                <span>Crowdsourced Mileage Submission</span>
              </div>
              <h2 className="text-xl font-black text-white mb-4">
                Submit Your Real-World Mileage
              </h2>

              {submitSuccess ? (
                <div className="p-6 text-center text-emerald-400 space-y-2">
                  <CheckCircle2 className="w-12 h-12 mx-auto" />
                  <h4 className="font-bold text-lg text-white">Report Submitted!</h4>
                  <p className="text-xs text-slate-400">
                    Your contribution helps fellow Indian car buyers make transparent decisions.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Your Vehicle</label>
                    <select
                      value={formVehicleId}
                      onChange={(e) => setFormVehicleId(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Your Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Arun K."
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Your City</label>
                      <input
                        type="text"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Actual Mileage (kmpl or range km)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formKmpl}
                        onChange={(e) => setFormKmpl(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-emerald-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">AC Usage Percentage</label>
                      <select
                        value={formAcUsage}
                        onChange={(e) => setFormAcUsage(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      >
                        <option value={100}>100% AC Always On</option>
                        <option value={80}>80% AC</option>
                        <option value={50}>50% AC</option>
                        <option value={0}>AC Off</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Driving Condition</label>
                    <select
                      value={formCondition}
                      onChange={(e) => setFormCondition(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="Heavy Bumper-to-Bumper City">Heavy Bumper-to-Bumper City</option>
                      <option value="Normal City Traffic">Normal City Traffic</option>
                      <option value="Highway Cruising (80-100 km/h)">Highway Cruising (80-100 km/h)</option>
                      <option value="Mixed 50-50">Mixed 50-50</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Measurement Method</label>
                      <select
                        value={formProofType}
                        onChange={(e) => setFormProofType(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      >
                        <option value="Tank-to-Tank Method">Tank-to-Tank Auto Cutoff (Most Accurate)</option>
                        <option value="MID Dash Photo">Dashboard MID Display</option>
                        <option value="OBD Telematics">OBD Telematics Device</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Odometer (km)</label>
                      <input
                        type="number"
                        value={formOdometer}
                        onChange={(e) => setFormOdometer(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="flex-1 py-2.5 bg-slate-800 text-white font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
