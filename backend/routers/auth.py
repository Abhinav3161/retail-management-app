from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from config import ACCESS_TOKEN_EXPIRE
from database import get_db
from models.user import User
from schemas.user import UserCreate, UserOut, UserLogin
from utils import security

router = APIRouter()


def normalize_username(value: str) -> str:
    return value.strip().lower()


@router.post("/register", response_model=UserOut, status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    normalized_username = normalize_username(user.username)
    if not normalized_username:
        raise HTTPException(status_code=400, detail="Username is required")

    existing = db.query(User).filter(func.lower(User.username) == normalized_username).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")

    hashed = security.hash_password(user.password)
    db_user = User(
        username=normalized_username,
        full_name=user.full_name,
        role=user.role or "staff",
        hashed_password=hashed,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    normalized_username = normalize_username(credentials.username)
    user = db.query(User).filter(func.lower(User.username) == normalized_username).first()
    if not user or not security.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = security.create_access_token(
        {"sub": user.username, "role": user.role},
        expires_delta=ACCESS_TOKEN_EXPIRE,
    )
    return {"access_token": token, "token_type": "bearer", "user": UserOut.from_orm(user)}
