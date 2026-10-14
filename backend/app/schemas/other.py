from pydantic import BaseModel
from typing import Optional


class ShiftCreate(BaseModel):
    emp_id:       int
    branch_id:    Optional[int]   = None
    register_num: Optional[int]   = 1
    opening_cash: float


class ShiftUpdate(BaseModel):
    closing_cash: Optional[float] = None
    status:       Optional[str]   = None
    total_sales:  Optional[float] = None
    total_orders: Optional[int]   = None


class DiscountCreate(BaseModel):
    name:         str
    description:  Optional[str]   = None
    type:         str              = "percentage"
    value:        Optional[float]  = 0
    buy_x:        Optional[int]    = None
    get_y:        Optional[int]    = None
    applies_to:   Optional[str]    = "all"
    min_purchase: Optional[float]  = 0
    start_date:   Optional[str]    = None
    end_date:     Optional[str]    = None
    status:       Optional[str]    = "active"


class DiscountUpdate(BaseModel):
    name:         Optional[str]   = None
    description:  Optional[str]   = None
    type:         Optional[str]   = None
    value:        Optional[float] = None
    buy_x:        Optional[int]   = None
    get_y:        Optional[int]   = None
    applies_to:   Optional[str]   = None
    min_purchase: Optional[float] = None
    start_date:   Optional[str]   = None
    end_date:     Optional[str]   = None
    status:       Optional[str]   = None