export interface AIForensicDossier {
  threat_category: string;
  investigator_summary: string;
  recommended_action: string;
  confidence_percentage: number;
}

export interface MLAnomalyMetrics {
  is_anomaly: boolean;
  ml_anomaly_score: number;
  decision_confidence: number;
}

export interface TransactionPayload {
  tx_hash: string;
  block_number: number;
  from: string;
  to: string | null;
  value_eth: number;
  gas_price_gwei: number;
  gas_limit: number;
  nonce: number;
  risk_score: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  is_suspicious: boolean;
  rules_triggered: string[];
  ml_anomaly_metrics: MLAnomalyMetrics;
  ai_forensic_dossier: AIForensicDossier | null;
}
