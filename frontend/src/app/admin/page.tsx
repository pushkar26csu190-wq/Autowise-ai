"use client";

import React, { useState, useEffect } from "react";
import { fetchAdminStats, resetDatabaseSeed } from "@/lib/api";
import { 
  LayoutDashboard, 
  Car, 
  MessageSquareCheck, 
  Fuel, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Database,
  BarChart3
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to verify and re-seed the Indian automotive database?")) return;
    setResetting(true);
    try {
      const res = await resetDatabaseSeed();
      setResetMessage(res.message);
      loadStats();
      setTimeout(() => setResetMessage(""), 4000);
    } catch (err) {
      console.error(err);
      alert("Failed to reset database seed.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3 uppercase tracking-wider">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Platform Administration & Analytics</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              AutoWise AI Admin Governance Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Vehicle catalog synchronization, moderation workflows for owner reviews, and crowd mileage verification.
            </p>
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-emerald-400 ${resetting ? "animate-spin" : ""}`} />
            {resetting ? "Verifying..." : "Verify & Seed Catalog"}
          </button>
        </div>

        {resetMessage && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Catalog Models</span>
                <Car className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-white mt-2 block">{stats.total_vehicles}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Across Cars, Bikes, Scooters, EVs</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">5-Star Crash Safety</span>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-2xl font-black text-blue-400 mt-2 block">{stats.five_star_safety_count}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">B-NCAP / G-NCAP 5 Stars</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Owner Reviews</span>
                <MessageSquareCheck className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-2xl font-black text-white mt-2 block">{stats.total_reviews}</span>
              <span className="text-[11px] text-emerald-400 font-bold mt-1 block">
                {stats.verified_reviews} RC Verified Owners
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Crowd Mileage Reports</span>
                <Fuel className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-2xl font-black text-amber-400 mt-2 block">{stats.total_mileage_reports}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Tank-to-Tank / MID logs</span>
            </div>
          </div>
        )}

        {/* Moderation Queues Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Moderation Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <h3 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Moderation Pipeline Status
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Review and verify user-submitted mileage logs and RC documentation.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Pending Owner Reviews</div>
                  <div className="text-[11px] text-slate-500">Awaiting RC / invoice verification checks</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {stats?.pending_moderation.reviews || 0} Pending
                </span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Pending Mileage Reports</div>
                  <div className="text-[11px] text-slate-500">Checking for outlier fuel logs</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {stats?.pending_moderation.mileage_reports || 0} Pending
                </span>
              </div>
            </div>
          </div>

          {/* Engine Architecture & AI Provider */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <h3 className="text-base font-black text-white mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Architecture & AI Engine Status
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Full-stack system health and runtime environment.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Backend Server:</span>
                <span className="text-emerald-400 font-bold">Python FastAPI (Uvicorn 127.0.0.1:8000)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Database Engine:</span>
                <span className="text-white font-bold">SQLAlchemy + SQLite / PostgreSQL Compatible</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">AI / LLM Integration:</span>
                <span className="text-cyan-400 font-bold">Google Gemini API / Automotive NLP Engine</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Map Geospatial Engine:</span>
                <span className="text-emerald-400 font-bold">OpenStreetMap + Leaflet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
