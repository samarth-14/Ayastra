import os
import pickle
import pandas as pd
from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from data_loader import load_data
from features import add_features, FEATURE_COLS

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_metal(metal: str):
    print(f"Training {metal}...")
    df = load_data(metal)
    df = add_features(df)

    X = df[FEATURE_COLS].replace([float("inf"), float("-inf")], float("nan")).dropna()
    y = df["target"].loc[X.index]

    split = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split], X.iloc[split:]
    y_train, y_test = y.iloc[:split], y.iloc[split:]

    # XGBoost
    xgb = XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.05,
                        use_label_encoder=False, eval_metric="logloss", random_state=42)
    xgb.fit(X_train, y_train)
    xgb_preds = xgb.predict(X_test)

    # Logistic Regression baseline
    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_train, y_train)

    metrics = {
        "metal":     metal,
        "accuracy":  round(accuracy_score(y_test, xgb_preds), 4),
        "precision": round(precision_score(y_test, xgb_preds, zero_division=0), 4),
        "recall":    round(recall_score(y_test, xgb_preds, zero_division=0), 4),
        "f1":        round(f1_score(y_test, xgb_preds, zero_division=0), 4),
    }

    # Save models
    with open(os.path.join(MODELS_DIR, f"{metal}_xgb.pkl"), "wb") as f:
        pickle.dump(xgb, f)
    with open(os.path.join(MODELS_DIR, f"{metal}_lr.pkl"), "wb") as f:
        pickle.dump(lr, f)
    with open(os.path.join(MODELS_DIR, f"{metal}_metrics.pkl"), "wb") as f:
        pickle.dump(metrics, f)

    print(f"  Accuracy: {metrics['accuracy']} | F1: {metrics['f1']}")
    return metrics

if __name__ == "__main__":
    for metal in ["copper", "gold", "silver"]:
        train_metal(metal)
    print("All models trained.")