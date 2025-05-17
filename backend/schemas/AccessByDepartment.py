from pydantic import BaseModel
from datetime import datetime
from typing import List

class AccessBase(BaseModel):
    emp_id: int
    dept_code: int
    is_active: bool = True

class AccessCreate(AccessBase):
    pass

class AccessOut(AccessBase):
    id: int
    granted_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class AccessUpdateRequest(BaseModel):
    emp_id: int
    access_list: List[int]  # Lista de dept_code activos