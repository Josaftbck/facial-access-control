
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeviceBase(BaseModel):
    DeviceName: str
    DeviceType: str
    Department_d: int
    IPAddress: Optional[str] = None
    MACAddress: Optional[str] = None
    Status: Optional[str] = "Activo"
    Notes: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(DeviceBase):
    pass

class DeviceOut(DeviceBase):
    DeviceID: int
    LastCheck: datetime
    RegisteredAt: datetime

    model_config = {"from_attributes": True}
