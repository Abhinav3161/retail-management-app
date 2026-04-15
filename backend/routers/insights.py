from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services import profit_service, stock_service
from utils.security import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/top-products")
def top_products(limit: int = 5, db: Session = Depends(get_db)):
    return profit_service.top_products_by_units(db, limit=limit)


@router.get("/low-stock")
def low_stock(threshold: int = 5, db: Session = Depends(get_db)):
    return stock_service.get_low_stock(db, threshold=threshold)


@router.get("/inventory-value")
def inventory_value(db: Session = Depends(get_db)):
    return {"inventory_value": stock_service.inventory_value(db)}


@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {"user": current_user.username, "role": current_user.role}
