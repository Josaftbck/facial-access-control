# user.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, SmallInteger
from sqlalchemy.orm import relationship
from database.db import Base

class User(Base):
    __tablename__ = 'ousr'
    __table_args__ = {"schema": "umg_biometria"}

    USERID = Column(Integer, primary_key=True, index=True)
    PASSWORD = Column(String(254), nullable=False, default='0')
    USER_CODE = Column(String(25), nullable=False)
    U_NAME = Column(String(155))
    SUPERUSER = Column(String(1), default='N')
    E_Mail = Column(String(100))
    Locked = Column(String(1), default='N')
    objType = Column(String(20), default='12')
    createDate = Column(DateTime)
    updateDate = Column(DateTime)
    lastLogin = Column(DateTime)
    LastPwds = Column(Text)
    LastPwdSet = Column(DateTime)
    FailedLog = Column(Integer, default=0)
    LstLogoutD = Column(DateTime)
    LstLoginT = Column(Integer)
    LstLogoutT = Column(Integer)
    Department = Column(SmallInteger, default=-2)
    Branch = Column(SmallInteger, default=-2)


    # Relación con empleados: especificamos primaryjoin para evitar error de claves foráneas
    employee = relationship(
        "Employee",
        back_populates="user",
        uselist=False,
       primaryjoin="User.USERID == Employee.userId"
    )
