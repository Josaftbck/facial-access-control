from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database.db import get_db
from models.position import Position
from schemas.position import PositionCreate, PositionUpdate, PositionOut

router = APIRouter(prefix="/puestos", tags=["Puestos"])

@router.get("/", response_model=list[PositionOut])
def listar_puestos(
    estado: str = Query("activos", description="Filtra por: activos, eliminados o todos"),
    db: Session = Depends(get_db)
):
    query = db.query(Position)

    if estado == "activos":
        query = query.filter(Position.Active == 1)  # ✅ activos = 1
    elif estado == "eliminados":
        query = query.filter(Position.Active == 0)  # ✅ eliminados = 0
    elif estado == "todos":
        pass  # sin filtro
    else:
        raise HTTPException(status_code=400, detail="Estado no válido. Usa: activos, eliminados o todos.")

    return query.all()

@router.get("/{jobTitle}", response_model=PositionOut)
def obtener_puesto(jobTitle: int, db: Session = Depends(get_db)):
    puesto = db.query(Position).filter(Position.jobTitle == jobTitle, Position.Active == 1).first()
    if not puesto:
        raise HTTPException(status_code=404, detail="Puesto no encontrado")
    return puesto

@router.post("/", response_model=PositionOut)
def crear_puesto(puesto: PositionCreate, db: Session = Depends(get_db)):
    nuevo = Position(**puesto.dict(), Active=1)  # ✅ guarda como 1 (activo)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.put("/{jobTitle}", response_model=PositionOut)
def actualizar_puesto(jobTitle: int, datos: PositionUpdate, db: Session = Depends(get_db)):
    puesto = db.query(Position).filter(Position.jobTitle == jobTitle).first()
    if not puesto:
        raise HTTPException(status_code=404, detail="Puesto no encontrado")
    for key, value in datos.dict(exclude_unset=True).items():
        setattr(puesto, key, value)
    db.commit()
    db.refresh(puesto)
    return puesto

@router.put("/{jobTitle}/desactivar")
def desactivar_puesto(jobTitle: int, db: Session = Depends(get_db)):
    puesto = db.query(Position).filter(Position.jobTitle == jobTitle, Position.Active == 1).first()
    if not puesto:
        raise HTTPException(status_code=404, detail="Puesto no encontrado")
    puesto.Active = 0  # ✅ marcar como inactivo
    db.commit()
    return {"mensaje": "Puesto desactivado correctamente"}

@router.put("/{jobTitle}/restaurar")
def restaurar_puesto(jobTitle: int, db: Session = Depends(get_db)):
    puesto = db.query(Position).filter(Position.jobTitle == jobTitle, Position.Active == 0).first()
    if not puesto:
        raise HTTPException(status_code=404, detail="Puesto no encontrado")
    puesto.Active = 1  # ✅ marcar como activo
    db.commit()
    return {"mensaje": "Puesto restaurado correctamente"}