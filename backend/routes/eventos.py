from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.db import get_db
from models.event_log import EventLog
from models.employee import Employee
from models.devices import Device
from models.department import Department
import datetime
from sqlalchemy import func, desc

router = APIRouter(prefix="/eventos", tags=["Registro de Eventos"])

# 📌 Registrar evento
@router.post("/", response_model=dict)
async def registrar_evento(
    USERID: int = Form(...),
    EventType: str = Form(...),  # 'I' o 'O'
    AccessResult: str = Form(...),  # 'A' o 'D'
    AttemptCount: int = Form(...),
    DeviceID: int = Form(...),
    dept: str = Form(...),
    Notes: str = Form(None),
    imagen: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    image_data = await imagen.read() if imagen else None

    nuevo = EventLog(
        USERID=USERID,
        EventType=EventType,
        AccessResult=AccessResult,
        AttemptCount=AttemptCount,
        EventDateTime=datetime.datetime.now(),
        DeviceID=DeviceID,
        dept=dept,
        Notes=Notes,
        CaptureImage=image_data
    )

    db.add(nuevo)
    db.commit()
    return {"mensaje": "✅ Evento registrado correctamente"}


# 📊 Resumen del día
@router.get("/resumen")
def obtener_resumen(db: Session = Depends(get_db)):
    hoy = datetime.date.today()
    inicio = datetime.datetime.combine(hoy, datetime.time.min)
    fin = datetime.datetime.combine(hoy, datetime.time.max)

    total = db.query(func.count(EventLog.EventID)).filter(EventLog.EventDateTime.between(inicio, fin)).scalar()
    exitosos = db.query(func.count(EventLog.EventID)).filter(EventLog.AccessResult == "A", EventLog.EventDateTime.between(inicio, fin)).scalar()
    fallidos = db.query(func.count(EventLog.EventID)).filter(EventLog.AccessResult == "D", EventLog.EventDateTime.between(inicio, fin)).scalar()
    intrusos = db.query(func.count(EventLog.EventID)).filter(EventLog.USERID == None, EventLog.EventDateTime.between(inicio, fin)).scalar()

    return {
        "total_eventos": total,
        "exitosos": exitosos,
        "fallidos": fallidos,
        "intrusos": intrusos
    }


# 📋 Últimos 10 eventos
@router.get("/ultimos")
def ultimos_eventos(db: Session = Depends(get_db)):
    eventos = db.query(EventLog, Employee, Device, Department).join(
        Employee, EventLog.USERID == Employee.empID, isouter=True
    ).join(
        Device, EventLog.DeviceID == Device.DeviceID, isouter=True
    ).join(
        Department, Department.Code == EventLog.dept, isouter=True
    ).order_by(desc(EventLog.EventDateTime)).limit(10).all()

    resultado = []
    for log, emp, dev, dept in eventos:

            resultado.append({
            "fecha": log.EventDateTime.strftime("%Y-%m-%d %H:%M:%S"),
            "usuario": f"{emp.firstName} {emp.lastName}" if emp else "No identificado",
            "resultado": "Exitoso" if log.AccessResult == "A" else "Denegado",
            "intentos": log.AttemptCount,
            "dispositivo": dev.DeviceName if dev else "Desconocido",
            "departamento": dept.Name if dept else "Desconocido",
            "nota": log.Notes
        })
    return resultado


# 🧠 Filtrar eventos por tipo
@router.get("/filtrar/{tipo}")
def eventos_por_tipo(tipo: str, db: Session = Depends(get_db)):
    query = db.query(EventLog, Employee, Device, Department).join(
        Employee, EventLog.USERID == Employee.empID, isouter=True
    ).join(
        Device, EventLog.DeviceID == Device.DeviceID, isouter=True
    ).join(
        Department, Department.Code == EventLog.dept, isouter=True
    ).order_by(desc(EventLog.EventDateTime))

    if tipo == "exitosos":
        query = query.filter(EventLog.AccessResult == "A")
    elif tipo == "denegados":
        query = query.filter(EventLog.AccessResult == "D")
    # Si es "todos" o no válido, no se filtra

    eventos = query.limit(50).all()

    resultado = []
    for log, emp, dev, dept in eventos:
        resultado.append({
            "fecha": log.EventDateTime.strftime("%Y-%m-%d %H:%M:%S"),
            "usuario": f"{emp.firstName} {emp.lastName}" if emp else "No identificado",
            "resultado": "Exitoso" if log.AccessResult == "A" else "Denegado",
            "intentos": log.AttemptCount,
            "dispositivo": dev.DeviceName if dev else "Desconocido",
            "departamento": dept.Name if dept else "Desconocido",
            "nota": log.Notes
        })
    return resultado