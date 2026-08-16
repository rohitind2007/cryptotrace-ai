import os
from sqlalchemy import create_engine, Column, String, Float, Integer, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

DATABASE_URL = os.getenv("DATABASE_URL")

Base = declarative_base()

class FlaggedTransaction(Base):
    __tablename__ = "flagged_transactions"

    tx_hash = Column(String(66), primary_key=True, index=True)
    block_number = Column(Integer)
    from_address = Column(String(42), index=True)
    to_address = Column(String(42))
    value_eth = Column(Float)
    risk_score = Column(Integer)
    severity = Column(String(20))
    threat_category = Column(String(100))
    is_suspicious = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

engine = None
SessionLocal = None

if DATABASE_URL:
    try:
        # Normalize postgres:// to postgresql:// for SQLAlchemy compatibility
        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Database initialization notice: {e}")

def save_transactions_to_db(tx_list):
    """Safely saves transactions into PostgreSQL if database is connected."""
    if not SessionLocal:
        return
    db = SessionLocal()
    try:
        for tx in tx_list:
            existing = db.query(FlaggedTransaction).filter(FlaggedTransaction.tx_hash == tx["tx_hash"]).first()
            if not existing:
                record = FlaggedTransaction(
                    tx_hash=tx["tx_hash"],
                    block_number=tx.get("block_number"),
                    from_address=tx.get("from"),
                    to_address=tx.get("to"),
                    value_eth=tx.get("value_eth", 0.0),
                    risk_score=tx.get("risk_score", 0),
                    severity=tx.get("severity", "LOW"),
                    threat_category=tx.get("ai_forensic_dossier", {}).get("threat_category", "Standard"),
                    is_suspicious=tx.get("is_suspicious", False)
                )
                db.add(record)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"DB insertion error: {e}")
    finally:
        db.close()