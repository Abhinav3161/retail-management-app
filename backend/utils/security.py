import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from config import ACCESS_TOKEN_EXPIRE, ALGORITHM, SECRET_KEY
from database import get_db
from models.user import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    # Simple salted SHA-256 (demo-friendly, replace with bcrypt/argon2 for production)
    salt = secrets.token_hex(8)
    digest = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}${digest}"


def verify_password(password: str, hashed_password: str) -> bool:
    if "$" not in hashed_password:
        legacy_candidate = hashlib.sha256(password.encode()).hexdigest()
        return hmac.compare_digest(legacy_candidate, hashed_password)

    try:
        salt, digest = hashed_password.split("$", 1)
    except ValueError:
        return False
    candidate = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return hmac.compare_digest(candidate, digest)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or ACCESS_TOKEN_EXPIRE)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


def require_roles(roles: list[str]):
    def checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user

    return checker
