from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class Department(Base):
    __tablename__ = "Department"

    dep_id = Column(Integer,     primary_key=True, index=True)
    dep_n  = Column(String(100), nullable=False)

    employees = relationship("Employee", back_populates="department")