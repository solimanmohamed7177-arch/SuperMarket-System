from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database import get_db
from app.models.user import Employee
from app.models.role import Role
from app.models.department import Department
from app.models.sale import Sale
from app.schemas.user import EmployeeCreate, EmployeeUpdate
from app.core.dependencies import get_current_user
from app.core.security import hash_password
from app.utils.helpers import paginate

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("/roles")
def get_roles(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return [{"role_id": r.role_id, "r_name": r.r_name} for r in db.query(Role).all()]


@router.get("/departments")
def get_departments(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return [{"dep_id": d.dep_id, "dep_n": d.dep_n} for d in db.query(Department).all()]


@router.get("")
def get_all(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[int] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Employee)
    if search:
        q = q.filter(
            Employee.first_n.ilike(f"%{search}%") |
            Employee.last_n.ilike(f"%{search}%")  |
            Employee.email.ilike(f"%{search}%")
        )
    if is_active is not None: q = q.filter(Employee.is_active == is_active)
    result = paginate(q, page, size)
    result["items"] = [
        {
            "emp_id":      e.emp_id,
            "full_name":   e.full_name,
            "national_ID": e.national_ID,
            "email":       e.email,
            "dep_name":    e.department.dep_n if e.department else None,
            "role_name":   e.role.r_name      if e.role       else None,
            "salary":      e.salary,
            "hire_date":   str(e.hire_date)   if e.hire_date  else None,
            "is_active":   e.is_active,
        }
        for e in result["items"]
    ]
    return result


@router.get("/{emp_id}")
def get_one(emp_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    e = db.query(Employee).filter(Employee.emp_id == emp_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Not found")
    total_sales = db.query(func.sum(Sale.grand_total)).filter(
        Sale.emp_id == emp_id, Sale.status == "completed"
    ).scalar() or 0
    return {
        "emp_id":      e.emp_id,
        "full_name":   e.full_name,
        "national_ID": e.national_ID,
        "email":       e.email,
        "dep_name":    e.department.dep_n if e.department else None,
        "role_name":   e.role.r_name      if e.role       else None,
        "salary":      e.salary,
        "hire_date":   str(e.hire_date)   if e.hire_date  else None,
        "is_active":   e.is_active,
        "total_sales": round(total_sales, 2),
    }


@router.post("", status_code=201)
def create(payload: EmployeeCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    if db.query(Employee).filter(Employee.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    data = payload.model_dump()
    if data.get("password"):
        data["password"] = hash_password(data["password"])
    e = Employee(**data)
    db.add(e)
    db.commit()
    return {"message": "Created", "emp_id": e.emp_id}


@router.put("/{emp_id}")
def update(emp_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    e = db.query(Employee).filter(Employee.emp_id == emp_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Not found")
    data = payload.model_dump(exclude_none=True)
    if "password" in data and data["password"]:
        data["password"] = hash_password(data["password"])
    for k, v in data.items():
        setattr(e, k, v)
    db.commit()
    return {"message": "Updated"}


@router.delete("/{emp_id}")
def delete(emp_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    e = db.query(Employee).filter(Employee.emp_id == emp_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Not found")
    e.is_active = 0
    db.commit()
    return {"message": "Deactivated"}