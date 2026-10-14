from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Product(Base):
    __tablename__ = "Product"

    prod_id     = Column(Integer,     primary_key=True, index=True)
    prod_name   = Column(String(200), nullable=False)
    sku         = Column(String(100), unique=True, nullable=True, index=True)
    barcode     = Column(String(100), unique=True, nullable=True, index=True)
    cat_id      = Column(Integer, ForeignKey("Category.cat_id"), nullable=True)
    description = Column(Text,    nullable=True)
    unit_price  = Column(Float,   default=0)
    cost_price  = Column(Float,   default=0)
    tax_rate    = Column(Float,   default=0)
    is_active   = Column(Integer, default=1)

    category   = relationship("Category",         back_populates="products")
    inventory  = relationship("Inventory",        back_populates="product")
    sale_items = relationship("SaleItem",         back_populates="product")
    po_items   = relationship("PurchaseOrderItem", back_populates="product")