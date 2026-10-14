from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.customer import Customer
from app.models.loyalty import LoyaltyCard, LoyaltyTransaction
from app.schemas.customer import LoyaltyCardCreate, LoyaltyCardUpdate
from app.core.dependencies import get_current_user
from app.utils.helpers import paginate, get_loyalty_tier

router = APIRouter(prefix="/loyalty", tags=["Loyalty"])


@router.get("/cards")
def get_all(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    tier: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(LoyaltyCard)
    if tier:   q = q.filter(LoyaltyCard.tier   == tier)
    if status: q = q.filter(LoyaltyCard.status == status)
    result = paginate(q, page, size)
    result["items"] = [
        {
            "card_id":        c.card_id,
            "card_num":       c.card_num,
            "customer_name":  c.customer.full_name if c.customer else None,
            "points_balance": c.points_balance,
            "total_earned":   c.total_earned,
            "total_redeemed": c.total_redeemed,
            "tier":           c.tier,
            "issued_date":    str(c.issued_date) if c.issued_date else None,
            "status":         c.status,
        }
        for c in result["items"]
    ]
    return result


@router.post("/cards", status_code=201)
def issue(payload: LoyaltyCardCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    if not db.query(Customer).filter(Customer.cust_id == payload.cust_id).first():
        raise HTTPException(status_code=404, detail="Customer not found")
    if db.query(LoyaltyCard).filter(LoyaltyCard.card_num == payload.card_num).first():
        raise HTTPException(status_code=400, detail="Card number already exists")
    pts = payload.points_balance or 0
    card = LoyaltyCard(
        cust_id=payload.cust_id, card_num=payload.card_num,
        points_balance=pts, total_earned=pts, total_redeemed=0,
        tier=get_loyalty_tier(pts), issued_date=datetime.now(), status="active",
    )
    db.add(card)
    db.commit()
    return {"message": "Card issued", "card_id": card.card_id}


@router.put("/cards/{card_id}")
def update(card_id: int, payload: LoyaltyCardUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    card = db.query(LoyaltyCard).filter(LoyaltyCard.card_id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Not found")
    if payload.points_balance is not None:
        diff = payload.points_balance - card.points_balance
        card.points_balance = payload.points_balance
        if diff > 0: card.total_earned   += diff
        else:        card.total_redeemed += abs(diff)
        card.tier = get_loyalty_tier(card.points_balance)
        db.add(LoyaltyTransaction(
            card_id=card_id, trans_type="adjustment", points=diff,
            notes="Manual adjustment", trans_date=datetime.now(),
        ))
    if payload.status is not None: card.status = payload.status
    if payload.tier   is not None: card.tier   = payload.tier
    db.commit()
    return {"message": "Updated"}


@router.get("/stats")
def stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    total      = db.query(func.count(LoyaltyCard.card_id)).scalar() or 0
    active     = db.query(func.count(LoyaltyCard.card_id)).filter(LoyaltyCard.status == "active").scalar() or 0
    total_pts  = db.query(func.sum(LoyaltyCard.total_earned)).scalar()   or 0
    redeemed   = db.query(func.sum(LoyaltyCard.total_redeemed)).scalar() or 0
    tiers = {
        t: db.query(func.count(LoyaltyCard.card_id)).filter(LoyaltyCard.tier == t).scalar() or 0
        for t in ["Basic", "Silver", "Gold", "Platinum"]
    }
    return {"total_cards": total, "active_cards": active, "total_points": total_pts, "total_redeemed": redeemed, "tiers": tiers}