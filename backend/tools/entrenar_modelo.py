import face_recognition
import os
import numpy as np
import pickle

def entrenar_modelo(dataset_dir='dataset', output_file='modelo/known_encodings.pkl'):
    known_encodings = []
    known_ids = []
    known_names = []

    for folder in os.listdir(dataset_dir):
        folder_path = os.path.join(dataset_dir, folder)
        if not os.path.isdir(folder_path):
            continue

        try:
            empleado_id, nombre = folder.split("_", 1)
            empleado_id = int(empleado_id)
        except ValueError:
            print(f"Nombre de carpeta inválido: {folder}")
            continue

        for image_name in os.listdir(folder_path):
            image_path = os.path.join(folder_path, image_name)
            image = face_recognition.load_image_file(image_path)
            encodings = face_recognition.face_encodings(image)
            if len(encodings) > 0:
                known_encodings.append(encodings[0])
                known_ids.append(empleado_id)
                known_names.append(nombre.replace("_", " "))

    data = {
        "encodings": known_encodings,
        "ids": known_ids,
        "names": known_names
    }

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, "wb") as f:
        pickle.dump(data, f)

    print(f"Modelo entrenado con {len(known_ids)} rostros. Guardado en: {output_file}")

if __name__ == "__main__":
    entrenar_modelo()