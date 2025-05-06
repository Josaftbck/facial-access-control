from sqlalchemy import Column, String, SmallInteger, Boolean
from sqlalchemy.dialects.mysql import INTEGER
from database.db import Base

class Department(Base):
    __tablename__ = "oudp"
    __table_args__ = {"schema": "umg_biometria"}

    Code = Column(SmallInteger, primary_key=True, index=True, autoincrement=True)
    Name = Column(String(100), nullable=False)
    Remarks = Column(String(255))
    UserSign = Column(INTEGER(unsigned=True))
    Father = Column(String(50))
    Active = Column(Boolean, nullable=False, default=True)  