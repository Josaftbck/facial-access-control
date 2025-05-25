import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ValidarAcceso() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [procesando, setProcesando] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [departamentoNombre, setDepartamentoNombre] = useState("Validación Automática de Acceso");
  const [barraColor, setBarraColor] = useState("transparent");
  const intervaloRef = useRef(null);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Este navegador no soporta acceso a la cámara.");
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => {
        console.error("No se pudo acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara.");
      });
  }, []);

  useEffect(() => {
    iniciarValidacionAutomatica();
    return detenerValidacion;
  }, []);

  const iniciarValidacionAutomatica = () => {
    if (!intervaloRef.current) {
      intervaloRef.current = setInterval(capturarYValidar, 3000);
    }
  };

  const detenerValidacion = () => {
    clearInterval(intervaloRef.current);
    intervaloRef.current = null;
  };

  const dibujarCuadro = (bbox, nombre) => {
    const overlay = overlayRef.current;
    if (!overlay || !bbox) return;

    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const [x1, y1, x2, y2] = bbox;
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 3;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

    ctx.fillStyle = 'lime';
    ctx.font = '16px Arial';
    ctx.fillText(nombre, x1, y1 - 8);
  };

  const capturarYValidar = async () => {
    if (procesando || !videoRef.current || !canvasRef.current) return;
    setProcesando(true);

    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const video = videoRef.current;

    canvas.width = overlay.width = video.videoWidth;
    canvas.height = overlay.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async blob => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("image", blob, "captura.jpg");

      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/validar`, formData);
        setDepartamentoNombre(`Bienvenido al departamento: ${res.data.departamento}`);

        if (res.data.estado === "ACCESO_CONCEDIDO") {
          dibujarCuadro(res.data.bbox, res.data.nombre);
          setBarraColor("green");
          toast.success(
            <div className=''> 
              <strong>ACCESO_CONCEDIDO</strong><br />
              <strong>Nombre:</strong> {res.data.nombre}<br />
              <strong>Puesto:</strong> {res.data.puesto}<br />
              <strong>Departamento:</strong> {res.data.departamento}
            </div>
          );
          setIntentosFallidos(0);
          detenerValidacion();
          setTimeout(() => {
            setProcesando(false);
            iniciarValidacionAutomatica();
          }, 10000);
        } else {
          overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height);

          if (res.data.estado === "INTENTE_NUEVAMENTE") {
            setBarraColor("yellow");
            toast.warn(
              <div>
                <strong>INTENTE NUEVAMENTE</strong><br />
                <strong>Motivo:</strong> {res.data.motivo}
              </div>
            );
          } else {
            setBarraColor("red");
            toast.error(
              <div>
                <strong>ACCESO_DENEGADO</strong><br />
                <strong>Departamento:</strong> {res.data.departamento}<br />
                <strong>Motivo:</strong> {res.data.motivo}
              </div>
            );

            if (res.data.motivo.includes("sin permiso")) {
              setIntentosFallidos(prev => {
                const nuevo = prev + 1;
                if (nuevo >= 3) {
                  setMostrarModal(true);
                  setTimeout(() => setMostrarModal(false), 7000);
                  return 0;
                }
                return nuevo;
              });
            }
          }
          setProcesando(false);
        }
      } catch (error) {
        console.error("Error en validación:", error);
        setProcesando(false);
      }
    }, "image/jpeg");
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={5000} />
      <h2 className="text-center">{departamentoNombre}</h2>

      <div className="d-flex justify-content-center align-items-start mt-4 flex-wrap">
        <div className="me-4 position-relative" style={{ width: '720px' }}>
          <video ref={videoRef} autoPlay muted className="border rounded" style={{ width: '100%' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <canvas
            ref={overlayRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          />
          <div style={{ height: '8px', backgroundColor: barraColor, transition: 'background-color 0.3s ease' }}></div>
          <p className="mt-2 text-center">Intentos fallidos: {intentos}</p>
        </div>
      </div>

      {mostrarModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-danger">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">🚨 Intrusión detectada</h5>
              </div>
              <div className="modal-body">
                Empleado reconocido ha excedido intentos fallidos para este departamento.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidarAcceso;