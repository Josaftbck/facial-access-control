from fastapi import APIRouter, Depends, HTTPException, Form, Query
from sqlalchemy.orm import Session
from database.db import get_db
from models.devices import Device
from datetime import datetime

router = APIRouter(prefix="/devices", tags=["Dispositivos"])

# ✅ Crear nuevo dispositivo
@router.post("/")
def crear_dispositivo(
    DeviceName: str = Form(...),
    DeviceType: str = Form(...),
    Department_d: int = Form(...),
    IPAddress: str = Form(None),
    MACAddress: str = Form(...),
    Status: str = Form("Activo"),
    Notes: str = Form(None),
    db: Session = Depends(get_db)
):
    nuevo = Device(
        DeviceName=DeviceName,
        DeviceType=DeviceType,
        Department_d=Department_d,
        IPAddress=IPAddress,
        MACAddress=MACAddress,
        Status=Status,
        Notes=Notes,
        RegisteredAt=datetime.now(),
        LastCheck=datetime.now()
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return {"mensaje": "✅ Dispositivo registrado", "DeviceID": nuevo.DeviceID}

# ✅ Listar dispositivos con filtro opcional por estado
@router.get("/")
def listar_dispositivos(estado: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(Device)
    if estado:
        query = query.filter(Device.Status == estado)
    return query.all()

# ✅ Obtener un dispositivo por ID
@router.get("/{device_id}")
def obtener_dispositivo(device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.DeviceID == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")
    return device

# ✅ Actualizar dispositivo
@router.put("/{device_id}")
def actualizar_dispositivo(
    device_id: int,
    DeviceName: str = Form(...),
    DeviceType: str = Form(...),
    Department_d: int = Form(...),
    IPAddress: str = Form(None),
    MACAddress: str = Form(...),
    Status: str = Form(...),
    Notes: str = Form(None),
    db: Session = Depends(get_db)
):
    device = db.query(Device).filter(Device.DeviceID == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")

    device.DeviceName = DeviceName
    device.DeviceType = DeviceType
    device.Department_d = Department_d
    device.IPAddress = IPAddress
    device.MACAddress = MACAddress
    device.Status = Status
    device.Notes = Notes
    device.LastCheck = datetime.now()
    db.commit()
    return {"mensaje": "✅ Dispositivo actualizado"}

# ✅ Eliminación lógica (cambia estado a "Inactivo")
@router.delete("/{device_id}")
def eliminar_dispositivo(device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.DeviceID == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")

    device.Status = "Inactivo"
    device.LastCheck = datetime.now()
    db.commit()
    return {"mensaje": "🛑 Dispositivo desactivado (eliminación lógica)"}

# ✅ Restaurar un dispositivo (cambia estado a "Activo")
@router.put("/{device_id}/restaurar")
def restaurar_dispositivo(device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.DeviceID == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo no encontrado")

    device.Status = "Activo"
    device.LastCheck = datetime.now()
    db.commit()
    return {"mensaje": "✅ Dispositivo reactivado"}