import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Empleado() {
  const videoRef = useRef(null);
  const [snapshot, setSnapshot] = useState(null);
  const [puestos, setPuestos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
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
      const res = await axios.get('http://localhost:8000/departamentos');
      setDepartamentos(res.data);
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
    }
  };

  const obtenerPuestos = async () => {
    try {
      const res = await axios.get('http://localhost:8000/puestos');
      setPuestos(res.data);
    } catch (error) {
      console.error('Error al obtener puestos:', error);
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
      alert('✅ Foto tomada con éxito');
    }, 'image/jpeg');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!snapshot) {
      alert("Por favor toma una foto antes de enviar.");
      return;
    }

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    formData.append('image', snapshot, 'captured.jpg');

    try {
      const res = await axios.post('http://localhost:8000/empleados/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = res.data;

      if (data.estado === 'REGISTERED') {
        alert(`✅ Empleado registrado correctamente\nID: ${data.empID}\nNombre: ${data.nombre_completo}`);
        setForm({
          firstName: '',
          lastName: '',
          sex: 'M',
          type_emp: 'E',
          jobTitle: '',
          dept: '',
          mobile: '',
          email: '',
        });
        setSnapshot(null);
      } else if (data.estado === 'REJECTED_DUPLICATE') {
        alert(`⚠️ El rostro coincide con el empleado ID ${data.empID_detectado} (${data.nombre_detectado}).\nEste intento fue registrado en el historial de DuplicateAttempts.`);
      } else {
        alert('❌ Respuesta desconocida del servidor.');
      }
    } catch (error) {
      console.error('Error al registrar empleado:', error);
      alert('❌ Error al registrar empleado. Revisa la consola para más detalles.');
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Registro de Empleado (con cámara)</h2>

      <div className="row">
        {/* Columna izquierda: cámara */}
        <div className="col-md-6 text-center mb-4">
          <video ref={videoRef} autoPlay className="border rounded w-100" />
          <div className="mt-2">
            <button type="button" className="btn btn-primary" onClick={tomarFoto}>
              📸 Tomar Foto
            </button>
          </div>
        </div>

        {/* Columna derecha: formulario */}
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
                ✅ Registrar Empleado
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Empleado;