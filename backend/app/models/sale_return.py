from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class SaleReturn(Base):
    __tablename__ = "Sale_Return"

    return_id    = Column(Integer,  primary_key=True, index=True)
    sale_id      = Column(Integer,  ForeignKey("Sale.sale_id"),    nullable=False)
    emp_id       = Column(Integer,  ForeignKey("Employee.emp_id"), nullable=True)
    total_refund = Column(Float,    default=0)
    reason       = Column(Text,     nullable=True)
    return_date  = Column(DateTime, server_default=func.now())

    sale  = relationship("Sale",           back_populates="returns")
    items = relationship("SaleReturnItem", back_populates="sale_return",
                         cascade="all, delete-orphan")


class SaleReturnItem(Base):
    __tablename__ = "Sale_Return_Item"

    ret_item_id   = Column(Integer, primary_key=True, index=True)
    return_id     = Column(Integer, ForeignKey("Sale_Return.return_id"), nullable=False)
    sale_item_id  = Column(Integer, ForeignKey("Sale_Item.item_id"),     nullable=True)
    prod_id       = Column(Integer, ForeignKey("Product.prod_id"),       nullable=True)
    qty_return    = Column(Integer, default=1)
    refund_amount = Column(Float,   default=0)

    sale_return = relationship("SaleReturn", back_populates="items")