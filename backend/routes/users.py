from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate, UserUpdate, UserInDB
from database.db import get_db
from datetime import datetime
from utils.security import hash_password
from sqlalchemy import func
import re

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/", response_model=UserInDB)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Verificar que no exista ya el USER_CODE
    db_user = db.query(User).filter(User.USER_CODE == user.USER_CODE).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User code already registered")
   
    # Validar formato del código (A seguido de 4 dígitos)
    if not re.match(r'^A\d{4}$', user.USER_CODE):
        raise HTTPException(status_code=400, detail="User code must be in format A0000")

    # Hashear la contraseña
    hashed_pw = hash_password(user.PASSWORD)

    # Obtener el siguiente USERID manualmente
    max_userid = db.query(func.max(User.USERID)).scalar()
    next_userid = (max_userid or 0) + 1

    # Crear nuevo usuario
    new_user = User(
        USERID=next_userid,
        **user.dict(exclude={"PASSWORD"}),
        PASSWORD=hashed_pw,
        createDate=datetime.now(),
        updateDate=datetime.now()
    )
   
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.get("/next-code", response_model=str)
def get_next_user_code(db: Session = Depends(get_db)):
    try:
        # Obtener el máximo valor de USER_CODE
        last_code = db.query(func.max(User.USER_CODE)).scalar()

        # Si no hay usuarios, comenzar desde "A0001"
        if not last_code:
            return "A0001"

        # Verificar si el último código tiene el formato correcto
        if not re.match(r'^A\d{4}$', last_code):
            # Si no tiene formato correcto, buscar el máximo numérico
            users = db.query(User.USER_CODE).all()
            numeric_codes = []
            for code in users:
                try:
                    if code[0] and code[0].startswith('A'):
                        numeric_part = int(code[0][1:])
                        numeric_codes.append(numeric_part)
                except (ValueError, IndexError, TypeError):
                    continue
            
            if numeric_codes:
                next_num = max(numeric_codes) + 1
            else:
                next_num = 1
        else:
            # Extraer la parte numérica del último código válido
            next_num = int(last_code[1:]) + 1

        # Formatear como A0001, A0002, etc.
        return f"A{next_num:04d}"
        
    except Exception as e:
        print(f"Error generating next code: {str(e)}")
        # Si hay algún error, devolver un código por defecto
        return "A0001"


@router.get("/", response_model=list[UserInDB])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(User).offset(skip).limit(limit).all()


@router.get("/{user_id}", response_model=UserInDB)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.USERID == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserInDB)
def update_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.USERID == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Verificar si el nuevo USER_CODE ya existe (para otro usuario)
    if user.USER_CODE and user.USER_CODE != db_user.USER_CODE:
        existing_user = db.query(User).filter(
            User.USER_CODE == user.USER_CODE,
            User.USERID != user_id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User code already in use by another user")

    update_data = user.dict(exclude_unset=True)
    update_data['updateDate'] = datetime.now()

    # Procesar contraseña solo si es válida y no vacía
    if "PASSWORD" in update_data and update_data["PASSWORD"]:
        update_data["PASSWORD"] = hash_password(update_data["PASSWORD"])
    else:
        update_data.pop("PASSWORD", None)

    # Manejo EXPLÍCITO del campo Locked
    if 'Locked' in update_data:
        # Validar que el valor sea Y o N
        if update_data['Locked'] not in ['Y', 'N']:
            raise HTTPException(status_code=400, detail="Locked must be either 'Y' or 'N'")
        db_user.Locked = update_data['Locked']
        update_data.pop('Locked')  # Lo eliminamos para no procesarlo dos veces

    # Actualizar los demás campos
    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user




@router.delete("/{user_id}", response_model=UserInDB)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.USERID == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
   
    db_user.Locked = 'Y'  # Bloquear en lugar de desactivar
    db_user.updateDate = datetime.now()
    db.commit()
    db.refresh(db_user)
    return db_user


