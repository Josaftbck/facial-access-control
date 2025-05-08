import numpy as np
from deepface import DeepFace
from sklearn.metrics.pairwise import cosine_similarity

# Calcula el embedding de una imagen
def calculate_embedding(image_path, model_name='ArcFace'):
    embedding_obj = DeepFace.represent(img_path=image_path, model_name=model_name)[0]
    return embedding_obj['embedding']

# Compara dos embeddings usando similitud de coseno
def compare_embeddings(embedding1, embedding2, threshold=0.9):
    emb1 = np.array(embedding1).reshape(1, -1)
    emb2 = np.array(embedding2).reshape(1, -1)
    similarity = cosine_similarity(emb1, emb2)[0][0]
    return similarity >= threshold, similarity

# Busca duplicados en los embeddings existentes
def find_duplicate(new_embedding, existing_embeddings, threshold=0.9):
    for emp_id, db_embedding in existing_embeddings:
        is_match, similarity = compare_embeddings(new_embedding, db_embedding, threshold)
        if is_match:
            return emp_id, similarity
    return None, None
