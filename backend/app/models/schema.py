from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Numeric, Boolean, Integer, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Wallet(Base):
    __tablename__ = "wallets"

    address = Column(String(42), primary_key=True, index=True)
    risk_score = Column(Integer, default=0)
    is_sanctioned = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"

    tx_hash = Column(String(66), primary_key=True, index=True)
    block_number = Column(BigInteger, nullable=False, index=True)
    from_address = Column(String(42), ForeignKey("wallets.address"), index=True)
    to_address = Column(String(42), ForeignKey("wallets.address"), nullable=True, index=True)
    value_eth = Column(Numeric(36, 18), nullable=False)
    gas_price_gwei = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tx_hash = Column(String(66), ForeignKey("transactions.tx_hash"))
    target_wallet = Column(String(42), ForeignKey("wallets.address"))
    severity = Column(String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Integer, nullable=False)
    rules_triggered = Column(Text)
    ai_forensic_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)