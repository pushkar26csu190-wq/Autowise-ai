"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchCities, getLocationAdvice } from "@/lib/api";
import { CityProfile, LocationAdvisorResponse, Vehicle } from "@/lib/types";
import VehicleCard from "@/components/VehicleCard";
import { 
  MapPin, 
  Fuel, 
  ShieldAlert, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Navigation,
  Compass,
  ArrowRight
} from "lucide-react";

export default function LocationAdvisorPage() {
  const [cities, setCities] = useState<CityProfile[]>([]);
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [dailyCommute, setDailyCommute] = useState<number>(30);
  const [budget, setBudget] = useState<number>(1500000);
  const [advice, setAdvice] = useState<LocationAdvisorResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCities().then((data) => {
      setCities(data);
    });
  }, []);

  useEffect(() => {
    if (selectedCity) {
      loadAdvice();
    }
  }, [selectedCity, dailyCommute, budget]);

  const loadAdvice = async () => {
    setLoading(true);
    try {
      const res = await getLocationAdvice(selectedCity, dailyCommute, budget);
      setAdvice(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentCityProfile = cities.find((c) => c.city_name === selectedCity);

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-bold mb-3 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Regional Automotive Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            City-Specific Vehicle & Terrain Advisor
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            A vehicle that is great for the wide open highways of Hyderabad can be a liability in Mumbai monsoons or face a 10-year ban in Delhi NCR. Get intelligence tailored to your city.
          </p>
        </div>

        {/* City Switcher Bar */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
              Select Your City:
            </span>
            {cities.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCity(c.city_name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCity === c.city_name
                    ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {c.city_name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px]">Daily Commute:</span>
              <span className="text-rose-400 font-black">{dailyCommute} km</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={dailyCommute}
              onChange={(e) => setDailyCommute(Number(e.target.value))}
              className="accent-rose-500 w-28 cursor-pointer"
            />
          </div>
        </div>

        {/* City Stats & Reality Cards */}
        {advice && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Local Fuel Prices */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-rose-400" />
                Live Fuel Prices ({advice.city_profile.city_name})
              </span>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Petrol:</span>
                  <strong className="text-white">₹{advice.city_profile.petrol_price}/L</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Diesel:</span>
                  <strong className="text-white">₹{advice.city_profile.diesel_price}/L</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CNG:</span>
                  <strong className="text-white">₹{advice.city_profile.cng_price}/kg</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-bold">EV Tariff:</span>
                  <strong className="text-emerald-400">₹{advice.city_profile.electricity_unit_rate}/unit</strong>
                </div>
              </div>
            </div>

            {/* Traffic & Crawl Speed */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                Traffic & Crawl Speed
              </span>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Congestion Level:</span>
                  <span className="font-bold text-amber-400">{advice.city_profile.traffic_congestion_index}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg City Speed:</span>
                  <strong className="text-white">{advice.city_profile.average_city_speed_kmh} km/h</strong>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg text-[10px] text-slate-400 mt-2">
                  At this speed, automatics (DCA/CVT) reduce driver fatigue by 70%.
                </div>
              </div>
            </div>

            {/* Monsoon Waterlogging & Clearance */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                Monsoon Inundation Risk
              </span>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Flood Risk:</span>
                  <span className="font-bold text-blue-400">{advice.city_profile.monsoon_waterlog_risk}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Min Ground Clearance:</span>
                  <strong className="text-emerald-400">{advice.city_profile.recommended_min_ground_clearance} mm</strong>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg text-[10px] text-slate-400 mt-2">
                  Avoid scraping over unpaved drains and high Indian speedbreakers.
                </div>
              </div>
            </div>

            {/* State RTO Tax Slabs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                State RTO Tax ({advice.city_profile.state_name})
              </span>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Petrol RTO Tax:</span>
                  <strong className="text-white">{advice.city_profile.rto_road_tax_petrol_pct}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Diesel RTO Tax:</span>
                  <strong className="text-white">{advice.city_profile.rto_road_tax_diesel_pct}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-bold">EV Road Tax:</span>
                  <strong className="text-emerald-400 font-bold">{advice.city_profile.rto_road_tax_ev_pct}% (0% Subsidy)</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regulatory Alert Banner if exists (e.g. Delhi NCR NGT 10yr diesel ban) */}
        {advice?.regulatory_alert && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-3xl p-6 sm:p-8 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-black text-white text-base">City Regulatory Notice</h3>
              <p className="text-rose-200 text-xs mt-1 leading-relaxed">
                {advice.regulatory_alert}
              </p>
            </div>
          </div>
        )}

        {/* Fuel Economics & EV Feasibility */}
        {advice && (
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Monthly Fuel Economics in {advice.city_profile.city_name}
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              {advice.ev_feasibility_verdict}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Monthly Petrol</span>
                <span className="text-lg font-bold text-white mt-1 block">
                  ₹{Math.round(advice.local_fuel_economics.monthly_petrol_inr).toLocaleString()}
                </span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Monthly Diesel</span>
                <span className="text-lg font-bold text-white mt-1 block">
                  ₹{Math.round(advice.local_fuel_economics.monthly_diesel_inr).toLocaleString()}
                </span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Monthly EV Charging</span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block">
                  ₹{Math.round(advice.local_fuel_economics.monthly_ev_electricity_inr).toLocaleString()}
                </span>
              </div>
              <div className="p-4 bg-emerald-950/50 rounded-2xl border border-emerald-500/40">
                <span className="text-[10px] text-emerald-300 uppercase font-black block">Annual EV Savings</span>
                <span className="text-lg font-black text-emerald-300 mt-1 block">
                  ₹{advice.local_fuel_economics.annual_ev_savings_vs_petrol_inr.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top Recommended Vehicles For This City */}
        {advice && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Tailored Vehicle Picks for {advice.city_profile.city_name}&apos;s Driving Conditions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {advice.top_city_vehicle_picks.map((v: Vehicle) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
