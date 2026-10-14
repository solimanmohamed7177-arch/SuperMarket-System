from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class Role(Base):
    __tablename__ = "Role"

    role_id = Column(Integer,     primary_key=True, index=True)
    r_name  = Column(String(100), nullable=False)

    employees = relationship("Employee", back_populates="role")