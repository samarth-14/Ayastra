import yfinance as yf
import pandas as pd

TICKERS = {
    "copper": "HG=F",
    "gold":   "GC=F",
    "silver": "SI=F",
}

def load_data(metal: str, period: str = "5y") -> pd.DataFrame:
    ticker = TICKERS.get(metal.lower())
    if not ticker:
        raise ValueError(f"Unknown metal: {metal}")
    df = yf.download(ticker, period=period, auto_adjust=True, progress=False)
    df.dropna(inplace=True)
    return df