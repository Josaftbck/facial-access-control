from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EventLogCreate(BaseModel):
    USERID: Optional[int] = None
    EventType: str = 'I'
    AccessResult: str  # 'A' o 'D'
    AttemptCount: Optional[int] = 1
    DeviceID: Optional[int] = None
    dept: Optional[str] = None
    Notes: Optional[str] = None

class EventLogOut(EventLogCreate):
    EventID: int
    EventDateTime: datetime

    model_config = {"from_attributes": True}