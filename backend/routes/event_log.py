from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from models.event_log import EventLog
import datetime

router = APIRouter(prefix="/eventos", tags=["Registro de Eventos"])

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