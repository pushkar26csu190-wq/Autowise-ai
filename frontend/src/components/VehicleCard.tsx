"use client";

import React from "react";
import Link from "next/link";
import { Vehicle } from "@/lib/types";
import { Shield, Fuel, Gauge, Users, ChevronRight, GitCompare, Calculator } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  onCompareToggle?: (vehicleId: number) => void;
  isCompared?: boolean;
}

export default function VehicleCard({ vehicle, onCompareToggle, isCompared }: VehicleCardProps) {
  const formatLakhs = (val: number) => {
    return (val / 100000).toFixed(2);
  };

  const safetyStars = vehicle.b_ncap_rating || vehicle.g_ncap_rating;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-emerald-950/20 transition-all duration-200 flex flex-col group">
      {/* Image & Badges */}
      <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
        {vehicle.image_url ? (
          <img
            src={vehicle.image_url}
            alt={vehicle.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/90 text-white backdrop-blur-md border border-slate-700">
            {vehicle.category}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md ${
            vehicle.fuel_type === "Electric"
              ? "bg-emerald-500/90 text-slate-950"
              : vehicle.fuel_type === "Strong Hybrid"
              ? "bg-teal-500/90 text-slate-950"
              : vehicle.fuel_type === "Diesel"
              ? "bg-amber-500/90 text-slate-950"
              : "bg-blue-500/90 text-white"
          }`}>
            {vehicle.fuel_type}
          </span>
        </div>

        {/* Safety Badge */}
        {safetyStars ? (
          <div className="absolute top-3 right-3 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-1 backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>{safetyStars}★ {vehicle.b_ncap_tested ? "B-NCAP" : "G-NCAP"}</span>
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-slate-800/80 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-medium backdrop-blur-md">
            Untested
          </div>
        )}

        {/* Real-world Mileage pill */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md">
          <Fuel className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Real-World: <strong className="text-white">{vehicle.real_world_mixed_mileage} {vehicle.fuel_type === "Electric" ? "km range" : "kmpl"}</strong>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-emerald-400">{vehicle.brand}</span>
            <span>{vehicle.transmission}</span>
          </div>
          <h3 className="font-bold text-base text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
            {vehicle.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {vehicle.description}
          </p>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y border-slate-800/80 text-center">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Power</span>
              <span className="text-xs font-bold text-slate-200">{vehicle.max_power_bhp} bhp</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Clearance</span>
              <span className="text-xs font-bold text-slate-200">{vehicle.ground_clearance_mm ? `${vehicle.ground_clearance_mm} mm` : "N/A"}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Capacity</span>
              <span className="text-xs font-bold text-slate-200">{vehicle.seating_capacity} Seats</span>
            </div>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="mt-4 pt-2">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Ex-Showroom</span>
              <span className="text-lg font-extrabold text-white">
                ₹{formatLakhs(vehicle.price_ex_showroom_inr)} <span className="text-xs font-normal text-slate-400">Lakh</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Est. 5-Yr TCO</span>
              <span className="text-xs font-bold text-emerald-400">
                ~₹{formatLakhs(vehicle.price_ex_showroom_inr + vehicle.five_year_maintenance_inr + 200000)} Lakh
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/vehicles/${vehicle.id}`}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              Details
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            {onCompareToggle && (
              <button
                onClick={() => onCompareToggle(vehicle.id)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors border ${
                  isCompared
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                    : "bg-slate-800/60 hover:bg-slate-800 text-slate-200 border-slate-700"
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                {isCompared ? "Added" : "Compare"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
