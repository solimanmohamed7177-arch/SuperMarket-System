from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Category(Base):
    __tablename__ = "Category"

    cat_id      = Column(Integer,     primary_key=True, index=True)
    cat_name    = Column(String(100), nullable=False, unique=True)
    description = Column(Text,        nullable=True)
    icon        = Column(String(50),  default="fa-tag")
    color       = Column(String(20),  default="#2563eb")
    created_at  = Column(String(20),  nullable=True)

    products = relationship("Product", back_populates="category")