"""
Run this locally to re-save models for deployment.
Run exactly these commands:

  pip install numpy==1.26.4 scikit-learn==1.6.1
  python resave_models.py
  pip install numpy==1.24.3 scikit-learn==1.3.2
"""
import pickle
import os
import numpy as np

print(f"numpy version: {np.__version__}")

HERE = os.path.dirname(os.path.abspath(__file__))

models = [
    "Crop_recommendation_model.pkl",
    "price_model.pkl",
    "label_encoder.pkl",
]

for name in models:
    path = os.path.join(HERE, name)
    out  = os.path.join(HERE, name.replace(".pkl", "_compat.pkl"))
    if os.path.exists(path):
        with open(path, "rb") as f:
            model = pickle.load(f)
        # Save with protocol 2 — maximum compatibility
        with open(out, "wb") as f:
            pickle.dump(model, f, protocol=2)
        size = os.path.getsize(out) // 1024
        print(f"✅ Saved: {name.replace('.pkl','_compat.pkl')} ({size} KB)")
    else:
        print(f"❌ Not found: {name}")

print("\nDone! Upload the _compat.pkl files to Google Drive.")