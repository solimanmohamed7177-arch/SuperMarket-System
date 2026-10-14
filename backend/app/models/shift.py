from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Shift(Base):
    __tablename__ = "Shift"

    shift_id     = Column(Integer,    primary_key=True, index=True)
    emp_id       = Column(Integer,    ForeignKey("Employee.emp_id"),  nullable=False)
    branch_id    = Column(Integer,    ForeignKey("Branch.branch_id"), nullable=True)
    register_num = Column(Integer,    default=1)
    opening_cash = Column(Float,      default=0)
    closing_cash = Column(Float,      nullable=True)
    total_sales  = Column(Float,      default=0)
    total_orders = Column(Integer,    default=0)
    status       = Column(String(20), default="open")
    start_time   = Column(DateTime,   server_default=func.now())
    end_time     = Column(DateTime,   nullable=True)

    employee = relationship("Employee", back_populates="shifts")
    branch   = relationship("Branch",   back_populates="shifts")
    sales    = relationship("Sale",     back_populates="shift")