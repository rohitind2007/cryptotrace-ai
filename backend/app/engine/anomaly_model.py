import os
import joblib
import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_FILE = "eth_isolation_forest.joblib"


class AnomalyDetectionModel:
    def __init__(self):
        self.model = None
        self._init_model()

    def _init_model(self):
        if os.path.exists(MODEL_FILE):
            self.model = joblib.load(MODEL_FILE)
        else:
            # Train baseline on statistical distribution of Ethereum transactions
            np.random.seed(42)
            n_samples = 4000
            val_eth = np.random.lognormal(mean=-1.2, sigma=1.1, size=n_samples)
            gas_gwei = np.random.normal(loc=24.0, scale=9.0, size=n_samples)
            gas_limit = np.random.choice([21000, 55000, 100000, 250000], size=n_samples, p=[0.75, 0.15, 0.07, 0.03])
            nonce = np.random.exponential(scale=15.0, size=n_samples)

            X_train = np.column_stack([val_eth, gas_gwei, gas_limit, nonce])
            self.model = IsolationForest(n_estimators=120, contamination=0.03, random_state=42)
            self.model.fit(X_train)
            joblib.dump(self.model, MODEL_FILE)

    def evaluate(self, val_eth: float, gas_gwei: float, gas_limit: float, nonce: float) -> dict:
        features = np.array([[val_eth, gas_gwei, gas_limit, nonce]])
        raw_score = float(self.model.decision_function(features)[0])
        is_anomaly = bool(self.model.predict(features)[0] == -1)

        # Scale into 0 - 100 risk score
        scaled_risk = int(np.clip((0.18 - raw_score) * 160, 0, 100))
        return {
            "is_anomaly": is_anomaly,
            "ml_anomaly_score": scaled_risk,
            "decision_confidence": round(raw_score, 4)
        }


ml_model = AnomalyDetectionModel()