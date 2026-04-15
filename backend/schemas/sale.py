from pydantic import BaseModel, ConfigDict


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int


class SaleCreate(BaseModel):
    user_id: int | None = None
    customer_name: str | None = None
    items: list[SaleItemCreate]


class SaleItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    selling_price: float
    cost_price: float
    model_config = ConfigDict(from_attributes=True)


class ReturnItemOut(BaseModel):
    id: int
    sale_item_id: int
    quantity: int
    reason: str | None = None
    model_config = ConfigDict(from_attributes=True)


class SaleOut(BaseModel):
    id: int
    invoice_number: str
    user_id: int | None
    customer_name: str | None
    total_amount: float
    items: list[SaleItemOut]
    returns: list[ReturnItemOut] | None = None
    model_config = ConfigDict(from_attributes=True)
