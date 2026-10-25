from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed_data import init_db_data
from app.routers import (
    vehicles,
    recommendations,
    comparisons,
    ownership_cost,
    mileage,
    safety,
    ev_calculator,
    location_advisor,
    reviews,
    admin,
    auth
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AutoWise AI - Intelligent Indian Vehicle Recommendation & Comparison Engine"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-seed initial data on startup
@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        init_db_data(db)
    finally:
        db.close()

# Include all modular routers
app.include_router(vehicles.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(comparisons.router, prefix=settings.API_V1_STR)
app.include_router(ownership_cost.router, prefix=settings.API_V1_STR)
app.include_router(mileage.router, prefix=settings.API_V1_STR)
app.include_router(safety.router, prefix=settings.API_V1_STR)
app.include_router(ev_calculator.router, prefix=settings.API_V1_STR)
app.include_router(location_advisor.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Online",
        "documentation": "/docs"
    }
