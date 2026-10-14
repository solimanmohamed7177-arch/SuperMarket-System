from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.product import CategoryCreate, CategoryUpdate
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("")
def get_all(db: Session = Depends(get_db), _=Depends(get_current_user)):
    cats = db.query(Category).all()
    result = []
    for c in cats:
        count = db.query(Product).filter(
            Product.cat_id == c.cat_id,
            Product.is_active == 1
        ).count()
        result.append({
            "cat_id":        c.cat_id,
            "cat_name":      c.cat_name,
            "description":   c.description,
            "icon":          c.icon,
            "color":         c.color,
            "created_at":    c.created_at,
            "product_count": count,
        })
    return result


@router.post("", status_code=201)
def create(payload: CategoryCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    if db.query(Category).filter(Category.cat_name == payload.cat_name).first():
        raise HTTPException(status_code=400, detail="Category already exists")
    c = Category(**payload.model_dump(), created_at=str(date.today()))
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"message": "Created", "cat_id": c.cat_id}


@router.put("/{cat_id}")
def update(cat_id: int, payload: CategoryUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(Category).filter(Category.cat_id == cat_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(c, k, v)
    db.commit()
    return {"message": "Updated"}


@router.delete("/{cat_id}")
def delete(cat_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(Category).filter(Category.cat_id == cat_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(c)
    db.commit()
    return {"message": "Deleted"}