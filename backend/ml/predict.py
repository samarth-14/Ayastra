import os
import pickle
import numpy as np
import pandas as pd

from data_loader import load_data
from features import add_features, FEATURE_COLS

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

def load_model(metal: str):
    path = os.path.join(MODELS_DIR, f"{metal}_xgb.pkl")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model not found for {metal}. Run train.py first.")
    with open(path, "rb") as f:
        return pickle.load(f)

def get_recommendation(prediction: str, confidence: float) -> str:
    if prediction == "UP" and confidence > 75:
        return "BUY"
    elif 55 <= confidence <= 75:
        return "HOLD"
    else:
        return "WAIT"

def predict_metal(metal: str) -> dict:
    model = load_model(metal)

    df = load_data(metal, period="6mo")
    df = add_features(df)

    latest = df[FEATURE_COLS].iloc[-1:]
    current_price = float(df["Close"].squeeze().iloc[-1])

    proba = model.predict_proba(latest)[0]
    pred_class = int(model.predict(latest)[0])

    prediction  = "UP" if pred_class == 1 else "DOWN"
    confidence  = round(float(max(proba)) * 100, 1)

    # Estimate predicted price
    avg_daily_change = float(df["daily_return"].mean())
    direction_factor = 1 if pred_class == 1 else -1
    predicted_price  = round(current_price * (1 + direction_factor * abs(avg_daily_change)), 2)

    recommendation = get_recommendation(prediction, confidence)

    return {
        "metal":           metal.capitalize(),
        "prediction":      prediction,
        "confidence":      confidence,
        "current_price":   round(current_price, 2),
        "predicted_price": predicted_price,
        "recommendation":  recommendation,
    }

if __name__ == "__main__":
    for metal in ["copper", "gold", "silver"]:
        result = predict_metal(metal)
        print(result)