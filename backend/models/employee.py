from sqlalchemy import Column, String, Enum, SmallInteger, Integer, DateTime, LargeBinary, ForeignKey, Text
from database.db import Base
from datetime import datetime

class Employee(Base):
    __tablename__ = "ohem"
    __table_args__ = {"schema": "umg_biometria"}

    empID = Column(Integer, primary_key=True, autoincrement=True)
    lastName = Column(String(50))
    firstName = Column(String(50))
    sex = Column(Enum("M", "F"), nullable=False, default="M")
    jobTitle = Column(SmallInteger)
    dept = Column(SmallInteger)
    userId = Column(Integer, nullable=True)
    mobile = Column(String(50))
    email = Column(String(100))
    UpdateDate = Column(DateTime, default=datetime.now)
    Active = Column(String(1), default="Y")
    CreateDate = Column(DateTime, default=datetime.now)
    Code = Column(String(50), nullable=True)
    BiometricImage = Column(LargeBinary, nullable=True)
    BiometricEmbedding = Column(Text, nullable=True)
    type_emp = Column(Enum("E", "V"), nullable=False, default="E")
    biometric_status = Column(SmallInteger, ForeignKey("umg_biometria.biometric_status.status_id"), default=1)