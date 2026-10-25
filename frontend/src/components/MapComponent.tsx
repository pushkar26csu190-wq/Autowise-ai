"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { ChargingStation } from "@/lib/types";

interface MapProps {
  stations: ChargingStation[];
  selectedCity?: string;
}

export default function MapComponent({ stations, selectedCity }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Dynamically import Leaflet on client
    import("leaflet").then((L) => {
      // Default center: India or selected city
      const cityCoords: Record<string, [number, number]> = {
        "Bengaluru": [12.9716, 77.5946],
        "Delhi NCR": [28.6139, 77.2090],
        "Mumbai": [19.0760, 72.8777],
        "Hyderabad": [17.3850, 78.4867],
        "Chennai": [13.0827, 80.2707],
        "Pune": [18.5204, 73.8567]
      };

      const center = (selectedCity && cityCoords[selectedCity]) || [12.9716, 77.5946];
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView(center, 12);

        // OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setView(center, 12);
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Add custom SVG station markers
      stations.forEach((st) => {
        const customIcon = L.divIcon({
          className: "custom-charger-pin",
          html: `
            <div style="
              background: #10b981;
              color: #022c22;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
              border: 2px solid white;
            ">
              ⚡
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const popupContent = `
          <div style="font-family: sans-serif; padding: 6px; min-width: 200px;">
            <div style="font-size: 11px; text-transform: uppercase; color: #059669; font-weight: 700;">${st.network}</div>
            <div style="font-size: 14px; font-weight: 700; margin-top: 2px; color: #111827;">${st.name}</div>
            <div style="font-size: 11px; color: #4b5563; margin-top: 4px;">${st.address}</div>
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 600; color: #10b981;">₹${st.cost_per_kwh}/kWh</span>
              <span style="font-size: 11px; background: #ecfdf5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${st.status}</span>
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Types: ${st.charger_types.join(", ")}</div>
          </div>
        `;

        L.marker([st.lat, st.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);
      });
    });

    return () => {
      // Don't necessarily destroy on re-renders, handle updates gracefully
    };
  }, [stations, selectedCity]);

  return (
    <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
