from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EmployeeBase(BaseModel):
    lastName: Optional[str]
    firstName: Optional[str]
    sex: str
    jobTitle: Optional[int]
    dept: Optional[int]
    mobile: Optional[str]
    email: Optional[str]
    type_emp: str

class EmployeeCreate(EmployeeBase):
    biometric_status: Optional[int] = 1

class EmployeeOut(EmployeeBase):
    empID: int
    biometric_status: int
    BiometricEmbedding: Optional[str]
    Active: str
    CreateDate: Optional[datetime]
    UpdateDate: Optional[datetime]

    model_config = {"from_attributes": True}

# ✅ Nuevo modelo para intentos duplicados
class DuplicateAttemptBase(BaseModel):
    emp_id_detected: int
    attempted_firstName: Optional[str]
    attempted_lastName: Optional[str]
    attempted_mobile: Optional[str]
    attempted_email: Optional[str]
    similarity_score: float
    attempted_datetime: datetime
    status: Optional[str] = "REJECTED_DUPLICATE"

class DuplicateAttemptCreate(DuplicateAttemptBase):
    pass

class DuplicateAttemptOut(DuplicateAttemptBase):
    id: int

    model_config = {"from_attributes": True}