from models.sale import Sale


def generate_receipt_placeholder(sale: Sale) -> str:
    # Placeholder only; integrate a real PDF library if needed.
    return f"/tmp/receipt-sale-{sale.id}.pdf"
