from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from typing import Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.category import Category
from app.models.customer import Customer
from app.models.user import Employee
from app.models.inventory import Inventory
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _=Depends(get_current_user)):
    today       = datetime.now().date()
    yesterday   = today - timedelta(days=1)
    month_start = today.replace(day=1)

    today_sales = db.query(func.sum(Sale.grand_total)).filter(
        cast(Sale.sale_date, Date) == today,
        Sale.status == "completed"
    ).scalar() or 0

    today_orders = db.query(func.count(Sale.sale_id)).filter(
        cast(Sale.sale_date, Date) == today,
        Sale.status == "completed"
    ).scalar() or 0

    month_sales = db.query(func.sum(Sale.grand_total)).filter(
        cast(Sale.sale_date, Date) >= month_start,
        Sale.status == "completed"
    ).scalar() or 0

    total_customers = db.query(func.count(Customer.cust_id)).filter(
        Customer.is_active == 1
    ).scalar() or 0

    total_products = db.query(func.count(Product.prod_id)).filter(
        Product.is_active == 1
    ).scalar() or 0

    low_stock = db.query(func.count(Inventory.inv_id)).filter(
        Inventory.quantity <= Inventory.min_stock,
        Inventory.quantity > 0
    ).scalar() or 0

    out_of_stock = db.query(func.count(Inventory.inv_id)).filter(
        Inventory.quantity == 0
    ).scalar() or 0

    return {
        "today_sales":     round(today_sales, 2),
        "today_orders":    today_orders,
        "month_sales":     round(month_sales, 2),
        "total_customers": total_customers,
        "total_products":  total_products,
        "low_stock":       low_stock,
        "out_of_stock":    out_of_stock,
    }


@router.get("/sales")
def sales_report(
    date_from: Optional[str] = None,
    date_to:   Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    today = datetime.now().date()
    if not date_from: date_from = str(today - timedelta(days=30))
    if not date_to:   date_to   = str(today)

    daily = db.query(
        cast(Sale.sale_date, Date).label("date"),
        func.count(Sale.sale_id).label("orders"),
        func.sum(Sale.grand_total).label("revenue"),
    ).filter(
        cast(Sale.sale_date, Date) >= date_from,
        cast(Sale.sale_date, Date) <= date_to,
        Sale.status == "completed"
    ).group_by(cast(Sale.sale_date, Date)).order_by(cast(Sale.sale_date, Date)).all()

    totals = db.query(
        func.count(Sale.sale_id).label("total_orders"),
        func.sum(Sale.grand_total).label("total_revenue"),
        func.avg(Sale.grand_total).label("avg_order"),
    ).filter(
        cast(Sale.sale_date, Date) >= date_from,
        cast(Sale.sale_date, Date) <= date_to,
        Sale.status == "completed"
    ).first()

    return {
        "date_from": date_from,
        "date_to":   date_to,
        "summary": {
            "total_orders":  totals.total_orders  or 0,
            "total_revenue": round(totals.total_revenue or 0, 2),
            "avg_order":     round(totals.avg_order     or 0, 2),
        },
        "daily_data": [
            {"date": str(r.date), "orders": r.orders, "revenue": round(r.revenue or 0, 2)}
            for r in daily
        ],
    }


@router.get("/top-products")
def top_products(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    today = datetime.now().date()
    results = db.query(
        Product.prod_id,
        Product.prod_name,
        func.sum(SaleItem.quantity).label("total_qty"),
        func.sum(SaleItem.line_total).label("total_revenue"),
    ).join(SaleItem, SaleItem.prod_id == Product.prod_id
    ).join(Sale, Sale.sale_id == SaleItem.sale_id
    ).filter(
        cast(Sale.sale_date, Date) >= str(today - timedelta(days=30)),
        Sale.status == "completed"
    ).group_by(Product.prod_id, Product.prod_name
    ).order_by(func.sum(SaleItem.line_total).desc()
    ).limit(limit).all()

    return [
        {
            "prod_id":       r.prod_id,
            "prod_name":     r.prod_name,
            "total_qty":     r.total_qty,
            "total_revenue": round(r.total_revenue or 0, 2),
        }
        for r in results
    ]


@router.get("/inventory")
def inventory_report(db: Session = Depends(get_db), _=Depends(get_current_user)):
    total_value = db.query(
        func.sum(Inventory.quantity * Product.cost_price)
    ).join(Product, Product.prod_id == Inventory.prod_id).scalar() or 0

    low_stock = db.query(Product.prod_name, Product.sku, Inventory.quantity, Inventory.min_stock
    ).join(Inventory, Inventory.prod_id == Product.prod_id
    ).filter(Inventory.quantity <= Inventory.min_stock, Inventory.quantity > 0
    ).all()

    out_stock = db.query(Product.prod_name, Product.sku, Inventory.quantity
    ).join(Inventory, Inventory.prod_id == Product.prod_id
    ).filter(Inventory.quantity == 0).all()

    return {
        "total_value":    round(total_value, 2),
        "low_stock_count": len(low_stock),
        "out_of_stock_count": len(out_stock),
        "low_stock_items": [
            {"prod_name": r.prod_name, "sku": r.sku, "quantity": r.quantity, "min_stock": r.min_stock}
            for r in low_stock
        ],
        "out_of_stock_items": [
            {"prod_name": r.prod_name, "sku": r.sku}
            for r in out_stock
        ],
    }