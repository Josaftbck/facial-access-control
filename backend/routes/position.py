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
    """
    Lista los puestos según el estado:
    - activos (default)
    - eliminados
    - todos
    """
    query = db.query(Position)

    if estado == "activos":
        query = query.filter(Position.Active == True)
    elif estado == "eliminados":
        query = query.filter(Position.Active == False)
    elif estado == "todos":
        pass  # No aplicamos filtro, trae todo
    else:
        raise HTTPException(status_code=400, detail="Estado no válido. Usa: activos, eliminados o todos.")

    return query.all()


@router.get("/{jobTitle}", response_model=PositionOut)
def obtener_puesto(jobTitle: int, db: Session = Depends(get_db)):
    puesto = db.query(Position).filter(Position.jobTitle == jobTitle, Position.Active == True).first()
    if not puesto:
        raise HTTPException(status_code=404, detail="Puesto no encontrado")
    return puesto


@router.post("/", response_model=PositionOut)
def crear_puesto(puesto: PositionCreate, db: Session = Depends(get_db)):
    nuevo = Position(**puesto.dict(), Active=True)  # 👈 Siempre inicia activo
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/{jobTitle}", response_model=PositionOut)
def actualizar_puesto(jobTitle: int, datos: PositionUpdate, db: Session = Depends(get_db)):
    puesto = db.query(Position).filter(Position.jobTitle == jobTitle, Position.Active == True).first()
    if not puesto:
        raise HTTPException(status_code=404, detail="Puesto no encontrado")
    for key, value in datos.dict(exclude_unset=True).items():
        setattr(puesto, key, value)
    db.commit()
    db.refresh(puesto)
    return puesto


@router.delete("/{jobTitle}")
def eliminar_puesto(jobTitle: int, db: Session = Depends(get_db)):
    puesto = db.query(Position).filter(Position.jobTitle == jobTitle, Position.Active == True).first()
    if not puesto:
        raise HTTPException(status_code=404, detail="Puesto no encontrado")
    puesto.Active = False  # 👈 Cambia a inactivo
    db.commit()
    return {"mensaje": "Puesto eliminado (borrado lógico)"}