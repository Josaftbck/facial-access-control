from fastapi import APIRouter, Depends, HTTPException, Form, Body
from sqlalchemy.orm import Session
from database.db import get_db
from models.employee import Employee
import datetime
import subprocess
import os

router = APIRouter(prefix="/empleados", tags=["Empleados"])

# 📂 Ruta donde se guardará temporalmente la mejor imagen capturada
temp_image_path = "temp/temp_image.jpg"

@router.post("/capturar-rostro")
def capturar_y_entrenar_rostro(data: dict = Body(...)):
    """✅ Captura imágenes del rostro, entrena el modelo y guarda una imagen temporal."""
    emp_id = data.get("emp_id")
    nombre = data.get("nombre")

    if not emp_id or not nombre:
        raise HTTPException(status_code=400, detail="Datos de captura incompletos.")

    try:
        # ✅ Captura de rostros (esto también guardará una imagen en temp/)
        subprocess.run(
            ["python", "tools/captura_rostros.py", str(emp_id), nombre],
            check=True
        )

        # ✅ Entrenamiento de modelo
        subprocess.run(
            ["python", "tools/entrenar_modelo.py"],
            check=True
        )

        return {"mensaje": "Captura y entrenamiento completados exitosamente."}

    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error durante captura/entrenamiento: {str(e)}")


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
    db: Session = Depends(get_db)
):
    """✅ Registra al empleado en la base de datos, incluyendo la imagen capturada."""

    # 🖼️ Leemos la imagen temporal capturada
    if not os.path.exists(temp_image_path):
        raise HTTPException(status_code=400, detail="No se encontró imagen de rostro capturada.")

    with open(temp_image_path, "rb") as f:
        contenido_imagen = f.read()

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
        BiometricImage=contenido_imagen,
        Active='Y',  # 🔥 Se activa automáticamente
        biometric_status=2  # 👈 Aquí DEBE ser 'status', no 'biometric_status'
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    # 🧹 Limpia la imagen temporal después de registrar
    os.remove(temp_image_path)

    return {
        "mensaje": "Empleado registrado correctamente ✅",
        "empID": nuevo.empID,
        "nombre_completo": f"{nuevo.firstName} {nuevo.lastName}",
        "estado": "REGISTERED"
    }


@router.put("/{emp_id}/estado")
def actualizar_estado_empleado(
    emp_id: int,
    nuevo_estado: int = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    ✅ Actualiza el estado biométrico de un empleado (1: PENDING, 2: REGISTERED, 3: TRAINED).
    """
    empleado = db.query(Employee).filter(Employee.empID == emp_id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado.")

    if nuevo_estado not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Estado no válido. Usa 1 (PENDING), 2 (REGISTERED) o 3 (TRAINED).")

    empleado.status = nuevo_estado  # 👈 Siempre status en el modelo SQLAlchemy
    empleado.UpdateDate = datetime.datetime.now()

    db.commit()
    db.refresh(empleado)

    return {
        "mensaje": f"Estado actualizado correctamente a {nuevo_estado}.",
        "empID": empleado.empID,
        "estado_actual": nuevo_estado
    }