from typing import Optional
from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[str] = None
    position: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[str] = None
    position: Optional[int] = None


class CategoryResponse(CategoryBase):
    id: str
    user_id: Optional[str] = None

    class Config:
        from_attributes = True
