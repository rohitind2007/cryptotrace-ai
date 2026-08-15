from decimal import Decimal
from typing import Dict, Any, List
from app.engine.anomaly_model import ml_model
from app.engine.ai_agent import generate_ai_investigation_dossier

SANCTIONED_ENTITIES = {
    "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b".lower(): "Tornado Cash: Router",
    "0x722122df12d45b4003a09612089a4666fdaf1bf7".lower(): "Tornado Cash: 0.1 ETH",
    "0x8589427373d6d84e98730d7795d8f6f8731fda16".lower(): "Tornado Cash: 0.1 ETH v2",
    "0x0836222f2b2b24a3f36f98668ed8f0b38d1a872f".lower(): "Lazarus Group Associated Pool",
}

class FullFledgedFraudEngine:
    @staticmethod
    async def analyze_transaction(tx: Dict[str, Any], sender_history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        rules_triggered = []
        rule_score = 0

        from_addr = (tx.get("from") or "").lower()
        to_addr = (tx.get("to") or "").lower()
        value_eth = float(tx.get("value_eth", 0.0))
        gas_gwei = float(tx.get("gas_price_gwei", 20.0))
        gas_limit = float(tx.get("gas_limit", 21000))
        nonce = float(tx.get("nonce", 0))

        # 1. Deterministic Sanctions & Mixer Check
        if to_addr in SANCTIONED_ENTITIES:
            rule_score += 90
            rules_triggered.append(f"INTERACTION_WITH_{SANCTIONED_ENTITIES[to_addr].upper()}")
        if from_addr in SANCTIONED_ENTITIES:
            rule_score += 95
            rules_triggered.append(f"FUNDS_ORIGINATING_FROM_{SANCTIONED_ENTITIES[from_addr].upper()}")

        # 2. Large Volume Outlier
        if value_eth >= 25.0:
            rule_score += 35
            rules_triggered.append("HIGH_VALUE_ETH_TRANSFER")

        # 3. High-Gas Priority Fee Exploits
        if gas_gwei > 100.0:
            rule_score += 25
            rules_triggered.append("AGGRESSIVE_PRIORITY_FEE_BURST")

        # 4. ML Anomaly Model Prediction
        ml_res = ml_model.evaluate(value_eth, gas_gwei, gas_limit, nonce)
        if ml_res["is_anomaly"]:
            rules_triggered.append("ML_STATISTICAL_ANOMALY_DETECTED")

        # Composite Risk Score Calculation
        total_risk = min(int((rule_score * 0.6) + (ml_res["ml_anomaly_score"] * 0.4)), 100)

        severity = "LOW"
        if total_risk >= 80:
            severity = "CRITICAL"
        elif total_risk >= 60:
            severity = "HIGH"
        elif total_risk >= 35:
            severity = "MEDIUM"

        is_suspicious = total_risk >= 35

        ai_dossier = None
        if is_suspicious:
            ai_dossier = await generate_ai_investigation_dossier(tx, rules_triggered, total_risk)

        return {
            "risk_score": total_risk,
            "severity": severity,
            "is_suspicious": is_suspicious,
            "rules_triggered": rules_triggered,
            "ml_anomaly_metrics": ml_res,
            "ai_forensic_dossier": ai_dossier.model_dump() if ai_dossier else None
        }