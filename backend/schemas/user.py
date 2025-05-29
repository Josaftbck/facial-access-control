from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    USER_CODE: str
    U_NAME: Optional[str] = None
    E_Mail: Optional[str] = None
    Department: Optional[int] = -2
    Branch: Optional[int] = -2
    Locked: str = 'N'  # Ahora es obligatorio (sin Optional)

class UserCreate(UserBase):
    PASSWORD: str

class UserUpdate(BaseModel):
    USER_CODE: Optional[str] = None
    U_NAME: Optional[str] = None
    PASSWORD: Optional[str] = None
    E_Mail: Optional[str] = None
    Department: Optional[int] = None
    Branch: Optional[int] = None
    Locked: Optional[str] = None

class UserInDB(UserBase):
    USERID: int
    createDate: datetime
    updateDate: datetime
    
    # Validador para asegurar valores correctos
    @validator('Locked')
    def validate_locked(cls, v):
        if v not in ('Y', 'N'):
            raise ValueError("Locked must be either 'Y' or 'N'")
        return v

    class Config:
        orm_mode = True
        # Esto asegura que se ignoren campos no definidos en el modelo
        extra = "ignore"