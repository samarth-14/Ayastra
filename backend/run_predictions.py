import sys
sys.path.insert(0, '.')
sys.path.insert(0, 'ml')
from services.prediction_service import get_all_predictions
results = get_all_predictions()
for r in results:
    print(r)