from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.inventory import Inventory, InventoryMovement
from app.schemas.sale import SaleReturnCreate
from app.core.dependencies import get_current_user
from app.utils.helpers import paginate
from app.models.sale import Sale
from app.models.sale_return import SaleReturn, SaleReturnItem
router = APIRouter(prefix="/sales-returns", tags=["Sales Returns"])


@router.get("")
def get_all(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(SaleReturn).order_by(SaleReturn.return_date.desc())
    result = paginate(q, page, size)
    items = []
    for r in result["items"]:
        sale = db.query(Sale).filter(Sale.sale_id == r.sale_id).first()
        items.append({
            "return_id":      r.return_id,
            "sale_id":        r.sale_id,
            "customer_name":  sale.customer.full_name if sale and sale.customer else "Walk-in",
            "total_refund":   r.total_refund,
            "reason":         r.reason,
            "return_date":    str(r.return_date),
            "items_count":    len(r.items),
        })
    result["items"] = items
    return result


@router.post("", status_code=201)
def create(payload: SaleReturnCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    sale = db.query(Sale).filter(Sale.sale_id == payload.sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    ret = SaleReturn(
        sale_id=payload.sale_id, emp_id=payload.emp_id,
        total_refund=payload.total_refund, reason=payload.reason,
        return_date=datetime.now(),
    )
    db.add(ret)
    db.flush()

    for item in payload.items:
        db.add(SaleReturnItem(
            return_id=ret.return_id, sale_item_id=item.sale_item_id,
            prod_id=item.prod_id, qty_return=item.qty_return,
            refund_amount=item.refund_amount,
        ))
        if item.prod_id:
            inv = db.query(Inventory).filter(Inventory.prod_id == item.prod_id).first()
            if inv:
                inv.quantity += item.qty_return
                db.add(InventoryMovement(
                    prod_id=item.prod_id, branch_id=sale.branch_id,
                    movement_type="return", quantity=item.qty_return,
                    reference_id=ret.return_id,
                    notes=f"Return for Sale #{payload.sale_id}",
                    move_date=datetime.now(),
                ))

    sale.status = "refunded"
    db.commit()
    return {"message": "Return processed", "return_id": ret.return_id}