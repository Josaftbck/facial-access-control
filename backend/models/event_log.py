from sqlalchemy import Column, Integer, SmallInteger, Enum, DateTime, String, Text, ForeignKey, LargeBinary
from database.db import Base
import datetime

class EventLog(Base):
    __tablename__ = "event_log"
    __table_args__ = {"schema": "umg_biometria"}

    EventID = Column(Integer, primary_key=True, autoincrement=True)
    USERID = Column(SmallInteger, nullable=True)
    EventType = Column(Enum('I', 'O'), default='I')  # Ingreso / Salida
    AccessResult = Column(Enum('A', 'D'), nullable=False)  # Aprobado / Denegado
    AttemptCount = Column(Integer, default=1)
    EventDateTime = Column(DateTime, default=datetime.datetime.now)
    DeviceID = Column(Integer, ForeignKey("umg_biometria.devices.DeviceID"), nullable=True)
    dept = Column(String(100), nullable=True)
    CaptureImage = Column(LargeBinary, nullable=True)
    Notes = Column(Text, nullable=True)