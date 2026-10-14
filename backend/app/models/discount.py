from sqlalchemy import Column, Integer, String, Float, Text
from app.database import Base


class Discount(Base):
    __tablename__ = "Discount"

    disc_id      = Column(Integer,    primary_key=True, index=True)
    name         = Column(String(200), nullable=False)
    description  = Column(Text,        nullable=True)
    type         = Column(String(30),  default="percentage")
    value        = Column(Float,       default=0)
    buy_x        = Column(Integer,     nullable=True)
    get_y        = Column(Integer,     nullable=True)
    applies_to   = Column(String(50),  default="all")
    min_purchase = Column(Float,       default=0)
    start_date   = Column(String(20),  nullable=True)
    end_date     = Column(String(20),  nullable=True)
    status       = Column(String(20),  default="active")