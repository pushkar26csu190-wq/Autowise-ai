"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchReviews, fetchVehicles, submitReview } from "@/lib/api";
import { Review, Vehicle } from "@/lib/types";
import { 
  MessageSquareCheck, 
  ShieldCheck, 
  Star, 
  Plus, 
  CheckCircle2, 
  Filter, 
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle,
  Wrench,
  Search,
  Check
} from "lucide-react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>(undefined);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Review Form Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form fields
  const [formVehicleId, setFormVehicleId] = useState<number>(1);
  const [formName, setFormName] = useState("");
  const [formCity, setFormCity] = useState("Bengaluru");
  const [formMonths, setFormMonths] = useState<number>(12);
  const [formOdo, setFormOdo] = useState<number>(15000);
  const [formBadge, setFormBadge] = useState("RC Verified Owner");
  const [ratingComfort, setRatingComfort] = useState<number>(4);
  const [ratingMileage, setRatingMileage] = useState<number>(4);
  const [ratingPerf, setRatingPerf] = useState<number>(4);
  const [ratingMaint, setRatingMaint] = useState<number>(4);
  const [ratingRel, setRatingRel] = useState<number>(4);
  const [formTitle, setFormTitle] = useState("");
  const [formText, setFormText] = useState("");
  const [formPros, setFormPros] = useState("");
  const [formCons, setFormCons] = useState("");
  const [formProblems, setFormProblems] = useState("");
  const [formRepairCost, setFormRepairCost] = useState<number>(0);

  useEffect(() => {
    loadReviews();
    fetchVehicles().then((data) => {
      setVehicles(data);
      if (data.length > 0) setFormVehicleId(data[0].id);
    });
  }, [selectedVehicleId, verifiedOnly, sentimentFilter]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchReviews(selectedVehicleId, verifiedOnly, sentimentFilter);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitReview({
        vehicle_id: formVehicleId,
        user_name: formName || "Verified Car Owner",
        user_city: formCity,
        verification_badge: formBadge,
        ownership_duration_months: formMonths,
        odometer_reading_km: formOdo,
        rating_comfort: ratingComfort,
        rating_mileage: ratingMileage,
        rating_performance: ratingPerf,
        rating_maintenance: ratingMaint,
        rating_reliability: ratingRel,
        title: formTitle,
        review_text: formText,
        pros: formPros,
        cons: formCons,
        common_problems_faced: formProblems,
        monthly_repair_cost_inr: formRepairCost
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setModalOpen(false);
        loadReviews();
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Submission error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold mb-3 uppercase tracking-wider">
              <MessageSquareCheck className="w-3.5 h-3.5" />
              <span>Verified Indian Ownership Registry</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Authentic Owner Reviews & Reliability Hub
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Unfiltered feedback from verified Indian vehicle owners. Real-world maintenance bills, common electronics glitches, suspension feedback, and AI sentiment analysis.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Write Verified Review
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Vehicle Model</span>
              <select
                value={selectedVehicleId || ""}
                onChange={(e) => setSelectedVehicleId(e.target.value ? Number(e.target.value) : undefined)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white"
              >
                <option value="">All Vehicles</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Sentiment</span>
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white"
              >
                <option value="All">All Sentiments</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="accent-emerald-500 w-4 h-4 rounded"
            />
            Show RC/Invoice Verified Owners Only
          </label>
        </div>

        {/* Reviews List Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading verified owner reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 text-xs">
            No reviews match the selected filter. Be the first to submit a review!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => {
              const matchedVehicle = vehicles.find((v) => v.id === rev.vehicle_id);
              return (
                <div
                  key={rev.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* User and Verification Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{rev.user_name}</span>
                          <span className="text-xs text-slate-400 font-medium">({rev.user_city})</span>
                        </div>
                        {rev.is_verified_owner ? (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            {rev.verification_badge}
                          </span>
                        ) : (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] text-slate-500 bg-slate-800">
                            Unverified
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400 font-black text-xs">
                        <Star className="w-3.5 h-3.5 fill-emerald-400" />
                        <span>{rev.overall_rating} / 5</span>
                      </div>
                    </div>

                    {/* Vehicle Tag */}
                    <div className="text-[11px] text-emerald-400 font-bold mb-2">
                      Model: {matchedVehicle ? matchedVehicle.name : `Vehicle #${rev.vehicle_id}`} • Owned {rev.ownership_duration_months} Months ({rev.odometer_reading_km.toLocaleString()} km)
                    </div>

                    <h4 className="font-bold text-sm text-white mb-2">{rev.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{rev.review_text}</p>

                    {/* Ratings Grid */}
                    <div className="grid grid-cols-5 gap-1 text-center py-2.5 px-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[10px] mb-4">
                      <div>
                        <span className="text-slate-500 block">Comfort</span>
                        <strong className="text-white">{rev.rating_comfort}★</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Mileage</span>
                        <strong className="text-white">{rev.rating_mileage}★</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Power</span>
                        <strong className="text-white">{rev.rating_performance}★</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Maint.</span>
                        <strong className="text-white">{rev.rating_maintenance}★</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Reliability</span>
                        <strong className="text-white">{rev.rating_reliability}★</strong>
                      </div>
                    </div>

                    {/* Pros and Cons */}
                    <div className="space-y-1.5 text-[11px]">
                      {rev.pros && (
                        <div className="text-emerald-400 flex items-start gap-1.5">
                          <ThumbsUp className="w-3 h-3 shrink-0 mt-0.5" />
                          <span><strong>Pros:</strong> {rev.pros}</span>
                        </div>
                      )}
                      {rev.cons && (
                        <div className="text-rose-400 flex items-start gap-1.5">
                          <ThumbsDown className="w-3 h-3 shrink-0 mt-0.5" />
                          <span><strong>Cons:</strong> {rev.cons}</span>
                        </div>
                      )}
                      {rev.common_problems_faced && (
                        <div className="text-amber-400 flex items-start gap-1.5 pt-1">
                          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                          <span><strong>Issues:</strong> {rev.common_problems_faced}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span>AI Sentiment: <strong className={rev.sentiment === "Positive" ? "text-emerald-400" : rev.sentiment === "Critical" ? "text-rose-400" : "text-amber-400"}>{rev.sentiment}</strong></span>
                    <span>Repair bill: ₹{rev.monthly_repair_cost_inr}/mo</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Write Review Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <MessageSquareCheck className="w-4 h-4" />
                <span>Verified Owner Experience</span>
              </div>
              <h2 className="text-xl font-black text-white mb-4">
                Write a Verified Owner Review
              </h2>

              {submitSuccess ? (
                <div className="p-8 text-center text-emerald-400 space-y-2">
                  <CheckCircle2 className="w-12 h-12 mx-auto" />
                  <h4 className="font-bold text-lg text-white">Review Submitted!</h4>
                  <p className="text-xs text-slate-400">
                    Thank you for helping Indian buyers make informed choices.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Select Your Vehicle</label>
                    <select
                      value={formVehicleId}
                      onChange={(e) => setFormVehicleId(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Your Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Vikram P."
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Your City</label>
                      <input
                        type="text"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Verification Status</label>
                      <select
                        value={formBadge}
                        onChange={(e) => setFormBadge(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      >
                        <option value="RC Verified Owner">RC Verified Owner (Green Badge)</option>
                        <option value="Invoice Verified">Invoice / Insurance Verified</option>
                        <option value="Unverified">Unverified</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Months Owned</label>
                      <input
                        type="number"
                        value={formMonths}
                        onChange={(e) => setFormMonths(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Odometer (km)</label>
                      <input
                        type="number"
                        value={formOdo}
                        onChange={(e) => setFormOdo(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  {/* Category Ratings */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-2">Category Ratings (1 to 5 Stars)</label>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {[
                        { label: "Comfort", val: ratingComfort, set: setRatingComfort },
                        { label: "Mileage", val: ratingMileage, set: setRatingMileage },
                        { label: "Power", val: ratingPerf, set: setRatingPerf },
                        { label: "Service", val: ratingMaint, set: setRatingMaint },
                        { label: "Reliability", val: ratingRel, set: setRatingRel }
                      ].map((item) => (
                        <div key={item.label} className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block mb-1">{item.label}</span>
                          <select
                            value={item.val}
                            onChange={(e) => item.set(Number(e.target.value))}
                            className="bg-transparent text-emerald-400 font-black text-xs text-center"
                          >
                            <option value={5}>5★</option>
                            <option value={4}>4★</option>
                            <option value={3}>3★</option>
                            <option value={2}>2★</option>
                            <option value={1}>1★</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Review Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. 23 kmpl inside Mumbai traffic, incredible hybrid powertrain"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Detailed Ownership Review</label>
                    <textarea
                      rows={3}
                      placeholder="Describe highway comfort, bumper clearance, AC cooling in hot weather, service centre experience..."
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Key Pros</label>
                      <input
                        type="text"
                        placeholder="e.g. High clearance, silent drive"
                        value={formPros}
                        onChange={(e) => setFormPros(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Key Cons</label>
                      <input
                        type="text"
                        placeholder="e.g. Boot space small"
                        value={formCons}
                        onChange={(e) => setFormCons(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Problems Faced / Glitches</label>
                    <input
                      type="text"
                      placeholder="e.g. Infotainment freeze, DPF alert in city"
                      value={formProblems}
                      onChange={(e) => setFormProblems(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="flex-1 py-2.5 bg-slate-800 text-white font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md disabled:opacity-50"
                    >
                      {submitting ? "Analyzing & Saving..." : "Publish Review"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
