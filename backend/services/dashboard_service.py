from sqlalchemy.orm import Session
from models.product import Product
from models.sale import Sale
from services import profit_service, stock_service


def get_summary(db: Session):
    totals = profit_service.get_profit(db)
    break_even = profit_service.break_even(db)
    score = compute_business_score(totals, break_even)
    return {
        "total_products": db.query(Product).count(),
        "total_sales": db.query(Sale).count(),
        "revenue": totals["revenue"],
        "profit": totals["profit"],
        "gross_margin": totals["gross_margin"],
        "inventory_value": stock_service.inventory_value(db),
        "break_even": break_even,
        "business_score": score,
    }


def compute_business_score(totals: dict, break_even: dict) -> float:
    # Lightweight heuristic: margin weight + break-even progress.
    margin_component = max(0.0, min(1.0, totals.get("gross_margin", 0)))
    be_component = 1.0 if break_even.get("achieved") else max(0.0, 1 - max(0, break_even.get("gap", 0)) / (break_even.get("break_even_revenue", 1) or 1))
    return round(0.6 * margin_component + 0.4 * be_component, 3)
