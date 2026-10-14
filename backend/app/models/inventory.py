from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Inventory(Base):
    __tablename__ = "Inventory"

    inv_id       = Column(Integer, primary_key=True, index=True)
    prod_id      = Column(Integer, ForeignKey("Product.prod_id"),  nullable=False)
    branch_id    = Column(Integer, ForeignKey("Branch.branch_id"), nullable=True)
    quantity     = Column(Integer, default=0)
    min_stock    = Column(Integer, default=10)
    max_stock    = Column(Integer, default=1000)
    last_updated = Column(DateTime, server_default=func.now())

    product = relationship("Product", back_populates="inventory")
    branch  = relationship("Branch",  back_populates="inventory")


class InventoryMovement(Base):
    __tablename__ = "Inventory_Movement"

    move_id       = Column(Integer,    primary_key=True, index=True)
    prod_id       = Column(Integer,    ForeignKey("Product.prod_id"),  nullable=False)
    branch_id     = Column(Integer,    ForeignKey("Branch.branch_id"), nullable=True)
    movement_type = Column(String(50), nullable=False)
    quantity      = Column(Integer,    nullable=False)
    reference_id  = Column(Integer,    nullable=True)
    notes         = Column(Text,       nullable=True)
    move_date     = Column(DateTime,   server_default=func.now())