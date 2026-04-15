from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services import dashboard_service, profit_service
from utils.security import get_current_user, require_roles

router = APIRouter(dependencies=[Depends(get_current_user), Depends(require_roles(["admin"]))])


@router.get("/summary")
def report_summary(db: Session = Depends(get_db)):
    profit = profit_service.get_profit(db)
    dashboard = dashboard_service.get_summary(db)
    return {"profit": profit, "dashboard": dashboard}


@router.get("/profit")
def profit_report(db: Session = Depends(get_db)):
    return profit_service.get_profit(db)


@router.get("/kpis")
def kpis(db: Session = Depends(get_db)):
    return dashboard_service.get_summary(db)


@router.get("/profit-per-item")
def profit_per_item(db: Session = Depends(get_db), limit: int | None = None):
    return profit_service.profit_per_item(db, limit=limit)


@router.get("/heatmap")
def margin_heatmap(db: Session = Depends(get_db)):
    return profit_service.margin_heatmap(db)


@router.get("/break-even")
def break_even(db: Session = Depends(get_db)):
    return profit_service.break_even(db)
