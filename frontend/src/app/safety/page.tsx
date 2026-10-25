"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchSafetyDashboard } from "@/lib/api";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Info, 
  Check, 
  X, 
  AlertTriangle, 
  Award,
  ChevronRight,
  Shield
} from "lucide-react";

export default function SafetyPage() {
  const [data, setData] = useState<any>(null);
  const [agency, setAgency] = useState("all");
  const [hasAdasOnly, setHasAdasOnly] = useState(false);
  const [minAirbags, setMinAirbags] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSafety();
  }, [agency, hasAdasOnly, minAirbags]);

  const loadSafety = async () => {
    setLoading(true);
    try {
      const res = await fetchSafetyDashboard(agency, hasAdasOnly, minAirbags);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Crash Test Transparency Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Indian Safety & Crash-Test Intelligence Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Evaluating Bharat NCAP & Global NCAP crash testing. We strictly distinguish modern protocols with mandatory ESC and side pole impact tests from older pre-2022 frontal-only scores.
          </p>
        </div>

        {/* Regulatory Advisory Alert */}
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold text-amber-300 block mb-1">
              Important NCAP Protocol Integrity Warning:
            </strong>
            Prior to July 2022, Global NCAP evaluated cars primarily on a 64 km/h frontal offset crash. Cars could achieve 4 or 5 stars without standard Electronic Stability Control (ESC) or side pole crash tests. In contrast, <strong>Bharat NCAP (2023 onwards)</strong> and updated Global NCAP strictly mandate side barrier impact, side pole impact, ESC fitment, and pedestrian protection for 5-star certification. Never treat pre-2022 tests as equivalent.
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">Agency:</span>
            {[
              { id: "all", label: "All Vehicles" },
              { id: "bncap", label: "Bharat NCAP Tested" },
              { id: "gncap", label: "Global NCAP Tested" },
              { id: "untested", label: "Untested Only" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAgency(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  agency === tab.id
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={hasAdasOnly}
                onChange={(e) => setHasAdasOnly(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              Has Level 1/2 ADAS
            </label>

            <select
              value={minAirbags}
              onChange={(e) => setMinAirbags(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white"
            >
              <option value={0}>Any Airbags</option>
              <option value={6}>Min 6 Airbags Standard</option>
              <option value={7}>7 Airbags (Knee Airbag)</option>
            </select>
          </div>
        </div>

        {/* Safety Cards Grid */}
        {loading || !data ? (
          <div className="text-center py-12 text-slate-400">Loading safety test data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.vehicles.map((item: any) => {
              const bStars = item.b_ncap.stars;
              const gStars = item.g_ncap.stars;

              return (
                <div
                  key={item.vehicle_id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-emerald-400 uppercase tracking-wider">{item.brand}</span>
                      <span className="text-slate-400">{item.category}</span>
                    </div>
                    <h3 className="font-extrabold text-base text-white line-clamp-1">{item.name}</h3>

                    {/* NCAP Stars Display */}
                    <div className="mt-4 p-4 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-3">
                      {/* Bharat NCAP */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-300 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-emerald-400" />
                            Bharat NCAP:
                          </span>
                          <span className={`font-black ${bStars ? "text-emerald-400" : "text-slate-500"}`}>
                            {item.b_ncap.label}
                          </span>
                        </div>
                        {item.b_ncap.tested && (
                          <div className="text-[11px] text-slate-400 space-x-2">
                            <span>Adult: <strong>{item.b_ncap.adult_score}</strong></span>
                            <span>•</span>
                            <span>Child: <strong>{item.b_ncap.child_score}</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Global NCAP */}
                      <div className="pt-2 border-t border-slate-800/60">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-300 flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5 text-blue-400" />
                            Global NCAP:
                          </span>
                          <span className={`font-black ${gStars ? "text-blue-400" : "text-slate-500"}`}>
                            {item.g_ncap.label}
                          </span>
                        </div>
                        {item.g_ncap.tested && (
                          <div className="text-[10px] text-slate-400">
                            Protocol: {item.g_ncap.protocol} ({item.g_ncap.test_year || "Earlier Gen"})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Protocol Warning Badge if applicable */}
                    {item.protocol_warning && (
                      <div className="mt-3 p-2.5 bg-amber-950/30 rounded-xl border border-amber-500/20 text-[10px] text-amber-300 leading-normal">
                        <Info className="w-3 h-3 inline mr-1 text-amber-400" />
                        {item.protocol_warning}
                      </div>
                    )}

                    {/* Active Safety Spec Checklist */}
                    <div className="mt-4 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Standard Airbags:</span>
                        <strong className="text-white">{item.active_safety.airbags_label}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Electronic Stability Control (ESC):</span>
                        <span className={item.active_safety.has_esc ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {item.active_safety.has_esc ? "Standard" : "Missing / Optional"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>ISOFIX Child Seat Mounts:</span>
                        <span className={item.active_safety.has_isofix ? "text-emerald-400 font-bold" : "text-slate-500"}>
                          {item.active_safety.has_isofix ? "Included" : "None"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>ADAS Level:</span>
                        <span className={item.active_safety.adas_level > 0 ? "text-blue-400 font-bold" : "text-slate-500"}>
                          {item.active_safety.adas_level > 0 ? `Level ${item.active_safety.adas_level}` : "None"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-800">
                    <Link
                      href={`/vehicles/${item.vehicle_id}`}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                    >
                      View Structural Analysis
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
