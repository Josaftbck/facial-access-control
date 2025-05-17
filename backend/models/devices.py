from sqlalchemy import Column, Integer, String, Enum, DateTime, SmallInteger
from database.db import Base
from datetime import datetime

class Device(Base):
    __tablename__ = "devices"
    __table_args__ = {"schema": "umg_biometria"}  # Ajusta si tu esquema es otro

    DeviceID = Column(Integer, primary_key=True, autoincrement=True)
    DeviceName = Column(String(100), nullable=False)
    DeviceType = Column(Enum("Cámara", "Lector Huella", "Otro"), nullable=False)
    Department_d = Column(SmallInteger, nullable=False)
    IPAddress = Column(String(45), nullable=True)
    MACAddress = Column(String(17), nullable=True, unique=True)
    Status = Column(Enum("Activo", "Inactivo", "En mantenimiento"), default="Activo")
    LastCheck = Column(DateTime, default=datetime.now)
    Notes = Column(String(255), nullable=True)
    RegisteredAt = Column(DateTime, default=datetime.now)

