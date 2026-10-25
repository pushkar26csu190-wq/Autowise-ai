const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function fetchVehicles(params: Record<string, any> = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "" && val !== "All") {
      query.append(key, String(val));
    }
  });

  const res = await fetch(`${API_BASE_URL}/vehicles?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  return res.json();
}

export async function fetchVehicleDetail(id: number, city: string = "Bengaluru") {
  const res = await fetch(`${API_BASE_URL}/vehicles/${id}?city=${encodeURIComponent(city)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch vehicle detail");
  return res.json();
}

export async function fetchCategoriesMeta() {
  const res = await fetch(`${API_BASE_URL}/vehicles/meta/categories`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getRecommendations(payload: any) {
  const res = await fetch(`${API_BASE_URL}/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to get recommendations");
  return res.json();
}

export async function compareVehicles(vehicleIds: number[], cityName: string = "Bengaluru", monthlyKm: number = 1200) {
  const res = await fetch(`${API_BASE_URL}/comparisons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vehicle_ids: vehicleIds,
      city_name: cityName,
      driving_km_per_month: monthlyKm
    }),
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to compare vehicles");
  return res.json();
}

export async function calculateOwnershipCost(payload: any) {
  const res = await fetch(`${API_BASE_URL}/ownership-cost/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to calculate ownership cost");
  return res.json();
}

export async function fetchMileageExplorer(category?: string, fuelType?: string, sortBy: string = "efficiency") {
  const query = new URLSearchParams({ sort_by: sortBy });
  if (category && category !== "All") query.append("category", category);
  if (fuelType && fuelType !== "All") query.append("fuel_type", fuelType);

  const res = await fetch(`${API_BASE_URL}/mileage/explorer?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch mileage explorer");
  return res.json();
}

export async function submitMileageReport(payload: any) {
  const res = await fetch(`${API_BASE_URL}/mileage/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to submit mileage report");
  return res.json();
}

export async function fetchSafetyDashboard(agency: string = "all", hasAdas?: boolean, minAirbags?: number) {
  const query = new URLSearchParams({ ncap_agency: agency });
  if (hasAdas) query.append("has_adas", "true");
  if (minAirbags) query.append("min_airbags", String(minAirbags));

  const res = await fetch(`${API_BASE_URL}/safety/dashboard?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch safety dashboard");
  return res.json();
}

export async function calculateEvMetrics(payload: any) {
  const res = await fetch(`${API_BASE_URL}/ev/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to calculate EV metrics");
  return res.json();
}

export async function fetchChargingStations(city?: string) {
  const query = city && city !== "All" ? `?city=${encodeURIComponent(city)}` : "";
  const res = await fetch(`${API_BASE_URL}/ev/chargers${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch chargers");
  return res.json();
}

export async function fetchCities() {
  const res = await fetch(`${API_BASE_URL}/location/cities`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch cities");
  return res.json();
}

export async function getLocationAdvice(cityName: string, dailyCommuteKm: number = 25, budgetInr: number = 1500000) {
  const res = await fetch(`${API_BASE_URL}/location/advise`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      city_name: cityName,
      daily_commute_km: dailyCommuteKm,
      budget_inr: budgetInr
    }),
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to get location advice");
  return res.json();
}

export async function fetchReviews(vehicleId?: number, verifiedOnly: boolean = false, sentiment?: string) {
  const query = new URLSearchParams();
  if (vehicleId) query.append("vehicle_id", String(vehicleId));
  if (verifiedOnly) query.append("verified_only", "true");
  if (sentiment && sentiment !== "All") query.append("sentiment", sentiment);

  const res = await fetch(`${API_BASE_URL}/reviews?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function fetchReviewSummary(vehicleId: number) {
  const res = await fetch(`${API_BASE_URL}/reviews/summary/${vehicleId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch review summary");
  return res.json();
}

export async function submitReview(payload: any) {
  const res = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to submit review");
  return res.json();
}

export async function fetchUserProfile() {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

export async function fetchSavedComparisons() {
  const res = await fetch(`${API_BASE_URL}/auth/saved-comparisons`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch saved comparisons");
  return res.json();
}

export async function saveComparison(payload: { user_id: string; title: string; vehicle_ids: string; notes?: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/saved-comparisons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to save comparison");
  return res.json();
}

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE_URL}/admin/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch admin stats");
  return res.json();
}

export async function resetDatabaseSeed() {
  const res = await fetch(`${API_BASE_URL}/admin/reset-seed`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset seed");
  return res.json();
}
