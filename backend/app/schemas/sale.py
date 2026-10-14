from pydantic import BaseModel
from typing import Optional, List


class SaleItemCreate(BaseModel):
    prod_id:    int
    quantity:   int
    unit_price: float
    discount:   Optional[float] = 0
    line_total: float


class SaleCreate(BaseModel):
    emp_id:         Optional[int]   = None
    cust_id:        Optional[int]   = None
    branch_id:      Optional[int]   = None
    shift_id:       Optional[int]   = None
    subtotal:       float
    discount_amt:   Optional[float] = 0
    tax_amt:        Optional[float] = 0
    grand_total:    float
    payment_method: Optional[str]   = "cash"
    points_used:    Optional[int]   = 0
    notes:          Optional[str]   = None
    items:          List[SaleItemCreate]


class SaleReturnItemCreate(BaseModel):
    sale_item_id:  Optional[int] = None
    prod_id:       Optional[int] = None
    qty_return:    int
    refund_amount: float


class SaleReturnCreate(BaseModel):
    sale_id:      int
    emp_id:       Optional[int] = None
    total_refund: float
    reason:       Optional[str] = None
    items:        List[SaleReturnItemCreate]