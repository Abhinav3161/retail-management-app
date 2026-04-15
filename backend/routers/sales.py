from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.product import Product
from models.return_item import ReturnItem
from models.sale import Sale
from models.sale_item import SaleItem
from schemas.sale import SaleCreate, SaleOut
from services import pdf_service
from utils.security import get_current_user
from utils.websocket_manager import WebSocketManager, get_manager

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[SaleOut])
def list_sales(db: Session = Depends(get_db)):
    return db.query(Sale).order_by(Sale.created_at.desc()).all()


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.get(Sale, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


@router.post("/", response_model=SaleOut, status_code=201)
def create_sale(payload: SaleCreate, db: Session = Depends(get_db), ws: WebSocketManager = Depends(get_manager)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Sale requires at least one item")

    sale = Sale(user_id=payload.user_id, customer_name=payload.customer_name, invoice_number=str(uuid4()))
    db.add(sale)
    db.flush()

    total_amount = 0.0
    for item in payload.items:
        product = db.get(Product, item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")

        product.stock -= item.quantity
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=item.product_id,
            quantity=item.quantity,
            selling_price=product.selling_price,
            cost_price=product.cost_price,
        )
        total_amount += sale_item.selling_price * item.quantity
        db.add(sale_item)

    sale.total_amount = total_amount
    db.commit()
    db.refresh(sale)

    # Broadcast sale + low stock notifications (best-effort, non-blocking)
    try:
        import asyncio

        asyncio.create_task(
            ws.broadcast_json(
                {
                    "event": "sale_completed",
                    "payload": {
                        "sale_id": sale.id,
                        "invoice_number": sale.invoice_number,
                        "total": sale.total_amount,
                        "items": len(payload.items),
                    },
                }
            )
        )
        for item in sale.items:
            if item.product.stock <= 5:
                asyncio.create_task(
                    ws.broadcast_json(
                        {
                            "event": "low_stock_alert",
                            "payload": {
                                "productId": item.product.id,
                                "productName": item.product.name,
                                "stock": item.product.stock,
                            },
                        }
                    )
                )
    except Exception:
        pass

    return sale


@router.post("/{sale_item_id}/return", response_model=SaleOut)
def return_sale_item(
    sale_item_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    reason: str | None = None,
    ws: WebSocketManager = Depends(get_manager),
):
    sale_item = db.get(SaleItem, sale_item_id)
    if not sale_item:
        raise HTTPException(status_code=404, detail="Sale item not found")
    if quantity < 1 or quantity > sale_item.quantity:
        raise HTTPException(status_code=400, detail="Return quantity is invalid")

    product = sale_item.product
    product.stock += quantity

    return_record = ReturnItem(
        sale_item_id=sale_item.id,
        sale_id=sale_item.sale_id,
        quantity=quantity,
        reason=reason,
    )
    db.add(return_record)
    db.commit()
    db.refresh(sale_item.sale)

    try:
        import asyncio

        asyncio.create_task(
            ws.broadcast_json(
                {
                    "event": "return_processed",
                    "payload": {
                        "sale_id": sale_item.sale_id,
                        "sale_item_id": sale_item_id,
                        "quantity": quantity,
                        "productId": product.id,
                        "stock": product.stock,
                    },
                }
            )
        )
    except Exception:
        pass

    return sale_item.sale


@router.get("/{sale_id}/invoice")
def generate_invoice(sale_id: int, db: Session = Depends(get_db)):
    sale = db.get(Sale, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    pdf_path = pdf_service.generate_receipt_placeholder(sale)
    return {"invoice_number": sale.invoice_number, "pdf_path": pdf_path}
