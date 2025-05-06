# routes/recognition.py
from fastapi import APIRouter
import subprocess

router = APIRouter(prefix="/reconocimiento", tags=["Reconocimiento Facial"])

@router.post("/capturar/{emp_id}/{nombre}")
def capturar_rostro(emp_id: int, nombre: str):
    try:
        subprocess.run(["python", "scripts/captura_rostros.py", str(emp_id), nombre], check=True)
        return {"mensaje": "Captura de rostro exitosa."}
    except subprocess.CalledProcessError:
        return {"error": "Error al capturar rostro."}

@router.post("/entrenar")
def entrenar_modelo():
    try:
        subprocess.run(["python", "scripts/entrenar_modelo.py"], check=True)
        return {"mensaje": "Entrenamiento de modelo completado exitosamente."}
    except subprocess.CalledProcessError:
        return {"error": "Error al entrenar el modelo."}