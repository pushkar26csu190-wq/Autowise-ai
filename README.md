# AutoWise AI — Smart Vehicle Comparison & Recommendation Platform

> **Target Audience:** Indian Vehicle Buyers (Cars, SUVs, Sedans, Hatchbacks, Bikes, Scooters, EVs)  
> **Built With:** Next.js (React 19, TypeScript, Tailwind CSS), Python FastAPI, SQLAlchemy, Google Gemini API, OpenStreetMap (Leaflet), Recharts.

---

## 🚀 Live Services

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://127.0.0.1:8000`
- **API Documentation (Swagger UI):** `http://127.0.0.1:8000/docs`

---

## 🌟 12 Platform Pages

1. **Home Page (`/`)**: Modern hero search, category pills, budget slider, trending vehicles, and instant comparisons.
2. **AI Vehicle Recommendation (`/recommendations`)**: 12-lifestyle question advisor with deterministic multi-criteria weighted scoring and Gemini AI natural language explanation.
3. **Smart Comparison Engine (`/compare`)**: Side-by-side spec and real-world comparison of up to 4 vehicles with automated "Best in Class" highlights.
4. **Vehicle Details (`/vehicles/[id]`)**: Deep dive into pricing breakdown by state (ex-showroom, RTO road tax, insurance, TCS, FASTag), crash test ratings, and verified owner logs.
5. **5-Year True Ownership Cost Calculator (`/cost-calculator`)**: Interactive Recharts stacked bar & line charts showing loan EMIs, state road taxes, scheduled servicing, tyre changes, and depreciated resale recovery.
6. **Safety Comparison Dashboard (`/safety`)**: Dedicated crash-test transparency center distinguishing Bharat NCAP (2023/24) from older pre-2022 Global NCAP protocols.
7. **Real-World Mileage Explorer (`/mileage`)**: Laboratory ARAI claimed vs real-world city bumper-to-bumper and highway cruising mileage with owner report submission.
8. **EV Range and Charging Calculator (`/ev-calculator`)**: Speed & 40°C Indian summer AC degradation simulator, charging time across 3.3kW to 60kW DC chargers, and OpenStreetMap (Leaflet) charging station finder.
9. **Location-Based Vehicle Advisor (`/location-advisor`)**: Regional intelligence for major Indian cities (Bengaluru, Delhi NCR, Mumbai, Hyderabad, Chennai, Pune) with live fuel prices, monsoon flood clearance, and NGT 10-year diesel rule alerts.
10. **Verified Owner Reviews (`/reviews`)**: Authentic owner feedback with verification badges (RC / Invoice Verified), 5-category ratings, common problems faced, and AI sentiment analysis.
11. **User Profile & Saved Comparisons (`/profile`)**: Saved shortlist, bookmarks, and comparison decks.
12. **Admin Dashboard (`/admin`)**: Catalog stats, moderation pipelines for reviews and mileage submissions, and seed reset controls.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS
- **Visualizations:** Recharts (Stacked Bar, Line, Area charts)
- **Maps:** Leaflet & OpenStreetMap (Interactive EV charger finder)
- **Icons:** Lucide React

### Backend
- **Framework:** Python FastAPI
- **ORM:** SQLAlchemy (SQLite for local zero-config testing; PostgreSQL ready via standard `DATABASE_URL`)
- **Validation:** Pydantic v2
- **AI Integration:** Google Gemini API (`gemini-1.5-flash` / `gemini-2.5-flash`) with fallback deterministic NLP engine.
- **Server:** Uvicorn ASGI

---

## 💻 Running Locally

### 1. Backend Server
```bash
cd backend
# Activate venv
.\venv\Scripts\Activate.ps1
# Start FastAPI
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Application
```bash
cd frontend
npm run dev -- -p 3000
```

Open `http://localhost:3000` in your browser.
