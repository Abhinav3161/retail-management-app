from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.product import Product
from schemas.product import ProductCreate, ProductUpdate, ProductOut
from utils.security import get_current_user, require_roles

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(Product)
    if current_user.role == "admin":
        query = query.filter(Product.admin_deleted.is_(False))
    products = query.order_by(Product.name).all()
    return products


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if current_user.role == "admin" and product.admin_deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductOut, status_code=201, dependencies=[Depends(require_roles(["admin"]))])
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.name == payload.name).first()
    if existing and not existing.admin_deleted:
        raise HTTPException(status_code=400, detail="Product with this name already exists")

    if existing and existing.admin_deleted:
        updates = payload.dict(exclude_none=True)
        for field, value in updates.items():
            setattr(existing, field, value)
        existing.admin_deleted = False
        db.commit()
        db.refresh(existing)
        return existing

    product = Product(**payload.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/{product_id}", response_model=ProductOut, dependencies=[Depends(require_roles(["admin"]))])
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    updates = payload.dict(exclude_none=True)
    for field, value in updates.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_roles(["admin"]))])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.admin_deleted = True
    db.commit()
    return None
