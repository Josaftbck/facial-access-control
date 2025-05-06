from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EmployeeBase(BaseModel):
    lastName: Optional[str]
    firstName: Optional[str]
    sex: str  # M o F
    jobTitle: Optional[int]
    dept: Optional[int]
    mobile: Optional[str]
    email: Optional[str]
    type_emp: str  # E o V

class EmployeeCreate(EmployeeBase):
    biometric_status: Optional[int] = 1  # ✅ Por defecto PENDING (1)

class EmployeeOut(EmployeeBase):
    empID: int
    biometric_status: int  # ✅ Estado biométrico (1: Pending, 2: Registered, 3: Trained)
    Active: str
    CreateDate: Optional[datetime]
    UpdateDate: Optional[datetime]

    model_config = {"from_attributes": True}