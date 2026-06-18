"""
Run this script daily (e.g. via Windows Task Scheduler or cron).
It fetches yesterday's actual closing price for each metal and
marks stored predictions as correct or incorrect.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ml'))

from datetime import datetime, date, timedelta
import yfinance as yf
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import MetalPrediction

DB_PATH = os.path.join(os.path.dirname(__file__), 'ayastra.db')
engine = create_engine(f"sqlite:///{DB_PATH}")
SessionLocal = sessionmaker(bind=engine)

TICKERS = {
    "Copper": "HG=F",
    "Gold":   "GC=F",
    "Silver": "SI=F",
}

def fetch_yesterday_price(ticker: str) -> float | None:
    yesterday = date.today() - timedelta(days=1)
    two_days_ago = yesterday - timedelta(days=3)  # buffer for weekends
    df = yf.download(ticker, start=two_days_ago.isoformat(),
                     end=date.today().isoformat(), auto_adjust=True, progress=False)
    if df.empty:
        return None
    return float(df["Close"].squeeze().iloc[-1])

def update_actuals():
    db = SessionLocal()
    try:
        today = date.today()
        yesterday_start = datetime(today.year, today.month, today.day) - timedelta(days=1)
        yesterday_end   = datetime(today.year, today.month, today.day)

        # Get all predictions made yesterday that haven't been updated yet
        records = db.query(MetalPrediction).filter(
            MetalPrediction.created_at >= yesterday_start,
            MetalPrediction.created_at < yesterday_end,
            MetalPrediction.actual_price == None
        ).all()

        if not records:
            print("No predictions to update for yesterday.")
            return

        for record in records:
            ticker = TICKERS.get(record.metal)
            if not ticker:
                continue
            actual = fetch_yesterday_price(ticker)
            if actual is None:
                print(f"Could not fetch actual price for {record.metal}")
                continue

            record.actual_price = actual
            # Correct if prediction direction matches actual movement
            went_up = actual > record.current_price
            record.correct = (record.prediction == "UP" and went_up) or \
                             (record.prediction == "DOWN" and not went_up)

            print(f"{record.metal}: predicted={record.prediction}, "
                  f"actual={'UP' if went_up else 'DOWN'}, "
                  f"correct={record.correct}, actual_price={actual}")

        db.commit()
        print("Actuals updated successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    update_actuals()