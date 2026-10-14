from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Branch(Base):
    __tablename__ = "Branch"

    branch_id   = Column(Integer, primary_key=True, index=True)
    branch_name = Column(String(150), nullable=False)
    address     = Column(Text,        nullable=True)
    phone       = Column(String(30),  nullable=True)
    is_active   = Column(Integer,     default=1)

    sales           = relationship("Sale",          back_populates="branch")
    inventory       = relationship("Inventory",     back_populates="branch")
    purchase_orders = relationship("PurchaseOrder", back_populates="branch")
    shifts          = relationship("Shift",         back_populates="branch")