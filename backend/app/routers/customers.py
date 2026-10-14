from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.customer import Customer
from app.models.loyalty import LoyaltyCard
from app.models.sale import Sale
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.core.dependencies import get_current_user
from app.utils.helpers import paginate

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("")
def get_all(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[int] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Customer)
    if search:
        q = q.filter(
            Customer.first_n.ilike(f"%{search}%") |
            Customer.last_n.ilike(f"%{search}%")  |
            Customer.email.ilike(f"%{search}%")
        )
    if is_active is not None: q = q.filter(Customer.is_active == is_active)
    result = paginate(q, page, size)
    items = []
    for c in result["items"]:
        card = db.query(LoyaltyCard).filter(LoyaltyCard.cust_id == c.cust_id).first()
        items.append({
            "cust_id":       c.cust_id,
            "full_name":     c.full_name,
            "email":         c.email,
            "phone":         c.phone,
            "is_active":     c.is_active,
            "loyalty_points": card.points_balance if card else 0,
            "loyalty_tier":   card.tier           if card else None,
            "loyalty_card":   card.card_num       if card else None,
        })
    result["items"] = items
    return result


@router.get("/{cust_id}")
def get_one(cust_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(Customer).filter(Customer.cust_id == cust_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    card = db.query(LoyaltyCard).filter(LoyaltyCard.cust_id == cust_id).first()
    total = db.query(func.sum(Sale.grand_total)).filter(
        Sale.cust_id == cust_id, Sale.status == "completed"
    ).scalar() or 0
    return {
        "cust_id":        c.cust_id,
        "full_name":      c.full_name,
        "email":          c.email,
        "phone":          c.phone,
        "address":        c.address,
        "gender":         c.gender,
        "is_active":      c.is_active,
        "loyalty_points": card.points_balance if card else 0,
        "loyalty_tier":   card.tier           if card else None,
        "total_purchases": round(total, 2),
    }


@router.post("", status_code=201)
def create(payload: CustomerCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    if payload.email and db.query(Customer).filter(Customer.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    c = Customer(**payload.model_dump(), created_at=datetime.now())
    db.add(c)
    db.commit()
    return {"message": "Created", "cust_id": c.cust_id}


@router.put("/{cust_id}")
def update(cust_id: int, payload: CustomerUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(Customer).filter(Customer.cust_id == cust_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(c, k, v)
    db.commit()
    return {"message": "Updated"}


@router.delete("/{cust_id}")
def delete(cust_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(Customer).filter(Customer.cust_id == cust_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    c.is_active = 0
    db.commit()
    return {"message": "Deactivated"}