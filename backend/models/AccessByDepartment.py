from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database.db import Base
from datetime import datetime

class EmployeeDepartmentAccess(Base):
    __tablename__ = "employee_department_access"
    __table_args__ = {"schema": "umg_biometria"}  # si usas schema

    id = Column(Integer, primary_key=True, autoincrement=True)
    emp_id = Column(Integer, ForeignKey("umg_biometria.ohem.empID"), nullable=False)
    dept_code = Column(Integer, ForeignKey("umg_biometria.oudp.Code"), nullable=False)
    is_active = Column(Boolean, default=True)
    granted_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relaciones útiles (opcional)
    employee = relationship("Employee", backref="accesos_departamento")