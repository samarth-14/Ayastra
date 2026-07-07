"""
Standalone script for Render Cron Job.
Runs predictions and saves to Supabase.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ml'))

from dotenv import load_dotenv
load_dotenv()

from services.prediction_service import get_all_predictions
from update_actuals import update_actuals

print("Running daily predictions...")
results = get_all_predictions()
for r in results:
    print(r)

print("Updating actuals...")
update_actuals()

print("Done.")