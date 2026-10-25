from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Vehicle
from app.schemas import VehicleOut

router = APIRouter(prefix="/safety", tags=["Safety Intelligence"])

@router.get("/dashboard")
def get_safety_dashboard(
    ncap_agency: Optional[str] = Query("all", pattern="^(all|bncap|gncap|untested)$"),
    has_adas: Optional[bool] = None,
    min_airbags: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle)

    if ncap_agency == "bncap":
        query = query.filter(Vehicle.b_ncap_tested == True)
    elif ncap_agency == "gncap":
        query = query.filter(Vehicle.g_ncap_tested == True)
    elif ncap_agency == "untested":
        query = query.filter(Vehicle.b_ncap_tested == False, Vehicle.g_ncap_tested == False)

    if has_adas:
        query = query.filter(Vehicle.adas_level > 0)
    if min_airbags:
        query = query.filter(Vehicle.airbags_count >= min_airbags)

    vehicles = query.all()

    results = []
    for v in vehicles:
        # Determine protocol transparency note
        protocol_warning = None
        if v.g_ncap_tested and v.g_ncap_protocol and "Pre-2022" in v.g_ncap_protocol:
            protocol_warning = "Evaluated under older pre-July 2022 Global NCAP protocol (Frontal offset only; side impact & ESC not mandated for 5 stars). Not directly comparable to 2024 Bharat NCAP."
        elif v.b_ncap_tested:
            protocol_warning = "Tested under official MoRTH Bharat NCAP 2023/24 protocol including Side Pole Impact, ESC compliance, and Pedestrian Protection."

        results.append({
            "vehicle_id": v.id,
            "name": v.name,
            "brand": v.brand,
            "category": v.category,
            "image_url": v.image_url,
            "b_ncap": {
                "tested": v.b_ncap_tested,
                "stars": v.b_ncap_rating if v.b_ncap_tested else None,
                "adult_score": v.b_ncap_adult_score if v.b_ncap_tested else "Data Unavailable",
                "child_score": v.b_ncap_child_score if v.b_ncap_tested else "Data Unavailable",
                "label": f"{int(v.b_ncap_rating)} Stars ★" if v.b_ncap_tested else "Not Tested under B-NCAP"
            },
            "g_ncap": {
                "tested": v.g_ncap_tested,
                "stars": v.g_ncap_rating if v.g_ncap_tested else None,
                "protocol": v.g_ncap_protocol or "Data Unavailable",
                "test_year": v.g_ncap_test_year,
                "tested_variant": v.tested_variant or "Standard Production Spec",
                "label": f"{int(v.g_ncap_rating)} Stars ★" if v.g_ncap_tested and v.g_ncap_rating else "Not Tested under Global NCAP"
            },
            "active_safety": {
                "airbags_count": v.airbags_count,
                "airbags_label": f"{v.airbags_count} Airbags Standard",
                "has_abs": v.has_abs,
                "has_esc": v.has_esc,
                "has_isofix": v.has_isofix,
                "adas_level": v.adas_level,
                "adas_features": v.adas_features or "Standard Active Safety (No Radar ADAS)"
            },
            "protocol_warning": protocol_warning,
            "safety_score_index": (
                (v.b_ncap_rating or 0) * 12 +
                (v.g_ncap_rating or 0) * 8 +
                v.airbags_count * 5 +
                (20 if v.has_esc else 0) +
                (15 if v.adas_level >= 2 else 5 if v.adas_level == 1 else 0)
            )
        })

    # Sort by overall safety score index
    results.sort(key=lambda x: x["safety_score_index"], reverse=True)

    return {
        "regulatory_notice": "Safety scores adhere strictly to official test reports. Pre-2022 Global NCAP scores are distinctly demarcated from modern Bharat NCAP and post-2022 updated protocols.",
        "vehicles": results,
        "total_tested_bncap": sum(1 for v in results if v["b_ncap"]["tested"]),
        "total_tested_gncap": sum(1 for v in results if v["g_ncap"]["tested"]),
        "total_untested": sum(1 for v in results if not v["b_ncap"]["tested"] and not v["g_ncap"]["tested"])
    }
