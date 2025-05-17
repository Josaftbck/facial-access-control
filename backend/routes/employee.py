from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, Query
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session
from database.db import get_db
from models.employee import Employee
from models.duplicate_attempt import DuplicateAttempt
from tools.face_utils import get_embeddings_from_image, compare_embedding_to_known
import datetime
import json
import os
import numpy as np
import io

router = APIRouter(prefix="/empleados", tags=["Empleados"])

temp_image_path = "temp/temp_image.jpg"

@router.post("/")
async def registrar_empleado(
    firstName: str = Form(...),
    lastName: str = Form(...),
    sex: str = Form(...),
    type_emp: str = Form(...),
    jobTitle: int = Form(...),
    dept: int = Form(...),
    mobile: str = Form(None),
    email: str = Form(None),
    image: UploadFile = Form(...),
    db: Session = Depends(get_db)
):
    try:
        with open(temp_image_path, "wb") as f:
            f.write(await image.read())

        with open(temp_image_path, "rb") as f:
            image_bytes = f.read()

        embeddings = get_embeddings_from_image(image_bytes)

        if not embeddings:
            raise HTTPException(status_code=400, detail="❌ No se detectó ningún rostro en la imagen.")

        if len(embeddings) > 1:
            raise HTTPException(status_code=400, detail="⚠️ Se detectaron múltiples rostros. Por favor, solo una persona en la imagen.")

        new_embedding = embeddings[0]
        new_embedding = new_embedding / np.linalg.norm(new_embedding)

        empleados = db.query(Employee).all()
        for emp in empleados:
            if emp.BiometricEmbedding:
                existing_embeddings = json.loads(emp.BiometricEmbedding)
                try:
                    match_score = compare_embedding_to_known(new_embedding, existing_embeddings)
                    if match_score is not None:
                        print(f"🎯 MATCH con {emp.firstName} {emp.lastName} - Distancia: {match_score:.4f}")

                        duplicate_attempt = DuplicateAttempt(
                            emp_id_detected=emp.empID,
                            attempted_firstName=firstName,
                            attempted_lastName=lastName,
                            attempted_mobile=mobile,
                            attempted_email=email,
                            similarity_score=float(match_score),  # ✅ conversión a tipo nativo
                            attempted_datetime=datetime.datetime.now(),
                            status="REJECTED_DUPLICATE"
                        )
                        db.add(duplicate_attempt)
                        db.commit()

                        return JSONResponse(
                            status_code=200,
                            content={
                                "mensaje": f"⚠️ El rostro coincide con el empleado ID {emp.empID} ({emp.firstName} {emp.lastName}), similitud {match_score:.2f}. Intento guardado en DuplicateAttempts.",
                                "estado": "REJECTED_DUPLICATE",
                                "empID_detectado": emp.empID,
                                "nombre_detectado": f"{emp.firstName} {emp.lastName}"
                            }
                        )
                except Exception as e:
                    print(f"Error al comparar con empleado ID {emp.empID}: {e}")
                    continue

        embedding_str = json.dumps([new_embedding.tolist()])

        nuevo = Employee(
            firstName=firstName,
            lastName=lastName,
            sex=sex,
            type_emp=type_emp,
            jobTitle=jobTitle,
            dept=dept,
            mobile=mobile,
            email=email,
            CreateDate=datetime.datetime.now(),
            UpdateDate=datetime.datetime.now(),
            BiometricImage=image_bytes,
            BiometricEmbedding=embedding_str,
            Active='Y',
            biometric_status=1
        )

        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)

        return JSONResponse(
            status_code=200,
            content={
                "mensaje": "✅ Empleado registrado correctamente",
                "empID": nuevo.empID,
                "nombre_completo": f"{nuevo.firstName} {nuevo.lastName}",
                "estado": "REGISTERED"
            }
        )

    finally:
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)

@router.get("/")
def obtener_empleados(
    estado: str = Query("activos", description="Filtrar por activos/eliminados/todos"),
    db: Session = Depends(get_db)
):
    query = db.query(Employee)
    if estado == "activos":
        query = query.filter(Employee.Active == 'Y')
    elif estado == "eliminados":
        query = query.filter(Employee.Active == 'N')

    empleados = query.all()
    return [{
        "empID": emp.empID,
        "firstName": emp.firstName,
        "lastName": emp.lastName,
        "sex": emp.sex,
        "jobTitle": emp.jobTitle,
        "dept": emp.dept,
        "mobile": emp.mobile,
        "email": emp.email,
        "Active": emp.Active,
        "type_emp": emp.type_emp,
        "UpdateDate": emp.UpdateDate,
        "CreateDate": emp.CreateDate,
        "biometric_status": emp.biometric_status,
    } for emp in empleados]

@router.get("/{emp_id}/imagen")
def obtener_imagen_empleado(emp_id: int, db: Session = Depends(get_db)):
    empleado = db.query(Employee).filter(Employee.empID == emp_id).first()
    if not empleado or not empleado.BiometricImage:
        raise HTTPException(status_code=404, detail="Empleado o imagen no encontrada.")
    return StreamingResponse(io.BytesIO(empleado.BiometricImage), media_type="image/jpeg")

@router.put("/{emp_id}")
def actualizar_empleado(
    emp_id: int,
    firstName: str = Form(...),
    lastName: str = Form(...),
    sex: str = Form(...),
    type_emp: str = Form(...),
    jobTitle: int = Form(...),
    dept: int = Form(...),
    mobile: str = Form(None),
    email: str = Form(None),
    db: Session = Depends(get_db)
):
    empleado = db.query(Employee).filter(Employee.empID == emp_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado.")
    empleado.firstName = firstName
    empleado.lastName = lastName
    empleado.sex = sex
    empleado.type_emp = type_emp
    empleado.jobTitle = jobTitle
    empleado.dept = dept
    empleado.mobile = mobile
    empleado.email = email
    empleado.UpdateDate = datetime.datetime.now()
    db.commit()
    db.refresh(empleado)
    return {"mensaje": "✅ Empleado actualizado correctamente", "empID": empleado.empID}

@router.put("/{emp_id}/desactivar")
def desactivar_empleado(emp_id: int, db: Session = Depends(get_db)):
    empleado = db.query(Employee).filter(Employee.empID == emp_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado.")
    empleado.Active = 'N'
    empleado.UpdateDate = datetime.datetime.now()
    db.commit()
    return {"mensaje": "✅ Empleado desactivado correctamente"}

@router.put("/{emp_id}/restaurar")
def restaurar_empleado(emp_id: int, db: Session = Depends(get_db)):
    empleado = db.query(Employee).filter(Employee.empID == emp_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado.")
    empleado.Active = 'Y'
    empleado.UpdateDate = datetime.datetime.now()
    db.commit()
    return {"mensaje": "✅ Empleado restaurado correctamente"}