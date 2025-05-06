import { useEffect, useState } from 'react';
import axios from 'axios';

function Empleado() {
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

  const [puestos, setPuestos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [rostroCapturado, setRostroCapturado] = useState(false);
  const [estadoRegistro, setEstadoRegistro] = useState('Pending');
  const [activo, setActivo] = useState('Y');

  useEffect(() => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const capturarRostro = async () => {
    if (!form.firstName || !form.lastName) {
      alert("Primero llena el Nombre y Apellido del empleado.");
      return;
    }
    try {
      await axios.post('http://localhost:8000/empleados/capturar-rostro', {
        emp_id: '0', // Seguimos enviando 0 ya que es nuevo
        nombre: form.firstName + "_" + form.lastName,
      });
      setRostroCapturado(true);
      setEstadoRegistro('Registered');
      alert('✅ Rostro capturado y modelo entrenado. Ahora puedes registrar el empleado.');
    } catch (error) {
      console.error('Error al capturar rostro:', error);
      alert('Error al capturar rostro.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rostroCapturado) {
      alert("⚠️ Primero debes capturar y entrenar el rostro antes de registrar.");
      return;
    }

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }

    try {
      const res = await axios.post('http://localhost:8000/empleados/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(`Empleado registrado correctamente ✅\nID: ${res.data.empID}\nNombre: ${res.data.nombre_completo}`);
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
      setRostroCapturado(false);
      setEstadoRegistro('Pending');
      setActivo('Y');
    } catch (error) {
      console.error('Error al registrar empleado:', error);
      alert('Error al registrar empleado.');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📋 Registro de Empleado</h2>

      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">Sexo</label>
            <select name="sex" className="form-select" value={form.sex} onChange={handleChange}>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Tipo de Persona</label>
            <select name="type_emp" className="form-select" value={form.type_emp} onChange={handleChange}>
              <option value="E">Empleado</option>
              <option value="V">Visitante</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Puesto</label>
            <select name="jobTitle" className="form-select" value={form.jobTitle} onChange={handleChange} required>
              <option value="">Seleccione</option>
              {puestos.map((p) => (
                <option key={p.jobTitle} value={p.jobTitle}>{p.Name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Departamento</label>
            <select name="dept" className="form-select" value={form.dept} onChange={handleChange} required>
              <option value="">Seleccione</option>
              {departamentos.map((d) => (
                <option key={d.Code} value={d.Code}>{d.Name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="form-control"
              placeholder="Ej. 5555-5555"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-control"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <p><strong>🟢 Estado del Registro:</strong> {estadoRegistro}</p>
          </div>
          <div className="col-md-6">
            <p><strong>🟢 Activo:</strong> {activo === 'Y' ? 'Sí' : 'No'}</p>
          </div>
        </div>

        <div className="text-end">
          <button
            type="button"
            className="btn btn-primary px-4 me-2"
            onClick={capturarRostro}
          >
            Capturar Rostro
          </button>

          <button
            type="submit"
            className="btn btn-success px-4"
            disabled={!rostroCapturado}
          >
            Registrar Empleado
          </button>
        </div>
      </form>
    </div>
  );
}

export default Empleado;