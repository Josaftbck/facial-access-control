from pydantic import BaseModel
from typing import Optional


class DepartmentBase(BaseModel):
    Name: str
    Remarks: Optional[str] = None
    UserSign: Optional[int] = None
    Father: Optional[str] = None


# ✅ Ya no incluyas Code al crear
class DepartmentCreate(DepartmentBase):
    pass


# ✅ Solo permite actualizar los campos editables
class DepartmentUpdate(DepartmentBase):
    pass


# ✅ Para mostrar el departamento con su Code generado
class DepartmentOut(DepartmentBase):
    Code: int
    Active: bool

    model_config = {
        "from_attributes": True  # Pydantic v2
    }