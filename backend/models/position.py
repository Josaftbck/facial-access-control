from sqlalchemy import Column, SmallInteger, String, Boolean
from database.db import Base

class Position(Base):
    __tablename__ = "positions"
    jobTitle = Column(SmallInteger, primary_key=True, autoincrement=True)
    Name = Column(String(20), nullable=False)
    Remarks = Column(String(100))
    Active = Column(Boolean, nullable=False, default=True)