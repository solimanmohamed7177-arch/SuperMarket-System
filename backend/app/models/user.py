from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Employee(Base):
    __tablename__ = "Employee"

    emp_id      = Column(Integer,     primary_key=True, index=True)
    national_ID = Column(String(50),  nullable=True)
    first_n     = Column(String(100), nullable=False)
    last_n      = Column(String(100), nullable=False)
    email       = Column(String(150), unique=True, nullable=False, index=True)
    password    = Column(String(255), nullable=True)
    dep_id      = Column(Integer, ForeignKey("Department.dep_id"), nullable=True)
    role_id     = Column(Integer, ForeignKey("Role.role_id"),      nullable=True)
    salary      = Column(Float,   default=0)
    hire_date   = Column(Date,    nullable=True)
    is_active   = Column(Integer, default=1)

    department = relationship("Department", back_populates="employees")
    role       = relationship("Role",       back_populates="employees")
    sales      = relationship("Sale",       back_populates="employee")
    shifts     = relationship("Shift",      back_populates="employee")

    @property
    def full_name(self):
        return f"{self.first_n} {self.last_n}"