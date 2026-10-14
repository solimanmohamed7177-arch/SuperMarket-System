from pydantic import BaseModel
from typing import Optional
from datetime import date


class LoginRequest(BaseModel):
    email:    str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         dict


class EmployeeCreate(BaseModel):
    first_n:     str
    last_n:      str
    national_ID: Optional[str]   = None
    email:       str
    password:    Optional[str]   = None
    dep_id:      Optional[int]   = None
    role_id:     Optional[int]   = None
    salary:      Optional[float] = 0
    hire_date:   Optional[date]  = None
    is_active:   Optional[int]   = 1


class EmployeeUpdate(BaseModel):
    first_n:     Optional[str]   = None
    last_n:      Optional[str]   = None
    national_ID: Optional[str]   = None
    email:       Optional[str]   = None
    password:    Optional[str]   = None
    dep_id:      Optional[int]   = None
    role_id:     Optional[int]   = None
    salary:      Optional[float] = None
    hire_date:   Optional[date]  = None
    is_active:   Optional[int]   = None