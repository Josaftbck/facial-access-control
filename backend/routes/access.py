from fastapi import APIRouter, UploadFile, Form, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database.db import get_db
from models.employee import Employee
from models.devices import Device
from models.event_log import EventLog
from models.AccessByDepartment import EmployeeDepartmentAccess
from models.department import Department
from tools.face_utils import get_faces_with_metadata, compare_embedding_to_known
from tools.arduino_controller import enviar_comando_puerta
import numpy as np
import json
import datetime
from collections import defaultdict

router = APIRouter(prefix="/validar", tags=["Validación de Acceso"])

# Contador de intentos fallidos por IP y empleado
intentos_fallidos_por_ip = defaultdict(lambda: defaultdict(int))

@router.post("/")
async def validar_acceso(
    request: Request,
    image: UploadFile = Form(...),
    db: Session = Depends(get_db)
):
    image_bytes = await image.read()
    faces = get_faces_with_metadata(image_bytes)

    # Obtener IP automáticamente
    ip = request.client.host
    # Si usas Nginx u otro proxy inverso: ip = request.headers.get("X-Forwarded-For", request.client.host)

    if not faces:
        return JSONResponse(status_code=200, content={
            "estado": "ACCESO_DENEGADO",
            "motivo": "❌ No se detectó ningún rostro.",
            "departamento": "Departamento no identificado",
            "bbox": None
        })

    if len(faces) > 1:
        return JSONResponse(status_code=200, content={
            "estado": "INTENTE_NUEVAMENTE",
            "motivo": "⚠️ Solo debe haber una persona frente a la cámara.",
            "departamento": "Departamento no identificado",
            "bbox": None
        })

    face = faces[0]
    embedding = np.array(face['embedding'])
    bbox = face['bbox']
    embedding = embedding / np.linalg.norm(embedding)

    # Buscar el dispositivo por IP
    device = db.query(Device).filter(Device.IPAddress == ip, Device.Status == "Activo").first()
    if not device:
        return JSONResponse(status_code=200, content={
            "estado": "ACCESO_DENEGADO",
            "motivo": f"IP {ip} no registrada como dispositivo activo.",
            "departamento": "Departamento no identificado",
            "bbox": bbox
        })

    dept_code = int(device.Department_d)
    dept_obj = db.query(Department).filter(Department.Code == dept_code).first()
    dept_nombre = dept_obj.Name if dept_obj else "Departamento no identificado"
    puerta_fisica = dept_code + 3  # Ajuste personalizado si usas Arduino

    empleados = db.query(Employee).filter(Employee.Active == 'Y').all()

    for emp in empleados:
        if emp.BiometricEmbedding:
            known_embeddings = json.loads(emp.BiometricEmbedding)
            score = compare_embedding_to_known(embedding, known_embeddings)

            if score is not None:
                acceso = db.query(EmployeeDepartmentAccess).filter(
                    EmployeeDepartmentAccess.emp_id == emp.empID,
                    EmployeeDepartmentAccess.dept_code == dept_code,
                    EmployeeDepartmentAccess.is_active == True
                ).first()

                acceso_permitido = acceso is not None

                evento = EventLog(
                    USERID=emp.empID,
                    EventType="I",
                    AccessResult="A" if acceso_permitido else "D",
                    AttemptCount=1,
                    EventDateTime=datetime.datetime.now(),
                    DeviceID=device.DeviceID,
                    dept=str(dept_code),
                    CaptureImage=image_bytes,
                    Notes="Acceso exitoso" if acceso_permitido else "Sin permiso para este departamento"
                )
                db.add(evento)
                db.commit()

                if acceso_permitido:
                    enviar_comando_puerta(puerta_fisica, "verde")
                    intentos_fallidos_por_ip[ip][emp.empID] = 0  # Reiniciar al éxito
                    return JSONResponse(status_code=200, content={
                        "estado": "ACCESO_CONCEDIDO",
                        "nombre": f"{emp.firstName} {emp.lastName}",
                        "puesto": emp.jobTitle,
                        "departamento": dept_nombre,
                        "bbox": bbox
                    })

                # ❌ Sin permiso para este depto
                intentos_fallidos_por_ip[ip][emp.empID] += 1
                intento_actual = intentos_fallidos_por_ip[ip][emp.empID]

                if intento_actual >= 3:
                    enviar_comando_puerta(puerta_fisica, "alerta")
                    intentos_fallidos_por_ip[ip][emp.empID] = 0

                    return JSONResponse(status_code=200, content={
                        "estado": "alerta_acceso",
                        "nombre": f"{emp.firstName} {emp.lastName}",
                        "departamento": dept_nombre,
                        "bbox": bbox,
                        "motivo": "Empleado ha intentado ingresar 3 veces sin permiso"
                    })

                enviar_comando_puerta(puerta_fisica, "rojo")
                return JSONResponse(status_code=200, content={
                    "estado": "ACCESO_DENEGADO",
                    "motivo": f"Empleado sin permiso para el departamento {dept_nombre}",
                    "departamento": dept_nombre,
                    "bbox": bbox
                })

    # 🧍‍♂️ Rostro detectado pero no reconocido
    evento = EventLog(
        USERID=None,
        EventType="I",
        AccessResult="D",
        AttemptCount=1,
        EventDateTime=datetime.datetime.now(),
        DeviceID=device.DeviceID,
        dept=str(dept_code),
        CaptureImage=image_bytes,
        Notes="Rostro no reconocido"
    )
    db.add(evento)
    db.commit()

    return JSONResponse(status_code=200, content={
        "estado": "ACCESO_DENEGADO",
        "motivo": "❌ Rostro no reconocido",
        "departamento": dept_nombre,
        "bbox": bbox
    })