import pandas as pd
import numpy as np

def add_features(df: pd.DataFrame) -> pd.DataFrame:
    # Strip whitespace from column names (yfinance MultiIndex quirk)
    df.columns = [str(c).strip() for c in df.columns]
    close = df["Close"].squeeze()
    volume = df["Volume"].squeeze()
    # Trend
    df["sma_5"]  = close.rolling(5).mean()
    df["sma_10"] = close.rolling(10).mean()
    df["sma_20"] = close.rolling(20).mean()
    df["sma_50"] = close.rolling(50).mean()

    # EMA
    df["ema_20"] = close.ewm(span=20, adjust=False).mean()
    df["ema_50"] = close.ewm(span=50, adjust=False).mean()

    # RSI 14
    delta = close.diff()
    gain  = delta.clip(lower=0).rolling(14).mean()
    loss  = (-delta.clip(upper=0)).rolling(14).mean()
    rs    = gain / (loss + 1e-9)
    df["rsi_14"] = 100 - (100 / (1 + rs))

    # Volatility
    df["volatility_20"] = close.pct_change().rolling(20).std()

    # Returns
    df["daily_return"]   = close.pct_change()
    df["price_change_pct"] = close.pct_change() * 100
    df["volume_change_pct"] = volume.pct_change() * 100

    # Momentum score
    df["momentum"] = close - close.shift(5)

    # Target: 1 if tomorrow close > today close
    df["target"] = (close.shift(-1) > close).astype(int)

    df.dropna(inplace=True)
    return df

FEATURE_COLS = [
    "sma_5", "sma_10", "sma_20", "sma_50",
    "ema_20", "ema_50", "rsi_14",
    "volatility_20", "daily_return",
    "price_change_pct", "volume_change_pct", "momentum"
]