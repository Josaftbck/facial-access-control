import insightface
import numpy as np
import cv2
from typing import List, Optional

# Inicializa el modelo una sola vez al cargar el módulo
model = insightface.app.FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
model.prepare(ctx_id=0)

def get_embeddings_from_image(image_bytes: bytes) -> List[np.ndarray]:
    """Devuelve una lista de embeddings normalizados encontrados en la imagen."""
    npimg = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    faces = model.get(frame)
    return [face.embedding / np.linalg.norm(face.embedding) for face in faces] if faces else []

def compare_embedding_to_known(embedding: np.ndarray, known_embeddings: List[List[float]], threshold: float = 0.68) -> Optional[float]:
    """Compara un embedding contra una lista de embeddings conocidos normalizados."""
    for idx, known in enumerate(known_embeddings):
        known_np = np.array(known, dtype=np.float32)
        known_np /= np.linalg.norm(known_np)  # ✅ Normaliza antes de comparar
        dist = np.linalg.norm(embedding - known_np)
        print(f"[Comparación #{idx+1}] Distancia: {dist:.4f}")
        if dist < threshold:
            print(f"🎯 MATCH detectado con distancia {dist:.4f}")
            return dist
    return None
