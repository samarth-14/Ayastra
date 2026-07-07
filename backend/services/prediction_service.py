import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'ml'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
from datetime import datetime, date
from sqlalchemy.orm import Session
from predict import predict_metal
from evaluate import get_all_metrics, get_overall_accuracy
from models import MetalPrediction
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(os.path.dirname(__file__), '..', 'ayastra.db')}")
# Fix Render/Heroku postgres:// prefix
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
def _already_logged_today(db: Session, metal: str) -> bool:
    today = date.today()
    existing = db.query(MetalPrediction).filter(
        MetalPrediction.metal == metal.capitalize(),
        MetalPrediction.created_at >= datetime(today.year, today.month, today.day)
    ).first()
    return existing is not None

def _log_prediction(db: Session, result: dict):
    record = MetalPrediction(
        metal           = result["metal"],
        prediction      = result["prediction"],
        confidence      = result["confidence"],
        current_price   = result["current_price"],
        predicted_price = result["predicted_price"],
        recommendation  = result["recommendation"],
    )
    db.add(record)
    db.commit()

def get_prediction(metal: str) -> dict:
    # Try live prediction first
    try:
        result = predict_metal(metal)
        db = SessionLocal()
        try:
            if not _already_logged_today(db, metal):
                _log_prediction(db, result)
        finally:
            db.close()
        return result
    except Exception as live_error:
        # Fall back to most recent cached prediction from DB
        db = SessionLocal()
        try:
            record = db.query(MetalPrediction)\
                .filter(MetalPrediction.metal == metal.capitalize())\
                .order_by(MetalPrediction.created_at.desc())\
                .first()
            if record:
                return {
                    "metal":           record.metal,
                    "prediction":      record.prediction,
                    "confidence":      record.confidence,
                    "current_price":   record.current_price,
                    "predicted_price": record.predicted_price,
                    "recommendation":  record.recommendation,
                    "cached":          True,
                    "cached_at":       record.created_at.isoformat(),
                }
            raise ValueError(f"No cached prediction available for {metal}: {live_error}")
        finally:
            db.close()

def get_all_predictions() -> list:
    metals = ["copper", "gold", "silver"]
    results = []
    for metal in metals:
        try:
            results.append(get_prediction(metal))
        except Exception as e:
            results.append({"metal": metal.capitalize(), "error": str(e)})
    return results

def get_accuracy_report() -> dict:
    return {
        "overall_accuracy": get_overall_accuracy(),
        "by_metal": get_all_metrics()
    }

def get_prediction_history(limit: int = 30) -> list:
    db = SessionLocal()
    try:
        records = db.query(MetalPrediction)\
            .order_by(MetalPrediction.created_at.desc())\
            .limit(limit).all()
        return [
            {
                "id":              r.id,
                "metal":           r.metal,
                "prediction":      r.prediction,
                "confidence":      r.confidence,
                "current_price":   r.current_price,
                "predicted_price": r.predicted_price,
                "actual_price":    r.actual_price,
                "correct":         r.correct,
                "recommendation":  r.recommendation,
                "created_at":      r.created_at.isoformat(),
            }
            for r in records
        ]
    finally:
        db.close()