
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Inventory, InventoryMovement
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
from app.models.product import Product
from app.models.supplier import Supplier
from app.schemas.inventory import InventoryUpdate, POCreate, POUpdate
from app.core.dependencies import get_current_user
from app.utils.helpers import paginate, get_stock_status


router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("")
def get_all(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Inventory)
    result = paginate(q, page, size)
    items = []
    for inv in result["items"]:
        p = inv.product
        if not p: continue
        items.append({
            "inv_id":      inv.inv_id,
            "prod_id":     inv.prod_id,
            "prod_name":   p.prod_name,
            "sku":         p.sku,
            "branch_name": inv.branch.branch_name if inv.branch else None,
            "quantity":    inv.quantity,
            "min_stock":   inv.min_stock,
            "status":      get_stock_status(inv.quantity, inv.min_stock or 10),
            "total_value": inv.quantity * (p.cost_price or 0),
        })
    result["items"] = items
    return result


@router.put("/{inv_id}")
def update(inv_id: int, payload: InventoryUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    inv = db.query(Inventory).filter(Inventory.inv_id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Not found")
    old_qty = inv.quantity
    if payload.quantity  is not None: inv.quantity  = payload.quantity
    if payload.min_stock is not None: inv.min_stock = payload.min_stock
    if payload.max_stock is not None: inv.max_stock = payload.max_stock
    inv.last_updated = datetime.now()
    if payload.quantity is not None and payload.quantity != old_qty:
        diff = payload.quantity - old_qty
        db.add(InventoryMovement(
            prod_id=inv.prod_id, branch_id=inv.branch_id,
            movement_type="adjustment", quantity=diff,
            notes="Manual adjustment", move_date=datetime.now(),
        ))
    db.commit()
    return {"message": "Updated"}


@router.get("/movements")
def get_movements(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(InventoryMovement).order_by(InventoryMovement.move_date.desc())
    result = paginate(q, page, size)
    result["items"] = [
        {
            "move_id":       m.move_id,
            "prod_id":       m.prod_id,
            "movement_type": m.movement_type,
            "quantity":      m.quantity,
            "reference_id":  m.reference_id,
            "notes":         m.notes,
            "move_date":     str(m.move_date),
        }
        for m in result["items"]
    ]
    return result


@router.get("/purchase-orders")
def get_pos(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(PurchaseOrder)
    if status: q = q.filter(PurchaseOrder.status == status)
    q = q.order_by(PurchaseOrder.order_date.desc())
    result = paginate(q, page, size)
    result["items"] = [
        {
            "po_id":         po.po_id,
            "supplier_name": po.supplier.sup_n if po.supplier else None,
            "branch_name":   po.branch.branch_name if po.branch else None,
            "total_cost":    po.total_cost,
            "status":        po.status,
            "order_date":    str(po.order_date) if po.order_date else None,
            "items_count":   len(po.items),
        }
        for po in result["items"]
    ]
    return result


@router.get("/purchase-orders/{po_id}")
def get_po(po_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.po_id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "po_id":         po.po_id,
        "supplier_name": po.supplier.sup_n if po.supplier else None,
        "total_cost":    po.total_cost,
        "status":        po.status,
        "order_date":    str(po.order_date) if po.order_date else None,
        "items": [
            {
                "po_item_id":   i.po_item_id,
                "prod_name":    i.product.prod_name if i.product else None,
                "quantity":     i.quantity,
                "unit_cost":    i.unit_cost,
                "line_total":   i.line_total,
                "qty_received": i.qty_received,
            }
            for i in po.items
        ],
    }


@router.post("/purchase-orders", status_code=201)
def create_po(payload: POCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    if not db.query(Supplier).filter(Supplier.sup_id == payload.sup_id).first():
        raise HTTPException(status_code=404, detail="Supplier not found")
    po = PurchaseOrder(
        sup_id=payload.sup_id, branch_id=payload.branch_id,
        emp_id=payload.emp_id, total_cost=payload.total_cost,
        notes=payload.notes, status="pending", order_date=datetime.now(),
        expected_date=datetime.fromisoformat(payload.expected_date) if payload.expected_date else None,
    )
    db.add(po)
    db.flush()
    for item in payload.items:
        db.add(PurchaseOrderItem(
            po_id=po.po_id, prod_id=item.prod_id, quantity=item.quantity,
            unit_cost=item.unit_cost, line_total=item.line_total, qty_received=0,
        ))
    db.commit()
    return {"message": "PO created", "po_id": po.po_id}


@router.put("/purchase-orders/{po_id}")
def update_po(po_id: int, payload: POUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.po_id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Not found")
    if payload.status     is not None: po.status     = payload.status
    if payload.notes      is not None: po.notes      = payload.notes
    if payload.total_cost is not None: po.total_cost = payload.total_cost
    if payload.status == "received":
        po.received_date = datetime.now()
        for item in po.items:
            inv = db.query(Inventory).filter(Inventory.prod_id == item.prod_id).first()
            if inv:
                inv.quantity     += item.quantity
                inv.last_updated  = datetime.now()
                item.qty_received = item.quantity
                db.add(InventoryMovement(
                    prod_id=item.prod_id, branch_id=po.branch_id,
                    movement_type="purchase", quantity=item.quantity,
                    reference_id=po_id, notes=f"PO #{po_id} received",
                    move_date=datetime.now(),
                ))
    db.commit()
    return {"message": "Updated"}