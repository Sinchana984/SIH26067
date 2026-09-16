import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config.settings import settings
from backend.database.connection import get_engine_type
from backend.api.routes import regions, forecast, observations, reliability, alerts, sources, models, predict, routing, chat, ai_orchestrator

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade REST API backend for the Ocean Forecast Reliability & Decision Support System (SIH 2026).",
    version=settings.VERSION
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(regions.router)
app.include_router(forecast.router)
app.include_router(observations.router)
app.include_router(reliability.router)
app.include_router(alerts.router)
app.include_router(sources.router)
app.include_router(models.router)
app.include_router(predict.router)
app.include_router(routing.router)
app.include_router(chat.router)
app.include_router(ai_orchestrator.router)

@app.get("/")
def read_root():
    engine_type = get_engine_type()
    return {
        "system": "OceanSphere - Ocean Forecast Reliability & Decision Support System",
        "status": "ONLINE",
        "database": settings.DB_NAME,
        "database_engine": engine_type,
        "api_docs": "/docs",
        "available_endpoints": [
            "/regions",
            "/forecast",
            "/observations",
            "/reliability",
            "/alerts",
            "/sources",
            "/models",
            "/predict",
            "/routing/calculate",
            "/chat/predict"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=settings.API_PORT, reload=True)
