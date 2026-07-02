import sys
sys.path.insert(0, '.')
from models import Base, MetalPrediction
from sqlalchemy import create_engine

engine = create_engine("sqlite:///ayastra.db")
Base.metadata.create_all(engine)
print("metal_predictions table created")