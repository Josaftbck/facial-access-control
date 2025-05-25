import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toast-position.css';
import { Modal, Button } from 'react-bootstrap';

function Empleado() {
  const videoRef = useRef(null);
  const [snapshot, setSnapshot] = useState(null);
  const [puestos, setPuestos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [validacionRostro, setValidacionRostro] = useState(null);
  const [colorAlerta, setColorAlerta] = useState('');
  const [showDuplicadoModal, setShowDuplicadoModal] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    sex: 'M',
    type_emp: 'E',
    jobTitle: '',
    dept: '',
    mobile: '',
    email: '',
  });

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      })
      .catch(err => console.error('Error al acceder a la cámara:', err));

    obtenerDepartamentos();
    obtenerPuestos();
  }, []);

  const obtenerDepartamentos = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/departamentos`);
      setDepartamentos(res.data);
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
    }
  };

  const obtenerPuestos = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/puestos`);
      setPuestos(res.data);
    } catch (error) {
      console.error('Error al obtener puestos:', error);
    }
  };

  const validarRostroAntesDeRegistrar = async (blob) => {
    const formData = new FormData();
    formData.append('image', blob, 'captura.jpg');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/empleados/validar-rostro`, formData);
      const data = res.data;

      if (data.estado === 'NO_DUPLICADO') {
        setColorAlerta('success');
        setValidacionRostro('✅ Rostro biométrico procesado con éxito');
        toast.success('✅ Rostro biométrico procesado con éxito');
      } else if (data.estado === 'DUPLICADO') {
        setColorAlerta('warning');
        setValidacionRostro(`⚠️ El rostro ya está registrado como: ${data.nombre_detectado}`);
        toast.warn(`⚠️ El rostro ya está registrado como: ${data.nombre_detectado}`);
      }
    } catch (error) {
      console.error('Error en validación biométrica previa:', error);
      setColorAlerta('danger');
      setValidacionRostro('❌ Error al validar rostro');
      toast.error('❌ Error al validar rostro');
    }
  };

  const tomarFoto = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      setSnapshot(blob);
      setValidacionRostro(null);
      setColorAlerta('');
      validarRostroAntesDeRegistrar(blob);
      toast.success('📸 Foto tomada con éxito');
    }, 'image/jpeg');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!snapshot) {
      toast.warn('📸 Por favor toma una foto antes de enviar.');
      return;
    }

    if (!/^[0-9]{8}$/.test(form.mobile)) {
      toast.warn('📱 El número de teléfono debe tener exactamente 8 dígitos.');
      return;
    }

    if (!form.email.includes('@') || !form.email.includes('.')) {
      toast.warn('📧 Ingrese un correo válido.');
      return;
    }

    const checkForm = new FormData();
    checkForm.append('email', form.email);
    checkForm.append('mobile', form.mobile);

    try {
      const resDup = await axios.post(
        `${import.meta.env.VITE_API_URL}/empleados/verificar-duplicados`,
        checkForm,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (resDup.data.email_duplicado) {
        toast.warn('📧 Este correo ya está registrado.');
        return;
      }

      if (resDup.data.mobile_duplicado) {
        toast.warn('📱 Este número ya está registrado.');
        return;
      }
    } catch (error) {
      console.error('Error al verificar duplicados:', error);
      toast.error('❌ Error al verificar duplicados');
      return;
    }

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    formData.append('image', snapshot, 'captured.jpg');

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/empleados`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = res.data;

      if (data.estado === 'REGISTERED') {
        toast.success(`✅ Empleado registrado: ${data.nombre_completo}`);
        setForm({
          firstName: '', lastName: '', sex: 'M', type_emp: 'E',
          jobTitle: '', dept: '', mobile: '', email: ''
        });
        setSnapshot(null);
        setValidacionRostro(null);
        setColorAlerta('');
      } else if (data.estado === 'REJECTED_DUPLICATE') {
        setShowDuplicadoModal(true);
      } else {
        toast.error('❌ Respuesta desconocida del servidor.');
      }
    } catch (error) {
      console.error('Error al registrar empleado:', error);
      toast.error('❌ Error al registrar empleado');
    }
  };

  return (
    <div className="container my-5">
      <ToastContainer
        position="top-right"
        className="toast-container-custom"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <h2 className="text-center mb-4">Registro de Empleado</h2>

      <div className="row">
        <div className="col-md-6 text-center mb-4">
          <video ref={videoRef} autoPlay className="border rounded w-100" />
          <div className="mt-2">
            <button type="button" className="btn btn-primary" onClick={tomarFoto}>
              Escanear Rostro
            </button>
            {validacionRostro && (
              <div className={`alert alert-${colorAlerta} mt-3`}>
                {validacionRostro}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-12">
              <label className="form-label">Nombre</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-12">
              <label className="form-label">Apellido</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-6">
              <label className="form-label">Sexo</label>
              <select name="sex" value={form.sex} onChange={handleChange} className="form-select">
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label">Tipo</label>
              <select name="type_emp" value={form.type_emp} onChange={handleChange} className="form-select">
                <option value="E">Empleado</option>
                <option value="V">Visitante</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Puesto</label>
              <select name="jobTitle" value={form.jobTitle} onChange={handleChange} className="form-select" required>
                <option value="">Seleccione Puesto</option>
                {puestos.map((p) => (
                  <option key={p.jobTitle} value={p.jobTitle}>{p.Name}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Departamento</label>
              <select name="dept" value={form.dept} onChange={handleChange} className="form-select" required>
                <option value="">Seleccione Departamento</option>
                {departamentos.map((d) => (
                  <option key={d.Code} value={d.Code}>{d.Name}</option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label">Teléfono</label>
              <input type="text" name="mobile" value={form.mobile} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-6">
              <label className="form-label">Correo</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" />
            </div>
            <div className="col-12">
              <button type="submit" className="btn btn-success w-100">
                Registrar Empleado
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal rostro duplicado */}
      <Modal show={showDuplicadoModal} onHide={() => setShowDuplicadoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Intento Duplicado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ⚠️ Este rostro ya está registrado en el sistema. El intento ha sido movido a la tabla de usuarios duplicados. No se permite registrar dos veces al mismo empleado.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDuplicadoModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Empleado;
