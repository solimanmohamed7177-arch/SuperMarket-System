from pydantic import BaseModel
from typing import Optional


class SupplierCreate(BaseModel):
    sup_n:     str
    contact_n: Optional[str] = None
    phone:     Optional[str] = None
    email:     Optional[str] = None
    address:   Optional[str] = None
    tax_id:    Optional[str] = None
    pay_terms: Optional[str] = "Net 30"
    notes:     Optional[str] = None
    is_active: Optional[int] = 1


class SupplierUpdate(BaseModel):
    sup_n:     Optional[str] = None
    contact_n: Optional[str] = None
    phone:     Optional[str] = None
    email:     Optional[str] = None
    address:   Optional[str] = None
    tax_id:    Optional[str] = None
    pay_terms: Optional[str] = None
    notes:     Optional[str] = None
    is_active: Optional[int] = None