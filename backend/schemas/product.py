from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    name: str
    cost_price: float
    selling_price: float
    stock: int
    category: str | None = None
    sku: str | None = None
    image_url: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    cost_price: float | None = None
    selling_price: float | None = None
    stock: int | None = None
    category: str | None = None
    sku: str | None = None
    image_url: str | None = None


class ProductOut(ProductBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
