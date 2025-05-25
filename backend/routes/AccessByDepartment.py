from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from database.db import get_db
from models.employee import Employee
from models.department import Department
from models.AccessByDepartment import EmployeeDepartmentAccess
from schemas.AccessByDepartment import AccessOut, AccessUpdateRequest
from typing import List
from datetime import datetime

router = APIRouter(prefix="/accesos", tags=["Accesos por Departamento"])

@router.get("/empleado/{emp_id}", response_model=List[AccessOut])
def obtener_accesos_por_empleado(emp_id: int = Path(...), db: Session = Depends(get_db)):
    return db.query(EmployeeDepartmentAccess).filter(
        EmployeeDepartmentAccess.emp_id == emp_id
    ).all()

@router.put("/empleado/{emp_id}")
def actualizar_accesos_por_empleado(payload: AccessUpdateRequest, db: Session = Depends(get_db)):
    empleado = db.query(Employee).filter(Employee.empID == payload.emp_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    # Desactiva todos los anteriores
    db.query(EmployeeDepartmentAccess).filter(
        EmployeeDepartmentAccess.emp_id == payload.emp_id
    ).update({"is_active": False})

    for dept_code in payload.access_list:
        acceso = db.query(EmployeeDepartmentAccess).filter_by(
            emp_id=payload.emp_id, dept_code=dept_code
        ).first()

        if acceso:
            acceso.is_active = True
            acceso.updated_at = datetime.now()
        else:
            nuevo = EmployeeDepartmentAccess(
                emp_id=payload.emp_id,
                dept_code=dept_code,
                is_active=True,
                granted_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.add(nuevo)

    db.commit()
    return {"mensaje": "✅ Accesos actualizados correctamente"}