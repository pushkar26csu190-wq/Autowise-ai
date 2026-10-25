"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchVehicleDetail, fetchReviews } from "@/lib/api";
import { Vehicle, Review } from "@/lib/types";
import { 
  ShieldCheck, 
  Fuel, 
  Calculator, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Star, 
  GitCompare, 
  Share2, 
  Gauge, 
  Users, 
  Wrench,
  ThumbsUp,
  ThumbsDown,
  Info
} from "lucide-react";
import { Suspense } from "react";

function VehicleDetailContent() {
  const params = useParams();
  const id = Number(params.id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [loading, setLoading] = useState(true);

  const cityOptions = [
    "Bengaluru",
    "Delhi NCR",
    "Mumbai",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Ahmedabad"
  ];

  useEffect(() => {
    if (!id) return;
    loadDetail();
  }, [id, selectedCity]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await fetchVehicleDetail(id, selectedCity);
      setVehicle(data.vehicle);
      setPricing(data.pricing_breakdown);

      const revData = await fetchReviews(id);
      setReviews(revData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !vehicle) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading vehicle details...
      </div>
    );
  }

  const safetyStars = vehicle.b_ncap_rating || vehicle.g_ncap_rating;

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row gap-8 shadow-2xl">
          {/* Image */}
          <div className="lg:w-1/2 relative rounded-2xl overflow-hidden bg-slate-950 h-80 sm:h-96">
            {vehicle.image_url ? (
              <img
                src={vehicle.image_url}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-white backdrop-blur-md border border-slate-700">
                {vehicle.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950">
                {vehicle.fuel_type}
              </span>
            </div>
          </div>

          {/* Key Info */}
          <div className="lg:w-1/2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-bold text-emerald-400 text-sm uppercase">{vehicle.brand}</span>
                <span>{vehicle.transmission}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {vehicle.name}
              </h1>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {vehicle.description}
              </p>

              {/* Safety Highlight */}
              <div className="mt-6 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{safetyStars ? `${safetyStars} Star Crash Safety Rating` : "Crash Rating: Not Tested"}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {vehicle.b_ncap_tested
                        ? `Official Bharat NCAP Tested (${vehicle.b_ncap_adult_score} Adult)`
                        : vehicle.g_ncap_tested
                        ? `Global NCAP (${vehicle.g_ncap_protocol})`
                        : "Tested under AIS standard"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-300 block">{vehicle.airbags_count} Airbags</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">{vehicle.has_esc ? "ESC Standard" : "ESC Optional"}</span>
                </div>
              </div>

              {/* Specs Quick Strip */}
              <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Power</span>
                  <span className="text-xs font-bold text-white">{vehicle.max_power_bhp} bhp</span>
                </div>
                <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Torque</span>
                  <span className="text-xs font-bold text-white">{vehicle.max_torque_nm} Nm</span>
                </div>
                <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Clearance</span>
                  <span className="text-xs font-bold text-white">{vehicle.ground_clearance_mm ? `${vehicle.ground_clearance_mm} mm` : "N/A"}</span>
                </div>
                <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Seats</span>
                  <span className="text-xs font-bold text-white">{vehicle.seating_capacity}</span>
                </div>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Ex-Showroom Price</span>
                <span className="text-2xl font-black text-white">
                  ₹{(vehicle.price_ex_showroom_inr / 100000).toFixed(2)} <span className="text-sm font-normal text-slate-400">Lakh</span>
                </span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/compare?ids=${vehicle.id}`}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  Compare
                </Link>
                <Link
                  href={`/cost-calculator?id=${vehicle.id}`}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  5-Yr Cost Breakdown
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* State On-Road Price Breakdown Section */}
        {pricing && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-baseline justify-between mb-6 gap-3">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Estimated On-Road Price in {pricing.city} ({pricing.state})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Factors in actual state RTO road tax slabs, 1-yr Own Damage + 3-yr Third Party insurance, TCS, and FASTag.
                </p>
              </div>

              {/* City Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Select City:</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                >
                  {cityOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center mb-6">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Ex-Showroom</span>
                <span className="text-sm font-extrabold text-white">₹{pricing.ex_showroom.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">RTO Road Tax ({pricing.rto_pct}%)</span>
                <span className="text-sm font-extrabold text-emerald-400">+₹{pricing.rto_road_tax.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Insurance (1+3 Yr)</span>
                <span className="text-sm font-extrabold text-white">+₹{pricing.insurance.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">FASTag / Reg</span>
                <span className="text-sm font-extrabold text-white">+₹{pricing.registration_and_fastag.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-emerald-950/60 rounded-2xl border border-emerald-500/40 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Total On-Road</span>
                <span className="text-base font-black text-white">₹{pricing.estimated_on_road_price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Real-World vs Claimed Mileage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <Fuel className="w-5 h-5 text-emerald-400" />
              Real-World vs Claimed Mileage
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">ARAI Lab-Tested Claimed:</span>
                  <span className="font-bold text-white">{vehicle.claimed_mileage} {vehicle.fuel_type === "Electric" ? "km/charge" : "kmpl"}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-emerald-400 font-bold">Real-World City (Bumper-to-Bumper):</span>
                  <span className="font-bold text-emerald-400">{vehicle.real_world_city_mileage} {vehicle.fuel_type === "Electric" ? "km" : "kmpl"}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full" 
                    style={{ width: `${(vehicle.real_world_city_mileage / vehicle.claimed_mileage) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-teal-400 font-bold">Real-World Highway Cruising (80-100 km/h):</span>
                  <span className="font-bold text-teal-400">{vehicle.real_world_highway_mileage} {vehicle.fuel_type === "Electric" ? "km" : "kmpl"}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-400 h-full" 
                    style={{ width: `${(vehicle.real_world_highway_mileage / vehicle.claimed_mileage) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 mt-4">
                <strong>Source:</strong> Aggregated from {vehicle.mileage_sample_size} verified owner submissions with {vehicle.mileage_reliability_level} confidence.
              </div>
            </div>
          </div>

          {/* Safety & ADAS Intelligence */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Safety & ADAS Intelligence
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Bharat NCAP Rating</span>
                <span className="font-bold text-white">
                  {vehicle.b_ncap_tested ? `${vehicle.b_ncap_rating} Stars (${vehicle.b_ncap_adult_score})` : "Not Tested under B-NCAP"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Global NCAP Protocol</span>
                <span className="font-bold text-white">
                  {vehicle.g_ncap_tested ? `${vehicle.g_ncap_rating} Stars (${vehicle.g_ncap_protocol})` : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">Active Electronics</span>
                <span className="font-bold text-emerald-400">
                  ESC: {vehicle.has_esc ? "Yes" : "No"} | ABS: {vehicle.has_abs ? "Yes" : "No"} | ISOFIX: {vehicle.has_isofix ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">ADAS Radar Suite</span>
                <span className="font-bold text-blue-400">
                  {vehicle.adas_level > 0 ? `Level ${vehicle.adas_level} (${vehicle.adas_features})` : "No ADAS Radar"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Owner Reviews Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-white">Verified Owner Reviews</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Authentic logs from Indian car owners with vehicle registration (RC) validation.
              </p>
            </div>
            <Link
              href="/reviews"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
            >
              Write Review
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400">
              No verified reviews submitted for this specific model yet. Be the first to share your ownership journey!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{rev.user_name}</span>
                      <span className="text-xs text-slate-400">({rev.user_city})</span>
                      {rev.is_verified_owner && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/40">
                          {rev.verification_badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-emerald-400" />
                      <span>{rev.overall_rating} / 5</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-xs text-white mb-1">{rev.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{rev.review_text}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                    {rev.pros && (
                      <div className="text-emerald-400">
                        <strong>Pros:</strong> {rev.pros}
                      </div>
                    )}
                    {rev.cons && (
                      <div className="text-rose-400">
                        <strong>Cons:</strong> {rev.cons}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VehicleDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading vehicle details...</div>}>
      <VehicleDetailContent />
    </Suspense>
  );
}
