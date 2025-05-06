from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import department
from routes import position
from routes import recognition
from routes import employee  # ✅ ¡Agregar!
from models.biometric_status import BiometricStatus


app = FastAPI(
    title="API de Reconocimiento Facial",
    description="Sistema de control de accesos con reconocimiento facial",
    version="1.0.0"
)

# ✅ CORS Middleware para permitir conexión desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routers habilitados
app.include_router(department.router)
app.include_router(position.router)
app.include_router(recognition.router)
app.include_router(employee.router)  # ✅ ¡Agregar!