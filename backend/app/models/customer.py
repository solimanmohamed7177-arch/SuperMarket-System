from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Customer(Base):
    __tablename__ = "Customer"

    cust_id    = Column(Integer,     primary_key=True, index=True)
    first_n    = Column(String(100), nullable=False)
    last_n     = Column(String(100), nullable=False)
    email      = Column(String(150), unique=True, nullable=True)
    phone      = Column(String(30),  nullable=True)
    address    = Column(Text,        nullable=True)
    dob        = Column(Date,        nullable=True)
    gender     = Column(String(10),  nullable=True)
    is_active  = Column(Integer,     default=1)
    created_at = Column(DateTime,    server_default=func.now())

    sales         = relationship("Sale",        back_populates="customer")
    loyalty_cards = relationship("LoyaltyCard", back_populates="customer")

    @property
    def full_name(self):
        return f"{self.first_n} {self.last_n}"