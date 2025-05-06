import cv2
import os
import sys

# Argumentos enviados desde FastAPI
emp_id = sys.argv[1]
nombre = sys.argv[2]

# Crear carpetas necesarias
dataset_dir = "dataset"
temp_dir = "temp"
os.makedirs(dataset_dir, exist_ok=True)
os.makedirs(temp_dir, exist_ok=True)

# Crear carpeta específica para el empleado
folder_name = f"{emp_id}_{nombre.replace(' ', '_')}"
employee_dir = os.path.join(dataset_dir, folder_name)
os.makedirs(employee_dir, exist_ok=True)

# Inicializar cámara y detector de rostros
cap = cv2.VideoCapture(0)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

contador = 0
max_capturas = 10  # Número de imágenes a capturar

rostro_guardado = False

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error al abrir la cámara.")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    rostros = face_cascade.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in rostros:
        rostro = frame[y:y+h, x:x+w]
        rostro = cv2.resize(rostro, (150, 150))

        img_path = os.path.join(employee_dir, f"{emp_id}_{nombre}_{contador}.jpg")
        cv2.imwrite(img_path, rostro)
        contador += 1

        # Guardar la primera imagen detectada en temp/
        if not rostro_guardado:
            temp_image_path = os.path.join(temp_dir, "temp_image.jpg")
            cv2.imwrite(temp_image_path, rostro)
            rostro_guardado = True

        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

    cv2.imshow("Capturando Rostro...", frame)

    if cv2.waitKey(1) == ord('q') or contador >= max_capturas:
        break

cap.release()
cv2.destroyAllWindows()

print("✅ Captura de rostros completada.")