from pydantic import BaseModel
from typing import Optional, List


class InventoryUpdate(BaseModel):
    quantity:  Optional[int] = None
    min_stock: Optional[int] = None
    max_stock: Optional[int] = None


class POItemCreate(BaseModel):
    prod_id:    int
    quantity:   int
    unit_cost:  float
    line_total: float


class POCreate(BaseModel):
    sup_id:        int
    branch_id:     Optional[int] = None
    emp_id:        Optional[int] = None
    total_cost:    float
    notes:         Optional[str] = None
    expected_date: Optional[str] = None
    items:         List[POItemCreate]


class POUpdate(BaseModel):
    status:        Optional[str]   = None
    notes:         Optional[str]   = None
    total_cost:    Optional[float] = None
    received_date: Optional[str]   = None