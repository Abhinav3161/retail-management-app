from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    username: str
    full_name: str | None = None
    role: str | None = "staff"


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
