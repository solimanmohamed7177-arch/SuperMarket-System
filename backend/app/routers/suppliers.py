from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database import get_db
from app.models.supplier import Supplier
from app.models.purchase_order import PurchaseOrder
from app.schemas.supplier import SupplierCreate, SupplierUpdate
from app.core.dependencies import get_current_user
from app.utils.helpers import paginate

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("")
def get_all(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[int] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Supplier)
    if search:
        q = q.filter(
            Supplier.sup_n.ilike(f"%{search}%") |
            Supplier.contact_n.ilike(f"%{search}%")
        )
    if is_active is not None: q = q.filter(Supplier.is_active == is_active)
    result = paginate(q, page, size)
    items = []
    for s in result["items"]:
        total_orders = db.query(func.count(PurchaseOrder.po_id)).filter(PurchaseOrder.sup_id == s.sup_id).scalar() or 0
        total_spend  = db.query(func.sum(PurchaseOrder.total_cost)).filter(
            PurchaseOrder.sup_id == s.sup_id, PurchaseOrder.status == "received"
        ).scalar() or 0
        items.append({
            "sup_id":       s.sup_id,
            "sup_n":        s.sup_n,
            "contact_n":    s.contact_n,
            "phone":        s.phone,
            "email":        s.email,
            "address":      s.address,
            "tax_id":       s.tax_id,
            "pay_terms":    s.pay_terms,
            "is_active":    s.is_active,
            "total_orders": total_orders,
            "total_spend":  round(total_spend, 2),
        })
    result["items"] = items
    return result


@router.get("/{sup_id}")
def get_one(sup_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    s = db.query(Supplier).filter(Supplier.sup_id == sup_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "sup_id":    s.sup_id,
        "sup_n":     s.sup_n,
        "contact_n": s.contact_n,
        "phone":     s.phone,
        "email":     s.email,
        "address":   s.address,
        "pay_terms": s.pay_terms,
        "is_active": s.is_active,
    }


@router.post("", status_code=201)
def create(payload: SupplierCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    s = Supplier(**payload.model_dump())
    db.add(s)
    db.commit()
    return {"message": "Created", "sup_id": s.sup_id}


@router.put("/{sup_id}")
def update(sup_id: int, payload: SupplierUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    s = db.query(Supplier).filter(Supplier.sup_id == sup_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(s, k, v)
    db.commit()
    return {"message": "Updated"}


@router.delete("/{sup_id}")
def delete(sup_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    s = db.query(Supplier).filter(Supplier.sup_id == sup_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    s.is_active = 0
    db.commit()
    return {"message": "Deactivated"}