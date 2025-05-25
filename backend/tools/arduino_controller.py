# tools/arduino_controller.py
import serial
import time

# 📌 Mapeo de puertos a Arduinos
PUERTOS = {
    1: '/dev/cu.usbserial-120',  # Arduino A (puertas 4, 5, 6)
    2: '/dev/cu.usbserial-140'   # Arduino B (puertas 7, 8, 9)
}

BAUDIOS = 9600

# 📌 Diccionario de conexiones seriales activas
arduinos = {}

# 🔁 Inicializar todos los Arduinos definidos
for arduino_id, puerto in PUERTOS.items():
    try:
        print(f"🔌 Conectando a Arduino {arduino_id} en {puerto}...")
        arduino = serial.Serial(puerto, BAUDIOS, timeout=1)
        time.sleep(2)
        arduino.flush()
        arduinos[arduino_id] = arduino
        print(f"✅ Arduino {arduino_id} conectado.")
    except Exception as e:
        print(f"❌ Error al conectar con Arduino {arduino_id}: {e}")
        arduinos[arduino_id] = None

def enviar_comando_puerta(puerta: int, tipo: str):
    """
    Envía un comando al Arduino correcto según la puerta.
    tipo puede ser: 'verde', 'rojo', 'parpadear', 'alerta'
    """
    if tipo not in ["verde", "rojo", "parpadear", "alerta"]:
        print("❌ Tipo de comando inválido:", tipo)
        return

    # 🧠 Determinar a qué Arduino corresponde la puerta
    if puerta in [4, 5, 6]:
        arduino_id = 1
    elif puerta in [7, 8, 9]:
        arduino_id = 2
    else:
        print(f"❌ Puerta {puerta} fuera de rango (solo 4–9).")
        return

    arduino = arduinos.get(arduino_id)
    if not arduino or not arduino.is_open:
        print(f"❌ Arduino {arduino_id} no está conectado.")
        return

    comando = f"{tipo}{puerta}\n"
    try:
        arduino.write(comando.encode())
        print(f"✅ Enviado a Arduino {arduino_id}: {comando.strip()}")
    except Exception as e:
        print(f"❌ Error al enviar comando: {e}")