from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database.db import get_db
from models.department import Department
from schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentOut

router = APIRouter(prefix="/departamentos", tags=["Departamentos"])

@router.get("/", response_model=list[DepartmentOut])
def listar_departamentos(
    estado: str = Query("activos", description="Filtra por: activos, eliminados o todos"),
    db: Session = Depends(get_db)
):
    """
    Lista los departamentos según el estado:
    - activos (default)
    - eliminados
    - todos
    """
    query = db.query(Department)

    if estado == "activos":
        query = query.filter(Department.Active == True)
    elif estado == "eliminados":
        query = query.filter(Department.Active == False)
    elif estado == "todos":
        pass  # Trae todos
    else:
        raise HTTPException(status_code=400, detail="Estado no válido. Usa: activos, eliminados o todos.")

    return query.all()


@router.get("/{code}", response_model=DepartmentOut)
def obtener_departamento(code: int, db: Session = Depends(get_db)):
    dep = db.query(Department).filter(Department.Code == code, Department.Active == True).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    return dep


@router.post("/", response_model=DepartmentOut)
def crear_departamento(departamento: DepartmentCreate, db: Session = Depends(get_db)):
    nuevo = Department(
        Name=departamento.Name,
        Remarks=departamento.Remarks,
        UserSign=departamento.UserSign,
        Father=departamento.Father,
        Active=True  # ✅ Siempre activo al crear
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/{code}", response_model=DepartmentOut)
def actualizar_departamento(code: int, datos: DepartmentUpdate, db: Session = Depends(get_db)):
    dep = db.query(Department).filter(Department.Code == code, Department.Active == True).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    for key, value in datos.dict(exclude_unset=True).items():
        setattr(dep, key, value)
    db.commit()
    db.refresh(dep)
    return dep


@router.delete("/{code}")
def eliminar_departamento(code: int, db: Session = Depends(get_db)):
    dep = db.query(Department).filter(Department.Code == code, Department.Active == True).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    dep.Active = False  # ✅ Borrado lógico
    db.commit()
    return {"mensaje": "Departamento eliminado (borrado lógico)"}

@router.put("/{code}/restaurar")
def restaurar_departamento(code: int, db: Session = Depends(get_db)):
    dep = db.query(Department).filter(Department.Code == code, Department.Active == False).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Departamento no encontrado o ya está activo")
    dep.Active = True
    db.commit()
    return {"mensaje": "Departamento restaurado correctamente"}