from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database.db import Base
from datetime import datetime

class DuplicateAttempt(Base):
    __tablename__ = "DuplicateAttempts"
    __table_args__ = {"schema": "umg_biometria"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    emp_id_detected = Column(Integer, ForeignKey("umg_biometria.ohem.empID"), nullable=False)
    attempted_firstName = Column(String(50))
    attempted_lastName = Column(String(50))
    attempted_mobile = Column(String(50))
    attempted_email = Column(String(100))
    similarity_score = Column(Float, nullable=False)
    attempted_datetime = Column(DateTime, default=datetime.now)
    status = Column(String(50), default="REJECTED_DUPLICATE")