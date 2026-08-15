from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List
from app.core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY else None


class ForensicAnalysisResult(BaseModel):
    threat_category: str = Field(
        description="e.g., Peel-Chain Layering, Mixer Interaction, Flash Loan Exploit, Phishing Drain")
    investigator_summary: str = Field(
        description="2-3 sentence forensic finding tailored for law enforcement or compliance officers.")
    recommended_action: str = Field(
        description="Immediate investigative step, e.g., Issue CEX freeze request, monitor hop-3 destination")
    confidence_percentage: int = Field(description="Model confidence between 0 and 100")


async def generate_ai_investigation_dossier(tx_data: dict, triggered_rules: List[str],
                                            ml_score: int) -> ForensicAnalysisResult:
    """Invokes Google AI Studio (Gemini) to generate structured forensic intelligence."""
    if not client:
        return ForensicAnalysisResult(
            threat_category="Suspicious Activity",
            investigator_summary=f"Automated alert triggered by rules: {', '.join(triggered_rules)} with ML risk score {ml_score}.",
            recommended_action="Conduct manual wallet history review.",
            confidence_percentage=75
        )

    prompt = f"""
    Act as a senior Web3 Cybercrime Forensic Investigator and AML Compliance Analyst.
    Analyze the following suspicious Ethereum transaction data:

    - Transaction Hash: {tx_data.get('tx_hash')}
    - Sender: {tx_data.get('from')}
    - Receiver: {tx_data.get('to')}
    - Value: {tx_data.get('value_eth')} ETH
    - Gas Price: {tx_data.get('gas_price_gwei')} Gwei
    - Triggered Heuristics: {triggered_rules}
    - Machine Learning Anomaly Score: {ml_score}/100

    Provide an accurate forensic threat categorization, a concise investigator summary, and the recommended AML compliance action.
    """

    try:
        response = await client.aio.models.generate_content(
            model="gemini-3.7-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ForensicAnalysisResult,
                temperature=0.1
            )
        )
        return ForensicAnalysisResult.model_validate_json(response.text)
    except Exception as e:
        print(f"Gemini API Exception: {e}")
        return ForensicAnalysisResult(
            threat_category="Unclassified Heuristic Alert",
            investigator_summary=f"Rules triggered: {', '.join(triggered_rules)}. ML Anomaly score: {ml_score}",
            recommended_action="Inspect wallet on Etherscan and trace outbound hops.",
            confidence_percentage=70
        )