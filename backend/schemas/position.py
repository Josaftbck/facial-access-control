from pydantic import BaseModel
from typing import Optional

class PositionBase(BaseModel):
    Name: str
    Remarks: Optional[str] = None

class PositionCreate(PositionBase):
    pass

class PositionUpdate(BaseModel):
    Name: Optional[str] = None
    Remarks: Optional[str] = None
    # Active: Optional[bool] = None  # 👈 (Solo si querés permitir actualizar el estado)

class PositionOut(PositionBase):
    jobTitle: int
    Active: bool  # 👈 Añadido para mostrar si está activo

    class Config:
       from_attributes = True