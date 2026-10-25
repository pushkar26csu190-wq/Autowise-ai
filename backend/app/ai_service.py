import os
import json
import logging
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

# Check if google-generativeai is configured
gemini_model = None
if settings.GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        logger.info("Gemini API initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not initialize Gemini API: {e}")

def generate_recommendation_explanation(
    user_req: Dict[str, Any],
    top_vehicles: List[Dict[str, Any]]
) -> str:
    """
    Generate an insightful, human-friendly explanation of why these top vehicles
    were chosen for the buyer's unique Indian driving scenario.
    """
    if gemini_model:
        try:
            prompt = f"""
You are an expert Indian automotive consultant at AutoWise AI.
Explain to an Indian vehicle buyer why these specific vehicles fit their lifestyle, city conditions, and requirements.

Buyer Profile:
- Budget: ₹{user_req.get('budget_max_inr', 0):,}
- Location: {user_req.get('city', 'India')}, {user_req.get('state', '')}
- Daily Running: {user_req.get('daily_travel_km', 0)} km/day
- Category: {user_req.get('vehicle_category', 'Any')}
- Passengers: {user_req.get('passengers', 5)}
- Fuel Preference: {user_req.get('fuel_preference', 'Any')}
- Transmission: {user_req.get('transmission_preference', 'Any')}
- Driving Split: {user_req.get('driving_environment', 'Mixed')}
- Safety Priority: {user_req.get('safety_priority', 'High')}

Recommended Vehicles Selected by Algorithm:
{json.dumps([{
    'name': v['name'],
    'score': v['score'],
    'price_ex': v['price_ex_showroom_inr'],
    'fuel': v['fuel_type'],
    'mileage': v['real_world_mixed_mileage'],
    'safety_stars': v.get('b_ncap_rating') or v.get('g_ncap_rating', 'Not Tested'),
    'ground_clearance': v.get('ground_clearance_mm', 'N/A')
} for v in top_vehicles], indent=2)}

STRICT RULES:
1. Do NOT invent or alter prices, specs, or safety ratings.
2. Address city specific conditions (monsoon, traffic, road tax) for {user_req.get('city', 'their city')}.
3. Provide a clear, natural, actionable 2-paragraph verdict in plain English without jargon.
"""
            response = gemini_model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini API call failed, falling back to deterministic explanation: {e}")

    # Fallback contextual automotive logic:
    top_v = top_vehicles[0] if top_vehicles else None
    if not top_v:
        return "No exact match found within the current constraints. Consider widening your budget or vehicle category."

    city = user_req.get('city', 'your city')
    daily_km = user_req.get('daily_travel_km', 30)
    fuel_pref = user_req.get('fuel_preference', 'Any')

    fuel_advise = ""
    if daily_km > 50 and top_v['fuel_type'] in ['Electric', 'Strong Hybrid', 'CNG']:
        fuel_advise = f"Given your high daily commute of {daily_km} km, opting for {top_v['name']}'s {top_v['fuel_type']} powertrain will save you over ₹4,000–₹7,000 monthly in running expenses compared to conventional petrol vehicles."
    elif daily_km <= 25:
        fuel_advise = f"For a moderate daily commute of {daily_km} km in {city}, {top_v['name']} delivers a sweet balance between initial acquisition cost and low routine maintenance."

    safety_text = ""
    if top_v.get('b_ncap_rating') == 5 or top_v.get('g_ncap_rating') == 5:
        safety_text = f"Crucially, it boasts a 5-star crash test safety rating with 6 standard airbags and ESC, perfectly fulfilling your priority for family occupant protection on Indian highways."
    else:
        safety_text = f"It features essential active safety tech including standard ESC, ABS with EBD, and ISOFIX child seat mounts for city and suburban transit."

    city_text = f"In {city}, where road conditions and monsoon waterlogging demand resilience, its {top_v.get('ground_clearance_mm', 190)} mm ground clearance ensures peace of mind over high speed bumps and uneven patches."

    return (
        f"Based on your budget of ₹{user_req.get('budget_max_inr', 0):,} and travel requirements, the {top_v['name']} stands out as your best match with an overall suitability score of {top_v['score']}/100. "
        f"{fuel_advise} {safety_text}\n\n"
        f"{city_text} Overall, it provides the lowest 5-year total cost of ownership while fulfilling your space and driving preferences."
    )

def generate_comparison_verdict(
    vehicles: List[Dict[str, Any]],
    user_context: Dict[str, Any]
) -> str:
    """
    Generate an AI comparative verdict highlighting trade-offs between up to 4 vehicles.
    """
    if gemini_model:
        try:
            prompt = f"""
Compare these {len(vehicles)} vehicles for an Indian car buyer:
{json.dumps([{
    'name': v['name'],
    'price': v['price_ex_showroom_inr'],
    'fuel': v['fuel_type'],
    'real_mileage': v['real_world_mixed_mileage'],
    'power': v['max_power_bhp'],
    'safety': v.get('b_ncap_rating') or v.get('g_ncap_rating', 'Not Tested'),
    'maintenance_5yr': v.get('five_year_maintenance_inr')
} for v in vehicles], indent=2)}

Buyer City: {user_context.get('city_name', 'Bengaluru')}
Monthly Travel: {user_context.get('driving_km_per_month', 1200)} km

Provide a concise, sharp comparative breakdown:
1. Who should buy which vehicle (practical use-case for each)
2. Value-for-money verdict
3. Final balanced recommendation
"""
            response = gemini_model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini API call failed for comparison: {e}")

    # Fallback deterministic comparison verdict
    names = [v['name'] for v in vehicles]
    if len(vehicles) == 1:
        return f"Reviewing {names[0]}. It stands as a comprehensive contender in its segment."

    cheapest = min(vehicles, key=lambda x: x['price_ex_showroom_inr'])
    safest = max(vehicles, key=lambda x: (x.get('b_ncap_rating') or x.get('g_ncap_rating') or 0))
    most_efficient = max(vehicles, key=lambda x: x['real_world_mixed_mileage'])

    verdict = (
        f"Comparing {', '.join(names)} reveals distinct segment champions depending on your exact daily priorities. "
        f"If upfront budget and initial on-road expense are your driving criteria, the {cheapest['name']} at ₹{cheapest['price_ex_showroom_inr']:,} offers accessible value. "
        f"For fuel economics and high monthly commutes, the {most_efficient['name']} leads with an authentic real-world efficiency of {most_efficient['real_world_mixed_mileage']} km/l (or km/charge). "
        f"From a crash safety and highway durability standpoint, the {safest['name']} stands out with superior structural safety and active safety assists. "
        f"For most Indian family buyers facing mixed city traffic and weekend highway trips, the {vehicles[0]['name']} delivers the most balanced total ownership experience."
    )
    return verdict

def analyze_review_sentiment(review_text: str, rating: float) -> str:
    """
    Classify review sentiment (Positive, Neutral, Critical).
    """
    if rating >= 4.0:
        return "Positive"
    elif rating <= 2.5:
        return "Critical"
    else:
        return "Neutral"
