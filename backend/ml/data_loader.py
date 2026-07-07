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
    
    t = yf.Ticker(ticker)
    # Use session with browser-like headers to avoid server IP blocks
    import requests
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })
    t.session = session
    
    df = t.history(period=period, auto_adjust=True)
    df.dropna(inplace=True)
    
    if df.empty:
        raise ValueError(f"No data returned from Yahoo Finance for {metal}")
    
    return df