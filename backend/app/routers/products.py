from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.product import Product
from app.models.inventory import Inventory
from app.schemas.product import ProductCreate, ProductUpdate
from app.core.dependencies import get_current_user
from app.utils.helpers import paginate

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("")
def get_all(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    cat_id: Optional[int] = None,
    is_active: Optional[int] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Product)
    if search:
        q = q.filter(
            Product.prod_name.ilike(f"%{search}%") |
            Product.sku.ilike(f"%{search}%") |
            Product.barcode.ilike(f"%{search}%")
        )
    if cat_id is not None:    q = q.filter(Product.cat_id    == cat_id)
    if is_active is not None: q = q.filter(Product.is_active == is_active)

    result = paginate(q, page, size)
    items = []
    for p in result["items"]:
        inv = db.query(Inventory).filter(Inventory.prod_id == p.prod_id).first()
        items.append({
            "prod_id":    p.prod_id,
            "prod_name":  p.prod_name,
            "sku":        p.sku,
            "barcode":    p.barcode,
            "cat_id":     p.cat_id,
            "cat_name":   p.category.cat_name if p.category else None,
            "unit_price": p.unit_price,
            "cost_price": p.cost_price,
            "tax_rate":   p.tax_rate,
            "is_active":  p.is_active,
            "stock_qty":  inv.quantity if inv else 0,
        })
    result["items"] = items
    return result


@router.get("/{prod_id}")
def get_one(prod_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    p = db.query(Product).filter(Product.prod_id == prod_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    inv = db.query(Inventory).filter(Inventory.prod_id == prod_id).first()
    return {
        "prod_id":    p.prod_id,
        "prod_name":  p.prod_name,
        "sku":        p.sku,
        "barcode":    p.barcode,
        "cat_id":     p.cat_id,
        "cat_name":   p.category.cat_name if p.category else None,
        "unit_price": p.unit_price,
        "cost_price": p.cost_price,
        "tax_rate":   p.tax_rate,
        "is_active":  p.is_active,
        "stock_qty":  inv.quantity if inv else 0,
    }


@router.post("", status_code=201)
def create(payload: ProductCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    if payload.sku and db.query(Product).filter(Product.sku == payload.sku).first():
        raise HTTPException(status_code=400, detail="SKU already exists")
    p = Product(**payload.model_dump())
    db.add(p)
    db.flush()
    inv = Inventory(prod_id=p.prod_id, quantity=0, min_stock=10)
    db.add(inv)
    db.commit()
    return {"message": "Created", "prod_id": p.prod_id}


@router.put("/{prod_id}")
def update(prod_id: int, payload: ProductUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    p = db.query(Product).filter(Product.prod_id == prod_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(p, k, v)
    db.commit()
    return {"message": "Updated"}


@router.delete("/{prod_id}")
def delete(prod_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    p = db.query(Product).filter(Product.prod_id == prod_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    p.is_active = 0
    db.commit()
    return {"message": "Deactivated"}