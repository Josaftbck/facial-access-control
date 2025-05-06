import face_recognition
import numpy as np
import cv2
import datetime
import os
# from backend_fastapi_face_access.database.db import get_connection, log_event
from PIL import Image
import io
# import pickle

# Cargar datos previamente entrenados
# with open("modelo/known_encodings.pkl", "rb") as f:
#     known_data = pickle.load(f)

# known_encodings = known_data["encodings"]
# known_ids = known_data["ids"]
# known_names = known_data["names"]

def recognize_face(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    for face_encoding, face_location in zip(face_encodings, face_locations):
        # Simulación de coincidencia falsa (para pruebas sin modelo)
        matches = []
        face_distances = []

        # if True in matches:
        #     best_match_index = np.argmin(face_distances)
        #     empleado_id = known_ids[best_match_index]
        #     empleado_nombre = known_names[best_match_index]

        #     # Guardar imagen del evento
        #     timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        #     filename = f"events/{empleado_id}_{timestamp}.jpg"
        #     os.makedirs("events", exist_ok=True)
        #     cv2.imwrite(filename, frame)

        #     # Registrar evento en base de datos
        #     log_event(empleado_id, filename)

        #     print(f"[ACCESO PERMITIDO] Empleado: {empleado_nombre} (ID: {empleado_id})")
        #     print(f"[EVENTO] Imagen guardada: {filename}")
        #     print("🚪 PUERTA ABIERTA\n")

        #     return {"access": True, "empleado": empleado_nombre}

        # print("[ACCESO DENEGADO] Rostro no reconocido.\n")
        return {"access": False}

# 🔽 Bloque de ejecución directa desde terminal
# if __name__ == "__main__":
#     print("[INFO] Iniciando cámara para reconocimiento facial...")
#     print("[INFO] Presiona 'q' para salir.\n")
#     cap = cv2.VideoCapture(0)

#     if not cap.isOpened():
#         print("[ERROR] No se pudo abrir la cámara.")
#         exit()

#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             break

#         _, buffer = cv2.imencode('.jpg', frame)
#         image_bytes = buffer.tobytes()

#         result = recognize_face(image_bytes)

#         if result["access"]:
#             label = f"{result['empleado']} - PUERTA ABIERTA"
#             color = (0, 255, 0)
#         else:
#             label = "Desconocido - ACCESO DENEGADO"
#             color = (0, 0, 255)

#         cv2.putText(frame, label, (10, 30),
#                     cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
#         cv2.imshow("Reconocimiento Facial", frame)

#         if cv2.waitKey(1) & 0xFF == ord("q"):
#             print("[CIERRE] Reconocimiento detenido por el usuario.")
#             break

#     cap.release()
#     cv2.destroyAllWindows()