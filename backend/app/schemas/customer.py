from pydantic import BaseModel
from typing import Optional
from datetime import date


class CustomerCreate(BaseModel):
    first_n:   str
    last_n:    str
    email:     Optional[str]  = None
    phone:     Optional[str]  = None
    address:   Optional[str]  = None
    dob:       Optional[date] = None
    gender:    Optional[str]  = None
    is_active: Optional[int]  = 1


class CustomerUpdate(BaseModel):
    first_n:   Optional[str]  = None
    last_n:    Optional[str]  = None
    email:     Optional[str]  = None
    phone:     Optional[str]  = None
    address:   Optional[str]  = None
    dob:       Optional[date] = None
    gender:    Optional[str]  = None
    is_active: Optional[int]  = None


class LoyaltyCardCreate(BaseModel):
    cust_id:        int
    card_num:       str
    points_balance: Optional[int] = 0


class LoyaltyCardUpdate(BaseModel):
    points_balance: Optional[int] = None
    status:         Optional[str] = None
    tier:           Optional[str] = None