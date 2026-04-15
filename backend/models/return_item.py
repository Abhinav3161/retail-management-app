from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class ReturnItem(Base):
    __tablename__ = "return_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_item_id = Column(Integer, ForeignKey("sale_items.id"), nullable=False)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sale_item = relationship("SaleItem", back_populates="return_items")
    sale = relationship("Sale", back_populates="returns")
