from sqlalchemy.orm import Session
from models.product import Product


def get_low_stock(db: Session, threshold: int = 5):
    return db.query(Product).filter(Product.stock <= threshold).order_by(Product.stock).all()


def inventory_value(db: Session):
    products = db.query(Product).all()
    return sum(product.stock * product.cost_price for product in products)
