from __future__ import annotations

import math
from typing import Literal

import joblib
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MODEL_PATH = "rent_model.joblib"
model = joblib.load(MODEL_PATH)

app = FastAPI(title="Amsterdam Rent Predictor")

# (Optioneel) CORS voor frontend op Vite (http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    vierkante_meter: float = Field(..., ge=10, le=500)
    inhoud_m3: float = Field(..., ge=10, le=2000)
    buitenruimte_m2: float = Field(..., ge=0, le=200)
    aantal_badkamers: int = Field(..., ge=1, le=5)
    aantal_kamers: int = Field(..., ge=1, le=15)
    aantal_woonlagen: int = Field(..., ge=1, le=10)

class PredictResponse(BaseModel):
    predicted_eur: float
    interval_low_eur: float
    interval_high_eur: float
    interval_type: Literal["fixed_abs_50"] = "fixed_abs_50"

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    X = np.array([[
        req.vierkante_meter,
        req.inhoud_m3,
        req.buitenruimte_m2,
        req.aantal_badkamers,
        req.aantal_kamers,
        req.aantal_woonlagen,
    ]], dtype=float)

    y_log = float(model.predict(X)[0])
    y = math.exp(y_log)

    # Jouw gewenste vaste band ± €50 (business rule, geen statistische CI)
    low = max(0.0, y - 50.0)
    high = y + 50.0

    return PredictResponse(
        predicted_eur=round(y, 2),
        interval_low_eur=round(low, 2),
        interval_high_eur=round(high, 2),
    )
