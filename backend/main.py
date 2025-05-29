from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import department
from routes import position
from routes import recognition
from routes import employee  # ✅ ¡Agregar!
from routes import access
from routes import devices
from routes import AccessByDepartment
from routes import event_log  
from routes import eventos
from routes import users
from routes import auth  # Agrega esto
from models.biometric_status import BiometricStatus


app = FastAPI(
    title="API de Reconocimiento Facial",
    description="Sistema de control de accesos con reconocimiento facial",
    version="1.0.0"
)

# ✅ CORS Middleware para permitir conexión desde React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://localhost:5173",
        "https://192.168.0.85:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routers habilitados
app.include_router(department.router)
app.include_router(position.router)
app.include_router(recognition.router)
app.include_router(employee.router)  # ✅ ¡Agregar!
app.include_router(access.router)
app.include_router(devices.router) 
app.include_router(AccessByDepartment.router)
app.include_router(event_log.router)
app.include_router(eventos.router)
app.include_router(users.router)
app.include_router(auth.router)  # Después de los otros routers

@app.get("/")
def root():
    return {"mensaje": "✅ API de Reconocimiento Facial activa"}
