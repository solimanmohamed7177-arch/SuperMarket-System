from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.shift import Shift
from app.models.user import Employee
from app.schemas.other import ShiftCreate, ShiftUpdate
from app.core.dependencies import get_current_user
from app.utils.helpers import paginate

router = APIRouter(prefix="/shifts", tags=["Shifts"])


@router.get("")
def get_all(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Shift)
    if status: q = q.filter(Shift.status == status)
    q = q.order_by(Shift.start_time.desc())
    result = paginate(q, page, size)
    result["items"] = [
        {
            "shift_id":      s.shift_id,
            "employee_name": s.employee.full_name if s.employee else None,
            "branch_name":   s.branch.branch_name if s.branch   else None,
            "register_num":  s.register_num,
            "opening_cash":  s.opening_cash,
            "closing_cash":  s.closing_cash,
            "total_sales":   s.total_sales,
            "total_orders":  s.total_orders,
            "status":        s.status,
            "start_time":    str(s.start_time) if s.start_time else None,
            "end_time":      str(s.end_time)   if s.end_time   else None,
        }
        for s in result["items"]
    ]
    return result


@router.post("", status_code=201)
def start(payload: ShiftCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    emp = db.query(Employee).filter(Employee.emp_id == payload.emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    open_shift = db.query(Shift).filter(
        Shift.emp_id == payload.emp_id, Shift.status == "open"
    ).first()
    if open_shift:
        raise HTTPException(status_code=400, detail="Employee already has open shift")
    s = Shift(
        emp_id=payload.emp_id, branch_id=payload.branch_id,
        register_num=payload.register_num, opening_cash=payload.opening_cash,
        status="open", start_time=datetime.now(),
    )
    db.add(s)
    db.commit()
    return {"message": "Shift started", "shift_id": s.shift_id}


@router.put("/{shift_id}")
def update(shift_id: int, payload: ShiftUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    s = db.query(Shift).filter(Shift.shift_id == shift_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    if payload.closing_cash is not None:
        s.closing_cash = payload.closing_cash
        s.end_time     = datetime.now()
    if payload.status       is not None: s.status       = payload.status
    if payload.total_sales  is not None: s.total_sales  = payload.total_sales
    if payload.total_orders is not None: s.total_orders = payload.total_orders
    db.commit()
    return {"message": "Updated"}