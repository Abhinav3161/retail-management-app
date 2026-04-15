from sqlalchemy import func
from sqlalchemy.orm import Session
from models.sale_item import SaleItem
from models.product import Product


def get_profit(db: Session):
    items = db.query(SaleItem).all()
    revenue = sum(item.selling_price * item.quantity for item in items)
    cost = sum(item.cost_price * item.quantity for item in items)
    profit = revenue - cost
    gross_margin = profit / revenue if revenue else 0
    return {
        "revenue": revenue,
        "cost": cost,
        "profit": profit,
        "gross_margin": gross_margin,
    }


def profit_per_item(db: Session, limit: int | None = None):
    rows = (
        db.query(
            SaleItem.product_id,
            func.sum(SaleItem.quantity).label("units"),
            func.sum(SaleItem.selling_price * SaleItem.quantity).label("revenue"),
            func.sum(SaleItem.cost_price * SaleItem.quantity).label("cost"),
        )
        .group_by(SaleItem.product_id)
        .order_by(func.sum(SaleItem.selling_price * SaleItem.quantity).desc())
    )
    if limit:
        rows = rows.limit(limit)

    result = []
    for product_id, units, revenue, cost in rows.all():
        product = db.get(Product, product_id)
        if not product:
            continue
        profit = revenue - cost
        margin = profit / revenue if revenue else 0
        result.append(
            {
                "product_id": product_id,
                "name": product.name,
                "units": units,
                "revenue": revenue,
                "cost": cost,
                "profit": profit,
                "margin": margin,
            }
        )
    return result


def margin_heatmap(db: Session):
    # Returns data suitable for a heatmap: product vs margin contribution.
    return profit_per_item(db)


def break_even(db: Session):
    totals = get_profit(db)
    break_even_revenue = totals["cost"]
    gap = break_even_revenue - totals["revenue"]
    return {
        "break_even_revenue": break_even_revenue,
        "current_revenue": totals["revenue"],
        "gap": gap,
        "achieved": gap <= 0,
    }


def top_products_by_units(db: Session, limit: int = 5):
    rows = (
        db.query(SaleItem.product_id, func.sum(SaleItem.quantity).label("units"))
        .group_by(SaleItem.product_id)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(limit)
        .all()
    )

    result = []
    for product_id, units in rows:
        product = db.get(Product, product_id)
        if product:
            result.append({"product_id": product_id, "name": product.name, "units_sold": units})
    return result
