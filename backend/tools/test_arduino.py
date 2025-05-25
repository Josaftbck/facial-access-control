import serial
import time

# Reemplaza con el puerto real de tu Arduino
PUERTO = '/dev/cu.usbserial-120'  # ⬅️ Verifica con `ls /dev/cu.*`
BAUDIOS = 9600

try:
    print(f"Conectando a Arduino en {PUERTO}...")
    arduino = serial.Serial(PUERTO, BAUDIOS, timeout=1)
    time.sleep(2)  # Espera que Arduino reinicie

    # Lista de comandos de prueba
    comandos = [
        "verde4",      # ✅ Abre puerta 1
        "rojo5",       # ❌ Deniega puerta 2
        "parpadear6",  # 🔁 Parpadea puerta 3
    ]

    for cmd in comandos:
        print(f"➡️ Enviando: {cmd}")
        arduino.write((cmd + '\n').encode())
        time.sleep(3)

    print("✅ Prueba finalizada.")

except Exception as e:
    print("❌ Error:", e)

finally:
    if 'arduino' in locals() and arduino.is_open:
        arduino.close()
        print("🔌 Conexión cerrada.")