from sqlalchemy import Column, SmallInteger, String
from database.db import Base

class BiometricStatus(Base):
    __tablename__ = "biometric_status"
    __table_args__ = {"schema": "umg_biometria"}

    status_id = Column(SmallInteger, primary_key=True)
    status_name = Column(String(50))