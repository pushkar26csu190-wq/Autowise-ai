"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchUserProfile, fetchSavedComparisons } from "@/lib/api";
import { SavedComparison } from "@/lib/types";
import { 
  User, 
  Bookmark, 
  GitCompare, 
  ShieldCheck, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Trash2
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [savedList, setSavedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const p = await fetchUserProfile();
      setProfile(p);
      const s = await fetchSavedComparisons();
      setSavedList(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-emerald-500/20">
            RV
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-black text-white">{profile?.full_name || "Rahul Verma"}</h1>
                <span className="text-xs text-emerald-400 font-bold flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Indian Vehicle Buyer
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 self-center sm:self-auto">
                {profile?.auth_provider || "Supabase Auth"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{profile?.email || "rahul.verma@example.com"}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{profile?.phone || "+91 98765 43210"}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{profile?.city || "Bengaluru"}, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Comparisons Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-400" />
                Saved Vehicle Comparisons ({savedList.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Saved comparison decks ready for quick side-by-side analysis.
              </p>
            </div>
            <Link
              href="/compare"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
            >
              New Comparison
            </Link>
          </div>

          {savedList.length === 0 ? (
            <div className="p-10 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-3">
              <GitCompare className="w-8 h-8 text-slate-600 mx-auto" />
              <p>You haven&apos;t saved any vehicle comparisons yet.</p>
              <Link
                href="/compare"
                className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
              >
                Go to Vehicle Comparison Engine →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedList.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-sm text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{item.notes}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2">
                      <Clock className="w-3 h-3" />
                      <span>Saved on {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/compare?ids=${item.vehicle_ids}`}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-md"
                    >
                      Open Comparison
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
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
