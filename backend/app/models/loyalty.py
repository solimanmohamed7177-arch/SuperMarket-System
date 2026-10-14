from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class LoyaltyCard(Base):
    __tablename__ = "Loyalty_Card"

    card_id        = Column(Integer,    primary_key=True, index=True)
    cust_id        = Column(Integer,    ForeignKey("Customer.cust_id"), nullable=False)
    card_num       = Column(String(50), unique=True, nullable=False)
    points_balance = Column(Integer,    default=0)
    total_earned   = Column(Integer,    default=0)
    total_redeemed = Column(Integer,    default=0)
    tier           = Column(String(20), default="Basic")
    issued_date    = Column(DateTime,   server_default=func.now())
    status         = Column(String(20), default="active")

    customer     = relationship("Customer",           back_populates="loyalty_cards")
    transactions = relationship("LoyaltyTransaction", back_populates="card")


class LoyaltyTransaction(Base):
    __tablename__ = "Loyalty_Transaction"

    trans_id   = Column(Integer,    primary_key=True, index=True)
    card_id    = Column(Integer,    ForeignKey("Loyalty_Card.card_id"), nullable=False)
    sale_id    = Column(Integer,    nullable=True)
    trans_type = Column(String(20), nullable=False)
    points     = Column(Integer,    default=0)
    notes      = Column(Text,       nullable=True)
    trans_date = Column(DateTime,   server_default=func.now())

    card = relationship("LoyaltyCard", back_populates="transactions")