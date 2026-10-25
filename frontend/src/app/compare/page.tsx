"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchVehicles, compareVehicles, saveComparison } from "@/lib/api";
import { Vehicle, ComparisonResponse } from "@/lib/types";
import { 
  GitCompare, 
  Plus, 
  Trash2, 
  Sparkles, 
  Trophy, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Bookmark,
  Share2
} from "lucide-react";

function CompareContent() {
  const searchParams = useSearchParams();
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [cityName, setCityName] = useState("Bengaluru");
  const [monthlyKm, setMonthlyKm] = useState(1200);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Load catalog for the "add vehicle" dropdown
    fetchVehicles().then((data) => {
      setAllVehicles(data);
      // Check query params
      const idsParam = searchParams.get("ids");
      if (idsParam) {
        const parsed = idsParam.split(",").map(Number).filter(Boolean);
        setSelectedIds(parsed.slice(0, 4));
      } else if (data.length >= 2) {
        // Default comparison: Nexon vs Brezza
        setSelectedIds([data[0].id, data[2].id]);
      }
    });
  }, [searchParams]);

  useEffect(() => {
    if (selectedIds.length > 0) {
      runComparison();
    } else {
      setComparisonData(null);
    }
  }, [selectedIds, cityName, monthlyKm]);

  const runComparison = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      const res = await compareVehicles(selectedIds, cityName, monthlyKm);
      setComparisonData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = (id: number) => {
    if (selectedIds.length >= 4) {
      alert("You can compare up to 4 vehicles at a time.");
      return;
    }
    if (!selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeVehicle = (id: number) => {
    setSelectedIds(selectedIds.filter((x) => x !== id));
  };

  const handleSave = async () => {
    if (!comparisonData) return;
    try {
      await saveComparison({
        user_id: "demo_user_1",
        title: comparisonData.vehicles.map((v) => v.name).join(" vs "),
        vehicle_ids: selectedIds.join(","),
        notes: `Compared for ${cityName} driving (${monthlyKm} km/mo)`
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const availableToAdd = allVehicles.filter((v) => !selectedIds.includes(v.id));

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3 uppercase tracking-wider">
              <GitCompare className="w-3.5 h-3.5" />
              <span>Smart Comparison Engine</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Side-by-Side Vehicle Comparison
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Compare up to 4 cars, bikes or EVs. Best-in-class metrics are highlighted in green.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              {savedSuccess ? "Saved to Profile!" : "Save Comparison"}
            </button>
          </div>
        </div>

        {/* Selected Vehicles Header Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {selectedIds.map((id) => {
            const v = allVehicles.find((x) => x.id === id);
            if (!v) return null;
            return (
              <div
                key={v.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative group"
              >
                <button
                  onClick={() => removeVehicle(v.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Remove vehicle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div>
                  <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-950 mb-3">
                    {v.image_url && (
                      <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {v.brand} • {v.category}
                  </span>
                  <h3 className="font-bold text-sm text-white line-clamp-1 mt-0.5">
                    {v.name}
                  </h3>
                  <div className="text-sm font-extrabold text-white mt-2">
                    ₹{(v.price_ex_showroom_inr / 100000).toFixed(2)} Lakh
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{v.fuel_type}</span>
                  <Link
                    href={`/vehicles/${v.id}`}
                    className="text-emerald-400 hover:underline font-semibold text-[11px]"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Add Vehicle Slot */}
          {selectedIds.length < 4 && (
            <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <Plus className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Add Another Vehicle</h4>
              <p className="text-[11px] text-slate-500 mb-3">Compare up to 4 models</p>

              <select
                onChange={(e) => {
                  if (e.target.value) addVehicle(Number(e.target.value));
                  e.target.value = "";
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select a vehicle to add...</option>
                {availableToAdd.map((av) => (
                  <option key={av.id} value={av.id}>
                    {av.name} (₹{(av.price_ex_showroom_inr / 100000).toFixed(1)}L)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* AI Comparative Verdict Box */}
        {comparisonData && (
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 mb-10 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Comparative Analysis & Buying Verdict</span>
            </div>
            <h3 className="text-xl font-black text-white mb-3">
              Who Should Buy Which Model?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {comparisonData.ai_comparison_verdict}
            </p>

            {/* Use case quick winners */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block">
                  Best For Daily City Commuting
                </span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {allVehicles.find((v) => v.id === comparisonData.recommended_vehicle_for_city)?.name || "N/A"}
                </span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-blue-400 uppercase font-black tracking-wider block">
                  Best For Highway Safety & Power
                </span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {allVehicles.find((v) => v.id === comparisonData.recommended_vehicle_for_highway)?.name || "N/A"}
                </span>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-teal-400 uppercase font-black tracking-wider block">
                  Overall Value for Money
                </span>
                <span className="text-xs font-bold text-white mt-1 block">
                  {allVehicles.find((v) => v.id === comparisonData.recommended_vehicle_for_value)?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Attribute Comparison Tables */}
        {comparisonData && (
          <div className="space-y-8">
            {Object.entries(comparisonData.category_attributes).map(([catTitle, attributes]) => (
              <div
                key={catTitle}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl"
              >
                <div className="bg-slate-800/60 px-6 py-4 border-b border-slate-800">
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    {catTitle}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800/80 bg-slate-950/40">
                        <th className="py-3.5 px-6 font-bold text-slate-400 w-1/4">Specification</th>
                        {comparisonData.vehicles.map((v) => (
                          <th key={v.id} className="py-3.5 px-6 font-bold text-white">
                            {v.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {attributes.map((attr) => (
                        <tr key={attr.key} className="hover:bg-slate-800/20 transition-colors">
                          <td className="py-3 px-6 font-semibold text-slate-300">
                            {attr.name}
                          </td>
                          {comparisonData.vehicles.map((v) => {
                            const val = attr.values[v.id];
                            const isBest = attr.best_vehicle_id === v.id;
                            return (
                              <td key={v.id} className="py-3 px-6">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-medium ${isBest ? "text-emerald-400 font-bold" : "text-slate-200"}`}>
                                    {String(val ?? "N/A")}
                                  </span>
                                  {isBest && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                      Best
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading comparison engine...</div>}>
      <CompareContent />
    </Suspense>
  );
}
