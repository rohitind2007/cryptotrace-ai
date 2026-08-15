import os
import tempfile
import joblib
from sklearn.ensemble import IsolationForest

# Use /tmp on serverless environments (or fallback locally)
MODEL_DIR = "/tmp" if os.path.exists("/tmp") else "."
MODEL_FILE = os.path.join(MODEL_DIR, "eth_isolation_forest.joblib")


class AnomalyDetectionModel:
    def __init__(self):
        self.model = None
        self._init_model()

    def _init_model(self):
        # Check if pre-trained model exists in read-only package dir or /tmp
        local_model_path = os.path.join(os.path.dirname(__file__), "eth_isolation_forest.joblib")

        if os.path.exists(local_model_path):
            try:
                self.model = joblib.load(local_model_path)
                return
            except Exception:
                pass

        if os.path.exists(MODEL_FILE):
            try:
                self.model = joblib.load(MODEL_FILE)
                return
            except Exception:
                pass

        # Train standard Isolation Forest
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.05,
            random_state=42
        )

        # Train on dummy synthetic data so it's ready
        import numpy as np
        synthetic_data = np.random.rand(100, 4)
        self.model.fit(synthetic_data)

        # Try to save to /tmp safely without crashing if read-only
        try:
            joblib.dump(self.model, MODEL_FILE)
        except OSError:
            pass  # Keep in-memory if disk write is forbidden


ml_model = AnomalyDetectionModel()