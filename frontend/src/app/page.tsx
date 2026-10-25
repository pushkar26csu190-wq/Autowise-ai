"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Vehicle } from "@/lib/types";
import { fetchVehicles } from "@/lib/api";
import VehicleCard from "@/components/VehicleCard";
import { 
  Sparkles, 
  Search, 
  GitCompare, 
  Calculator, 
  ShieldCheck, 
  Fuel, 
  Zap, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFuel, setSelectedFuel] = useState("All");
  const [maxPrice, setMaxPrice] = useState<number>(3000000);
  const [comparedIds, setComparedIds] = useState<number[]>([]);

  useEffect(() => {
    loadVehicles();
  }, [selectedCategory, selectedFuel, maxPrice]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await fetchVehicles({
        category: selectedCategory,
        fuel_type: selectedFuel,
        max_price: maxPrice,
        search: search
      });
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadVehicles();
  };

  const handleCompareToggle = (id: number) => {
    setComparedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 4) {
        alert("You can compare up to 4 vehicles simultaneously.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const categories = ["All", "Compact SUV", "Midsize SUV", "Sedan", "Hatchback", "Electric Car", "Electric Scooter", "Cruiser Bike"];
  const fuelTypes = ["All", "Petrol", "Diesel", "Strong Hybrid", "Electric"];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-6 tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>India&apos;s 1st AI-Powered Automotive Decision Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Choose Your Vehicle by <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Real-World Reality
            </span>, Not Just Spec Sheets.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Personalized Indian car and bike recommendations factoring in local city waterlogging, real bumper-to-bumper mileage, 5-year true ownership cost, and Bharat NCAP crash ratings.
          </p>

          {/* Quick CTA row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/recommendations"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Start 60-Sec AI Vehicle Advisor
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/cost-calculator"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              Calculate 5-Year True Cost
            </Link>
          </div>

          {/* Floating Search & Filter Bar */}
          <div className="mt-12 max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-2xl">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Tata Nexon, Creta, Grand Vitara, EV Scooter..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedFuel}
                  onChange={(e) => setSelectedFuel(e.target.value)}
                  className="px-3 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  {fuelTypes.map((f) => (
                    <option key={f} value={f}>
                      Fuel: {f}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search
                </button>
              </div>
            </form>

            {/* Quick Category Pills */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mr-1">Types:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Active Compare Dock */}
      {comparedIds.length > 0 && (
        <aside aria-label="Comparison dock" className="fixed bottom-6 right-6 z-40 bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs">
              {comparedIds.length}
            </div>
            <div className="text-xs">
              <div className="font-bold text-white">Vehicles in Comparison</div>
              <div className="text-slate-400 text-[11px]">Compare side by side</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/compare?ids=${comparedIds.join(",")}`}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1 shadow-md"
            >
              Compare Now
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setComparedIds([])}
              className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1"
            >
              Clear
            </button>
          </div>
        </aside>
      )}

      {/* Core Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Six Intelligent Tools For Indian Vehicle Buyers
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Traditional car portals show catalog brochures. AutoWise AI tells you how much it will actually cost to run in your city.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tool 1 */}
          <Link href="/recommendations" className="p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
              AI Personalized Advisor
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Answer 12 lifestyle questions (budget, daily km, family size, road type) to receive deterministic weighted top 3 vehicle matches with AI reasoning.
            </p>
          </Link>

          {/* Tool 2 */}
          <Link href="/cost-calculator" className="p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-2xl transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors flex items-center justify-between">
              5-Year True Ownership Cost
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              On-road price + state RTO tax + loan EMI interest + 5-year fuel expenses - projected resale value. Never get surprised by maintenance.
            </p>
          </Link>

          {/* Tool 3 */}
          <Link href="/safety" className="p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors flex items-center justify-between">
              Bharat NCAP Safety Hub
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Transparent crash test scores strictly demarcating 2024 Bharat NCAP from older pre-2022 Global NCAP. Real adult and child occupant protection.
            </p>
          </Link>

          {/* Tool 4 */}
          <Link href="/mileage" className="p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Fuel className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
              Real-World Mileage Explorer
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              See what owners actually get in bumper-to-bumper city traffic with 100% AC on, compared against laboratory claimed ARAI figures.
            </p>
          </Link>

          {/* Tool 5 */}
          <Link href="/ev-calculator" className="p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center justify-between">
              EV Range & Charging Suite
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Calculate charging duration from 3.3 kW home sockets up to 60 kW highway chargers. Explore live OpenStreetMap charging station locations.
            </p>
          </Link>

          {/* Tool 6 */}
          <Link href="/location-advisor" className="p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-2xl transition-all group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors flex items-center justify-between">
              City-Specific Terrain Advisor
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Monsoon waterlogging clearance recommendations for Mumbai, 10-year diesel NGT rules for Delhi NCR, and 18% RTO road tax math for Bengaluru.
            </p>
          </Link>
        </div>
      </section>

      {/* Vehicle Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">Trending Vehicles in India</h2>
            <p className="text-slate-400 text-xs mt-1">
              Showing {vehicles.length} curated vehicles with verified real-world Indian efficiency data.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-semibold">Max Ex-Showroom:</span>
            <input
              type="range"
              min="200000"
              max="3000000"
              step="100000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-36 accent-emerald-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-emerald-400 w-16">
              ₹{(maxPrice / 100000).toFixed(0)} Lakh
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 bg-slate-900 rounded-2xl border border-slate-800" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">No vehicles match your active search filters.</p>
            <button
              onClick={() => { setSelectedCategory("All"); setSelectedFuel("All"); setMaxPrice(3000000); setSearch(""); }}
              className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onCompareToggle={handleCompareToggle}
                isCompared={comparedIds.includes(v.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Popular Comparison Presets Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold mb-3">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Popular Head-to-Head Comparisons</span>
          </div>
          <h2 className="text-2xl font-black text-white">Compare India&apos;s Segment Rivals</h2>
          <p className="text-slate-400 text-xs mt-1">See side-by-side fuel costs, real mileage, and crash ratings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Compact SUV Battle</span>
              <h3 className="font-bold text-white text-base mt-1">Tata Nexon vs Maruti Brezza</h3>
              <p className="text-xs text-slate-400 mt-1">5-Star Bharat NCAP safety & turbo punch vs Maruti&apos;s bulletproof reliability and higher resale.</p>
            </div>
            <Link
              href="/compare?ids=1,3"
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl text-center transition-colors"
            >
              Compare Nexon vs Brezza →
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Midsize SUV Showdown</span>
              <h3 className="font-bold text-white text-base mt-1">Hyundai Creta vs Grand Vitara Hybrid</h3>
              <p className="text-xs text-slate-400 mt-1">Creta&apos;s 160 bhp turbo performance & Level 2 ADAS vs Grand Vitara&apos;s 23+ kmpl self-charging hybrid economy.</p>
            </div>
            <Link
              href="/compare?ids=4,6"
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl text-center transition-colors"
            >
              Compare Creta vs Hybrid →
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Executive Sedans</span>
              <h3 className="font-bold text-white text-base mt-1">Honda City Hybrid vs Hyundai Verna</h3>
              <p className="text-xs text-slate-400 mt-1">City e:HEV&apos;s relaxed 22 kmpl ride comfort vs Verna Turbo&apos;s 5-Star 2023 crash test rating & fastback styling.</p>
            </div>
            <Link
              href="/compare?ids=7,8"
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl text-center transition-colors"
            >
              Compare City vs Verna →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
