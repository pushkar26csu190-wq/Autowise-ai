"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { fetchVehicles, calculateEvMetrics, fetchChargingStations } from "@/lib/api";
import { Vehicle, EvCalculatorResult, ChargingStation } from "@/lib/types";
import { 
  Zap, 
  BatteryCharging, 
  Clock, 
  IndianRupee, 
  MapPin, 
  Sliders, 
  Sun, 
  Gauge, 
  CheckCircle,
  HelpCircle,
  Wind
} from "lucide-react";

// Dynamically import OpenStreetMap Leaflet component with SSR disabled
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
      Loading OpenStreetMap Leaflet Engine...
    </div>
  )
});

export default function EvCalculatorPage() {
  const [evVehicles, setEvVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(2); // Default to Punch EV
  const [startSoc, setStartSoc] = useState<number>(20);
  const [targetSoc, setTargetSoc] = useState<number>(85);
  const [cruisingSpeed, setCruisingSpeed] = useState<number>(70);
  const [ambientTemp, setAmbientTemp] = useState<number>(34);
  const [acRunning, setAcRunning] = useState<boolean>(true);
  const [electricityTariff, setElectricityTariff] = useState<number>(8.0);

  const [metrics, setMetrics] = useState<EvCalculatorResult | null>(null);
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>([]);
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicles().then((data) => {
      const evs = data.filter((v: Vehicle) => v.fuel_type === "Electric");
      setEvVehicles(evs);
      if (evs.length > 0) setSelectedVehicleId(evs[0].id);
    });

    fetchChargingStations().then((stations) => {
      setChargingStations(stations);
    });
  }, []);

  useEffect(() => {
    if (selectedVehicleId) {
      runCalculation();
    }
  }, [selectedVehicleId, startSoc, targetSoc, cruisingSpeed, ambientTemp, acRunning, electricityTariff]);

  const runCalculation = async () => {
    setLoading(true);
    try {
      const res = await calculateEvMetrics({
        vehicle_id: selectedVehicleId,
        starting_battery_pct: startSoc,
        desired_battery_pct: targetSoc,
        average_speed_kmh: cruisingSpeed,
        ac_running: acRunning,
        ambient_temp_celsius: ambientTemp,
        electricity_tariff_inr: electricityTariff
      });
      setMetrics(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentEv = evVehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold mb-3 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>EV Range & Charging Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Indian EV Range & Charging Time Simulator
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Real EV range fluctuates heavily with 40°C Indian summer AC loads, highway drag above 80 km/h, and charging power curves. Simulate your journey and locate nearby chargers.
          </p>
        </div>

        {/* Input Parameters Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Select EV */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Select Electric Vehicle
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-cyan-500"
              >
                {evVehicles.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.battery_capacity_kwh} kWh)
                  </option>
                ))}
              </select>
            </div>

            {/* Starting & Desired SoC */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  State of Charge (SoC)
                </label>
                <span className="text-xs font-black text-cyan-400">
                  {startSoc}% → {targetSoc}% (+{targetSoc - startSoc}%)
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="5"
                  max="95"
                  value={startSoc}
                  onChange={(e) => setStartSoc(Number(e.target.value))}
                  className="w-1/2 p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white text-center"
                />
                <span className="text-slate-500 text-xs">to</span>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={targetSoc}
                  onChange={(e) => setTargetSoc(Number(e.target.value))}
                  className="w-1/2 p-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white text-center"
                />
              </div>
            </div>

            {/* Cruising Speed */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Average Speed
                </label>
                <span className="text-xs font-black text-white">{cruisingSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="40"
                max="120"
                step="5"
                value={cruisingSpeed}
                onChange={(e) => setCruisingSpeed(Number(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>40 km/h (City)</span>
                <span>80 km/h (Sweet spot)</span>
                <span>120 km/h (Expressway)</span>
              </div>
            </div>

            {/* Summer Temp & AC */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Ambient Weather & AC
                </label>
                <span className="text-xs font-black text-amber-400">{ambientTemp}°C</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="15"
                  max="46"
                  step="1"
                  value={ambientTemp}
                  onChange={(e) => setAmbientTemp(Number(e.target.value))}
                  className="w-2/3 accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <label className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acRunning}
                    onChange={(e) => setAcRunning(e.target.checked)}
                    className="accent-cyan-400 w-4 h-4 rounded"
                  />
                  AC On
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Results Metrics Banner */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                Energy Added
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {metrics.usable_energy_added_kwh} <span className="text-sm font-normal text-slate-400">kWh</span>
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Battery: {currentEv?.battery_capacity_kwh} kWh total
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                Estimated Real Range Gained
              </span>
              <span className="text-2xl font-black text-cyan-400 mt-1 block">
                {metrics.estimated_range_gained_km} <span className="text-sm font-normal text-slate-400">km</span>
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Weather/Speed Efficiency Penalty: {Math.round((metrics.temperature_speed_efficiency_factor - 1) * 100)}%
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                Charging Electricity Cost
              </span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                ₹{metrics.total_charging_cost_inr}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                ₹{metrics.cost_per_km_inr} per km (vs ₹7.55/km Petrol)
              </span>
            </div>

            <div className="bg-gradient-to-tr from-cyan-950 to-slate-900 border border-cyan-500/40 rounded-2xl p-5">
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold block">
                Instant Savings vs Petrol
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                ₹{metrics.savings_vs_petrol_inr}
              </span>
              <span className="text-[11px] text-cyan-300 font-semibold mt-1 block">
                Saved on this single charge cycle!
              </span>
            </div>
          </div>
        )}

        {/* Charging Time Matrix Across Charger Speeds */}
        {metrics && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Charging Duration Across Indian Charger Networks
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Time needed to charge from {startSoc}% to {targetSoc}% ({metrics.usable_energy_added_kwh} kWh).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 block mb-1">3.3 kW Home 15A Socket</span>
                <span className="text-2xl font-black text-white block">
                  {metrics.charging_times.home_3_3kw_hours} hrs
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">Overnight plug-in</span>
              </div>

              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 block mb-1">7.2 kW AC Wallbox</span>
                <span className="text-2xl font-black text-white block">
                  {metrics.charging_times.wallbox_7_2kw_hours} hrs
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">Home/Apartment Box</span>
              </div>

              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 block mb-1">30 kW City DC Fast</span>
                <span className="text-2xl font-black text-cyan-400 block">
                  {metrics.charging_times.dc_30kw_mins} mins
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">Mall / Office Park</span>
              </div>

              <div className="p-5 bg-emerald-950/40 rounded-2xl border border-emerald-500/40">
                <span className="text-xs font-bold text-emerald-400 block mb-1">50-60 kW Highway Fast</span>
                <span className="text-2xl font-black text-emerald-300 block">
                  {metrics.charging_times.dc_50kw_highway_mins} mins
                </span>
                <span className="text-[11px] text-emerald-500 mt-1 block">Expressway Pitstop</span>
              </div>
            </div>
          </div>
        )}

        {/* OpenStreetMap Leaflet Charging Station Finder */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-6 gap-4">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                Live EV Charging Stations Map (OpenStreetMap)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore real charging hubs across Tata Power EZ Charge, Zeon, Jio-bp, and Ather Grid.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">City View:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Pune">Pune</option>
              </select>
            </div>
          </div>

          <MapComponent stations={chargingStations} selectedCity={selectedCity} />
        </div>
      </div>
    </div>
  );
}
