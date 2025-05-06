from fastapi import APIRouter
# from fastapi import UploadFile, File
# from fastapi.responses import JSONResponse
# from backend_fastapi_face_access.recognition.detector import recognize_face

router = APIRouter()

# Ruta para validar rostro (desactivada temporalmente)
# @router.post("/validate")
# async def validate_face(image: UploadFile = File(...)):
#     contents = await image.read()
#     result = recognize_face(contents)
#     return JSONResponse(content=result)