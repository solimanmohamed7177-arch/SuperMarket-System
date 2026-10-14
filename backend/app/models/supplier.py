from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Supplier(Base):
    __tablename__ = "Supplier"

    sup_id    = Column(Integer,     primary_key=True, index=True)
    sup_n     = Column(String(200), nullable=False)
    contact_n = Column(String(150), nullable=True)
    phone     = Column(String(30),  nullable=True)
    email     = Column(String(150), nullable=True)
    address   = Column(Text,        nullable=True)
    tax_id    = Column(String(50),  nullable=True)
    pay_terms = Column(String(50),  default="Net 30")
    notes     = Column(Text,        nullable=True)
    is_active = Column(Integer,     default=1)

    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")