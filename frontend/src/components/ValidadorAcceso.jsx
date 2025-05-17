// ✅ ValidadorAccesoAuto.jsx
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function ValidadorAccesoAuto() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [resultado, setResultado] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const intervaloRef = useRef(null);

  const obtenerIP = async () => {
    try {
      const res = await axios.get('https://api.ipify.org?format=json');
      return res.data.ip;
    } catch (error) {
      console.error('No se pudo obtener la IP:', error);
      return null;
    }
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error('No se pudo acceder a la cámara:', err));
  }, []);

  useEffect(() => {
    intervaloRef.current = setInterval(() => {
      capturarYValidar();
    }, 3000);
    return () => clearInterval(intervaloRef.current);
  }, []);

  const capturarYValidar = async () => {
    if (procesando || !videoRef.current || !canvasRef.current) return;
    setProcesando(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const ip = await obtenerIP();
      if (!ip) {
        setProcesando(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', blob, 'captura.jpg');
      formData.append('ip', ip);

      try {
        const res = await axios.post('http://localhost:8000/validar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data.estado === 'ACCESO_CONCEDIDO') {
          setResultado({
            nombre: res.data.nombre,
            puesto: res.data.puesto,
            departamento: res.data.departamento,
            estado: '✅ Acceso concedido',
            color: 'success',
          });
          clearInterval(intervaloRef.current);
        } else {
          setResultado({
            estado: '❌ Acceso denegado',
            motivo: res.data.motivo,
            color: 'danger',
          });
          setIntentos(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error en validación:', error);
      } finally {
        setProcesando(false);
      }
    }, 'image/jpeg');
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Validación Automática de Acceso</h2>
      <div className="text-center">
        <video ref={videoRef} autoPlay className="border rounded w-75" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <p className="mt-3">Intentos: {intentos}</p>
      </div>

      {resultado && (
        <div className={`alert alert-${resultado.color} mt-3`}>
          <h4>{resultado.estado}</h4>
          {resultado.nombre && <p><strong>Nombre:</strong> {resultado.nombre}</p>}
          {resultado.puesto && <p><strong>Puesto:</strong> {resultado.puesto}</p>}
          {resultado.departamento && <p><strong>Departamento:</strong> {resultado.departamento}</p>}
          {resultado.motivo && <p><strong>Motivo:</strong> {resultado.motivo}</p>}
        </div>
      )}
    </div>
  );
}

export default ValidadorAccesoAuto;