import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi import APIRouter, HTTPException
from services.prediction_service import (
    get_prediction, get_all_predictions,
    get_accuracy_report, get_prediction_history
)

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.get("/copper")
def predict_copper():
    try:
        return get_prediction("copper")
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gold")
def predict_gold():
    try:
        return get_prediction("gold")
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/silver")
def predict_silver():
    try:
        return get_prediction("silver")
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all")
def predict_all():
    return get_all_predictions()

@router.get("/accuracy")
def accuracy_report():
    return get_accuracy_report()

@router.get("/history")
def prediction_history(limit: int = 30):
    return get_prediction_history(limit)