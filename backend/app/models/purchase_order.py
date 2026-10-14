from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PurchaseOrder(Base):
    __tablename__ = "Purchase_Order"

    po_id         = Column(Integer,    primary_key=True, index=True)
    sup_id        = Column(Integer,    ForeignKey("Supplier.sup_id"),   nullable=False)
    branch_id     = Column(Integer,    ForeignKey("Branch.branch_id"),  nullable=True)
    emp_id        = Column(Integer,    ForeignKey("Employee.emp_id"),   nullable=True)
    total_cost    = Column(Float,      default=0)
    status        = Column(String(30), default="pending")
    notes         = Column(Text,       nullable=True)
    order_date    = Column(DateTime,   server_default=func.now())
    expected_date = Column(DateTime,   nullable=True)
    received_date = Column(DateTime,   nullable=True)

    supplier = relationship("Supplier", back_populates="purchase_orders")
    branch   = relationship("Branch",   back_populates="purchase_orders")
    items    = relationship("PurchaseOrderItem", back_populates="purchase_order",
                            cascade="all, delete-orphan")


class PurchaseOrderItem(Base):
    __tablename__ = "Purchase_Order_Item"

    po_item_id   = Column(Integer, primary_key=True, index=True)
    po_id        = Column(Integer, ForeignKey("Purchase_Order.po_id"), nullable=False)
    prod_id      = Column(Integer, ForeignKey("Product.prod_id"),      nullable=False)
    quantity     = Column(Integer, default=1)
    unit_cost    = Column(Float,   default=0)
    line_total   = Column(Float,   default=0)
    qty_received = Column(Integer, default=0)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product        = relationship("Product",       back_populates="po_items")