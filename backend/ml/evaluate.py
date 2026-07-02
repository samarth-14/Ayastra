import os
import pickle

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

def get_metrics(metal: str) -> dict:
    path = os.path.join(MODELS_DIR, f"{metal}_metrics.pkl")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Metrics not found for {metal}. Run train.py first.")
    with open(path, "rb") as f:
        return pickle.load(f)

def get_all_metrics() -> list:
    metals = ["copper", "gold", "silver"]
    results = []
    for metal in metals:
        try:
            results.append(get_metrics(metal))
        except FileNotFoundError:
            results.append({"metal": metal, "error": "Model not trained yet"})
    return results

def get_overall_accuracy() -> float:
    metrics = get_all_metrics()
    accuracies = [m["accuracy"] for m in metrics if "accuracy" in m]
    if not accuracies:
        return 0.0
    return round(sum(accuracies) / len(accuracies), 4)