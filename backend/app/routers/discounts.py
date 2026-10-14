from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.discount import Discount
from app.schemas.other import DiscountCreate, DiscountUpdate
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/discounts", tags=["Discounts"])


@router.get("")
def get_all(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Discount)
    if status: q = q.filter(Discount.status == status)
    discounts = q.all()
    return [
        {
            "disc_id":      d.disc_id,
            "name":         d.name,
            "description":  d.description,
            "type":         d.type,
            "value":        d.value,
            "buy_x":        d.buy_x,
            "get_y":        d.get_y,
            "applies_to":   d.applies_to,
            "min_purchase": d.min_purchase,
            "start_date":   d.start_date,
            "end_date":     d.end_date,
            "status":       d.status,
        }
        for d in discounts
    ]


@router.post("", status_code=201)
def create(payload: DiscountCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    d = Discount(**payload.model_dump())
    db.add(d)
    db.commit()
    return {"message": "Created", "disc_id": d.disc_id}


@router.put("/{disc_id}")
def update(disc_id: int, payload: DiscountUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    d = db.query(Discount).filter(Discount.disc_id == disc_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(d, k, v)
    db.commit()
    return {"message": "Updated"}


@router.delete("/{disc_id}")
def delete(disc_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    d = db.query(Discount).filter(Discount.disc_id == disc_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(d)
    db.commit()
    return {"message": "Deleted"}