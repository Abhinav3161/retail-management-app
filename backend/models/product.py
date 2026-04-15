from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    sku = Column(String, unique=True, nullable=True, index=True)
    category = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    admin_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sale_items = relationship("SaleItem", back_populates="product")
