from datetime import date
from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel, HttpUrl, field_validator


StatusType = Literal["backlog", "in_progress", "done"]
PriorityType = Literal["low", "medium", "high"]


class LinkBase(BaseModel):
    url: str
    title: str = ""
    description: str = ""
    category: str = ""
    tags: list[str] = []
    is_favorite: bool = False
    favicon: str = ""
    og_image: str = ""
    notes: str = ""
    status: StatusType = "backlog"
    priority: PriorityType = "medium"
    due_date: Optional[date] = None


class LinkCreate(LinkBase):
    pass


class LinkUpdate(BaseModel):
    url: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[list[str]] = None
    is_favorite: Optional[bool] = None
    favicon: Optional[str] = None
    og_image: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[StatusType] = None
    priority: Optional[PriorityType] = None
    due_date: Optional[date] = None
    position: Optional[int] = None


class LinkResponse(LinkBase):
    id: str
    position: Optional[int] = None
    is_deleted: bool = False
    created_at: str

    class Config:
        from_attributes = True


class ScrapeRequest(BaseModel):
    url: str
    save: bool = False
    category: str = ""
    tags: list[str] = []


class ScrapeResponse(BaseModel):
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    og_image: Optional[str] = None
    favicon: Optional[str] = None
    saved: bool = False
    link_id: Optional[str] = None
