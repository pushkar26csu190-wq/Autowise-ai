"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  GitCompare, 
  Calculator, 
  ShieldCheck, 
  Fuel, 
  Zap, 
  MapPin, 
  MessageSquareCheck, 
  User, 
  LayoutDashboard,
  Menu,
  X,
  Car
} from "lucide-react";

const navLinks = [
  { name: "AI Advisor", href: "/recommendations", icon: Sparkles, highlight: true },
  { name: "Compare", href: "/compare", icon: GitCompare },
  { name: "Ownership Cost", href: "/cost-calculator", icon: Calculator },
  { name: "Safety Hub", href: "/safety", icon: ShieldCheck },
  { name: "Real Mileage", href: "/mileage", icon: Fuel },
  { name: "EV Suite", href: "/ev-calculator", icon: Zap },
  { name: "City Advisor", href: "/location-advisor", icon: MapPin },
  { name: "Reviews", href: "/reviews", icon: MessageSquareCheck },
  { name: "Saved", href: "/profile", icon: User },
  { name: "Admin", href: "/admin", icon: LayoutDashboard }
];

function DesktopNavLinks() {
  const pathname = usePathname();

  return (
    <div className="hidden xl:flex items-center space-x-1">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 ${
              isActive
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : link.highlight
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:from-emerald-500 hover:to-teal-500 font-bold px-3.5"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : ""}`} />
            {link.name}
          </Link>
        );
      })}
    </div>
  );
}

function MobileNavLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  return (
    <div className="xl:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Icon className="w-4 h-4 text-emerald-400" />
            {link.name}
          </Link>
        );
      })}
    </div>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                AutoWise <span className="text-emerald-400 font-black">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                Smart Indian Vehicle Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation with Suspense */}
          <Suspense fallback={<div className="hidden xl:flex h-8 w-96 bg-slate-800/40 rounded-lg animate-pulse" />}>
            <DesktopNavLinks />
          </Suspense>

          {/* Mobile hamburger button */}
          <div className="flex xl:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <Suspense fallback={null}>
          <MobileNavLinks onClose={() => setMobileMenuOpen(false)} />
        </Suspense>
      )}
    </nav>
  );
}
