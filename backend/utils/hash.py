# hash.py

from passlib.context import CryptContext

# Crear contexto de encriptación con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compara una contraseña en texto plano con un hash bcrypt.
    Retorna True si coinciden, False si no.
    """
    return pwd_context.verify(plain_password, hashed_password)

# ---- USO MANUAL ----
if __name__ == "__main__":
    # Sustituye esto por tu contraseña en texto y el hash guardado en tu DB
    plain_password = input("Introduce la contraseña en texto plano: ")
    hashed_password = input("Introduce el hash guardado en la base de datos: ")

    if verify_password(plain_password, hashed_password):
        print("✅ La contraseña es correcta.")
    else:
        print("❌ La contraseña es incorrecta.")
