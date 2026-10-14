from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.sale import Sale, SaleItem
from app.models.inventory import Inventory, InventoryMovement
from app.models.loyalty import LoyaltyCard, LoyaltyTransaction
from app.schemas.sale import SaleCreate
from app.core.dependencies import get_current_user
from app.utils.helpers import paginate, calc_points_earned, get_loyalty_tier

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.get("")
def get_all(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Sale)
    if status: q = q.filter(Sale.status == status)
    q = q.order_by(Sale.sale_date.desc())
    result = paginate(q, page, size)
    result["items"] = [
        {
            "sale_id":        s.sale_id,
            "customer_name":  s.customer.full_name if s.customer else "Walk-in",
            "employee_name":  s.employee.full_name if s.employee else None,
            "branch_name":    s.branch.branch_name if s.branch   else None,
            "subtotal":       s.subtotal,
            "discount_amt":   s.discount_amt,
            "tax_amt":        s.tax_amt,
            "grand_total":    s.grand_total,
            "payment_method": s.payment_method,
            "status":         s.status,
            "sale_date":      str(s.sale_date),
            "items_count":    len(s.items),
        }
        for s in result["items"]
    ]
    return result


@router.get("/{sale_id}")
def get_one(sale_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    s = db.query(Sale).filter(Sale.sale_id == sale_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "sale_id":        s.sale_id,
        "customer_name":  s.customer.full_name if s.customer else "Walk-in",
        "employee_name":  s.employee.full_name if s.employee else None,
        "grand_total":    s.grand_total,
        "payment_method": s.payment_method,
        "status":         s.status,
        "sale_date":      str(s.sale_date),
        "items": [
            {
                "item_id":    i.item_id,
                "prod_name":  i.product.prod_name if i.product else None,
                "quantity":   i.quantity,
                "unit_price": i.unit_price,
                "line_total": i.line_total,
            }
            for i in s.items
        ],
    }


@router.post("", status_code=201)
def create(payload: SaleCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    sale = Sale(
        emp_id=payload.emp_id, cust_id=payload.cust_id,
        branch_id=payload.branch_id, shift_id=payload.shift_id,
        subtotal=payload.subtotal, discount_amt=payload.discount_amt,
        tax_amt=payload.tax_amt, grand_total=payload.grand_total,
        payment_method=payload.payment_method, points_used=payload.points_used,
        notes=payload.notes, status="completed", sale_date=datetime.now(),
    )
    db.add(sale)
    db.flush()

    for item in payload.items:
        db.add(SaleItem(
            sale_id=sale.sale_id, prod_id=item.prod_id,
            quantity=item.quantity, unit_price=item.unit_price,
            discount=item.discount, line_total=item.line_total,
        ))
        inv = db.query(Inventory).filter(Inventory.prod_id == item.prod_id).first()
        if inv:
            inv.quantity = max(0, inv.quantity - item.quantity)
            db.add(InventoryMovement(
                prod_id=item.prod_id, branch_id=payload.branch_id,
                movement_type="sale", quantity=-item.quantity,
                reference_id=sale.sale_id, notes=f"Sale #{sale.sale_id}",
                move_date=datetime.now(),
            ))

    if payload.cust_id:
        card = db.query(LoyaltyCard).filter(
            LoyaltyCard.cust_id == payload.cust_id,
            LoyaltyCard.status  == "active"
        ).first()
        if card:
            pts = calc_points_earned(payload.grand_total, card.tier)
            card.points_balance += pts
            card.total_earned   += pts
            card.tier            = get_loyalty_tier(card.points_balance)
            db.add(LoyaltyTransaction(
                card_id=card.card_id, sale_id=sale.sale_id,
                trans_type="earn", points=pts,
                notes=f"Earned on Sale #{sale.sale_id}", trans_date=datetime.now(),
            ))

    if payload.shift_id:
        from app.models.shift import Shift
        shift = db.query(Shift).filter(Shift.shift_id == payload.shift_id).first()
        if shift:
            shift.total_sales  = (shift.total_sales  or 0) + payload.grand_total
            shift.total_orders = (shift.total_orders or 0) + 1

    db.commit()
    return {"message": "Sale created", "sale_id": sale.sale_id}