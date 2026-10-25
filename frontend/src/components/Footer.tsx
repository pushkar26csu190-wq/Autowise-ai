import React from "react";
import Link from "next/link";
import { Shield, Info, ExternalLink, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
                AW
              </div>
              <span className="text-lg font-bold text-white tracking-tight">AutoWise AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India&apos;s premier smart vehicle recommendation and true ownership cost platform. Engineered specifically for Indian road conditions, state RTO tax variations, and real-world fuel economy.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Shield className="w-4 h-4" />
              <span>Independent & Unbiased Analysis</span>
            </div>
          </div>

          {/* Core Tools */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Decision Tools</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/recommendations" className="hover:text-emerald-400 transition-colors">AI Vehicle Recommendation Engine</Link></li>
              <li><Link href="/compare" className="hover:text-emerald-400 transition-colors">Multi-Vehicle Smart Comparison</Link></li>
              <li><Link href="/cost-calculator" className="hover:text-emerald-400 transition-colors">5-Year True Ownership Cost</Link></li>
              <li><Link href="/safety" className="hover:text-emerald-400 transition-colors">Bharat NCAP Safety Dashboard</Link></li>
              <li><Link href="/mileage" className="hover:text-emerald-400 transition-colors">Real-World Mileage Explorer</Link></li>
              <li><Link href="/ev-calculator" className="hover:text-emerald-400 transition-colors">EV Range & Charger Finder</Link></li>
            </ul>
          </div>

          {/* Regional & Ownership */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">City Intelligence</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/location-advisor" className="hover:text-emerald-400 transition-colors">Bengaluru (Silk Board & 18% RTO)</Link></li>
              <li><Link href="/location-advisor" className="hover:text-emerald-400 transition-colors">Delhi NCR (10-Yr Diesel NGT Rule)</Link></li>
              <li><Link href="/location-advisor" className="hover:text-emerald-400 transition-colors">Mumbai (Monsoon Flood Clearance)</Link></li>
              <li><Link href="/reviews" className="hover:text-emerald-400 transition-colors">RC-Verified Owner Reviews</Link></li>
              <li><Link href="/profile" className="hover:text-emerald-400 transition-colors">Saved Shortlists & Comparisons</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-400 transition-colors">Admin Governance Portal</Link></li>
            </ul>
          </div>

          {/* Regulatory & Safety Disclaimers */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data Disclaimers</span>
            </div>
            <p className="text-slate-400 leading-normal">
              <strong>Bharat NCAP:</strong> Ratings represent official tested models only. Pre-2022 Global NCAP tests adhere to different criteria and are not directly comparable.
            </p>
            <p className="text-slate-400 leading-normal">
              <strong>Real Mileage:</strong> Sourced from verified owner logs (tank-to-tank & telematics). ARAI figures are laboratory-tested manufacturer claims.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 AutoWise AI. Built for Indian vehicle buyers.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Powered by Next.js, FastAPI & Google Gemini
          </p>
        </div>
      </div>
    </footer>
  );
}
