from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Sale(Base):
    __tablename__ = "Sale"

    sale_id        = Column(Integer,    primary_key=True, index=True)
    emp_id         = Column(Integer,    ForeignKey("Employee.emp_id"),  nullable=True)
    cust_id        = Column(Integer,    ForeignKey("Customer.cust_id"), nullable=True)
    branch_id      = Column(Integer,    ForeignKey("Branch.branch_id"), nullable=True)
    shift_id       = Column(Integer,    ForeignKey("Shift.shift_id"),   nullable=True)
    subtotal       = Column(Float,      default=0)
    discount_amt   = Column(Float,      default=0)
    tax_amt        = Column(Float,      default=0)
    grand_total    = Column(Float,      default=0)
    payment_method = Column(String(50), default="cash")
    points_used    = Column(Integer,    default=0)
    status         = Column(String(20), default="completed")
    notes          = Column(Text,       nullable=True)
    sale_date      = Column(DateTime,   server_default=func.now())

    employee = relationship("Employee", back_populates="sales")
    customer = relationship("Customer", back_populates="sales")
    branch   = relationship("Branch",   back_populates="sales")
    shift    = relationship("Shift",    back_populates="sales")
    items    = relationship("SaleItem", back_populates="sale",
                            cascade="all, delete-orphan")
    returns  = relationship("SaleReturn", back_populates="sale")


class SaleItem(Base):
    __tablename__ = "Sale_Item"

    item_id    = Column(Integer, primary_key=True, index=True)
    sale_id    = Column(Integer, ForeignKey("Sale.sale_id"),    nullable=False)
    prod_id    = Column(Integer, ForeignKey("Product.prod_id"), nullable=False)
    quantity   = Column(Integer, default=1)
    unit_price = Column(Float,   default=0)
    discount   = Column(Float,   default=0)
    line_total = Column(Float,   default=0)

    sale    = relationship("Sale",    back_populates="items")
    product = relationship("Product", back_populates="sale_items")
    