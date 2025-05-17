# routes/access.py
from fastapi import APIRouter, UploadFile, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database.db import get_db
from models.employee import Employee
from models.devices import Device
from models.event_log import EventLog
from models.AccessByDepartment import EmployeeDepartmentAccess
from tools.face_utils import get_embeddings_from_image, compare_embedding_to_known
import numpy as np
import json
import datetime

router = APIRouter(prefix="/validar", tags=["Validación de Acceso"])

@router.post("/")
async def validar_acceso(
    image: UploadFile = Form(...),
    ip: str = Form(...),
    db: Session = Depends(get_db)
):
    image_bytes = await image.read()

    embeddings = get_embeddings_from_image(image_bytes)
    if not embeddings:
        raise HTTPException(status_code=400, detail="❌ No se detectó ningún rostro.")
    if len(embeddings) > 1:
        raise HTTPException(status_code=400, detail="⚠️ Solo debe haber una persona frente a la cámara.")

    embedding = embeddings[0]
    embedding = embedding / np.linalg.norm(embedding)

    empleados = db.query(Employee).filter(Employee.Active == 'Y').all()

    for emp in empleados:
        if emp.BiometricEmbedding:
            known_embeddings = json.loads(emp.BiometricEmbedding)
            score = compare_embedding_to_known(embedding, known_embeddings)
            if score is not None:
                # 🔍 Buscar el dispositivo desde IP
                device = db.query(Device).filter(Device.IPAddress == ip, Device.Status == "Activo").first()
                if not device:
                    return JSONResponse(status_code=200, content={
                        "estado": "ACCESO_DENEGADO",
                        "motivo": f"IP {ip} no registrada como dispositivo activo."
                    })

                # 🔒 Verificar si empleado tiene permiso en ese departamento
                acceso = db.query(EmployeeDepartmentAccess).filter(
                    EmployeeDepartmentAccess.emp_id == emp.empID,
                    EmployeeDepartmentAccess.dept_code == device.Department_d,
                    EmployeeDepartmentAccess.is_active == True
                ).first()

                acceso_permitido = acceso is not None

                # 📝 Registrar en event_log
                evento = EventLog(
                    USERID=emp.empID,
                    EventType="I",
                    AccessResult="A" if acceso_permitido else "D",
                    AttemptCount=1,
                    EventDateTime=datetime.datetime.now(),
                    DeviceID=device.DeviceID,
                    dept=str(device.Department_d),
                    CaptureImage=image_bytes,
                    Notes="Acceso exitoso" if acceso_permitido else "Sin permiso para este departamento"
                )
                db.add(evento)
                db.commit()

                if acceso_permitido:
                    return JSONResponse(status_code=200, content={
                        "estado": "ACCESO_CONCEDIDO",
                        "nombre": f"{emp.firstName} {emp.lastName}",
                        "puesto": emp.jobTitle,
                        "departamento": device.Department_d
                    })
                else:
                    return JSONResponse(status_code=200, content={
                        "estado": "ACCESO_DENEGADO",
                        "motivo": f"Empleado sin permiso para el departamento {device.Department_d}"
                    })

    return JSONResponse(status_code=200, content={
        "estado": "ACCESO_DENEGADO",
        "motivo": "❌ Rostro no reconocido"
    })