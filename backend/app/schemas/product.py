from pydantic import BaseModel
from typing import Optional


class CategoryCreate(BaseModel):
    cat_name:    str
    description: Optional[str] = None
    icon:        Optional[str] = "fa-tag"
    color:       Optional[str] = "#2563eb"


class CategoryUpdate(BaseModel):
    cat_name:    Optional[str] = None
    description: Optional[str] = None
    icon:        Optional[str] = None
    color:       Optional[str] = None


class ProductCreate(BaseModel):
    prod_name:   str
    sku:         Optional[str]   = None
    barcode:     Optional[str]   = None
    cat_id:      Optional[int]   = None
    description: Optional[str]   = None
    unit_price:  float           = 0
    cost_price:  Optional[float] = 0
    tax_rate:    Optional[float] = 0
    is_active:   Optional[int]   = 1


class ProductUpdate(BaseModel):
    prod_name:   Optional[str]   = None
    sku:         Optional[str]   = None
    barcode:     Optional[str]   = None
    cat_id:      Optional[int]   = None
    description: Optional[str]   = None
    unit_price:  Optional[float] = None
    cost_price:  Optional[float] = None
    tax_rate:    Optional[float] = None
    is_active:   Optional[int]   = None