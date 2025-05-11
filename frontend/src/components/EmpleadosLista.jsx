import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';

function EmpleadosLista() {
  const [empleados, setEmpleados] = useState([]);
  const [filtro, setFiltro] = useState('activos');
  const [fotoModal, setFotoModal] = useState(null);
  const [showFotoModal, setShowFotoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModal, setEditModal] = useState({
    empID: null, firstName: '', lastName: '', sex: 'M', type_emp: 'E',
    jobTitle: '', dept: '', mobile: '', email: ''
  });
  const [puestos, setPuestos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);

  const BASE_URL = 'http://localhost:8000/empleados';
  const PUESTOS_URL = 'http://localhost:8000/puestos';
  const DEPTOS_URL = 'http://localhost:8000/departamentos';

  useEffect(() => {
    obtenerEmpleados();
    obtenerPuestos();
    obtenerDepartamentos();
  }, [filtro]);

  const obtenerEmpleados = async () => {
    try {
      const res = await axios.get(`${BASE_URL}?estado=${filtro}`);
      setEmpleados(res.data);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
    }
  };

  const obtenerPuestos = async () => {
    try {
      const res = await axios.get(`${PUESTOS_URL}?estado=activos`);
      setPuestos(res.data);
    } catch (error) {
      console.error('Error al obtener puestos:', error);
    }
  };

  const obtenerDepartamentos = async () => {
    try {
      const res = await axios.get(`${DEPTOS_URL}?estado=activos`);
      setDepartamentos(res.data);
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
    }
  };

  const verFotoEmpleado = async (empID) => {
    try {
      const res = await axios.get(`${BASE_URL}/${empID}/imagen`, { responseType: 'blob' });
      const imageUrl = URL.createObjectURL(res.data);
      setFotoModal(imageUrl);
      setShowFotoModal(true);
    } catch (error) {
      console.error('Error al obtener la foto del empleado:', error);
    }
  };

  const abrirEditarModal = (emp) => {
    setEditModal({
      empID: emp.empID,
      firstName: emp.firstName,
      lastName: emp.lastName,
      sex: emp.sex,
      type_emp: emp.type_emp,
      jobTitle: emp.jobTitle,
      dept: emp.dept,
      mobile: emp.mobile,
      email: emp.email
    });
    setShowEditModal(true);
  };

  const guardarCambiosEmpleado = async () => {
    try {
      const formData = new FormData();
      Object.entries(editModal).forEach(([key, value]) => {
        if (key !== 'empID') formData.append(key, value);
      });

      await axios.put(`${BASE_URL}/${editModal.empID}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      obtenerEmpleados();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error al guardar cambios del empleado:', error);
    }
  };

  const desactivarEmpleado = async (empID) => {
    if (confirm('¿Estás seguro de desactivar este empleado?')) {
      try {
        await axios.put(`${BASE_URL}/${empID}/desactivar`);
        obtenerEmpleados();
      } catch (error) {
        console.error('Error al desactivar empleado:', error);
      }
    }
  };

  const restaurarEmpleado = async (empID) => {
    if (confirm('¿Deseas restaurar este empleado?')) {
      try {
        await axios.put(`${BASE_URL}/${empID}/restaurar`);
        obtenerEmpleados();
      } catch (error) {
        console.error('Error al restaurar empleado:', error);
      }
    }
  };

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Lista de Empleados</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Empleados Registrados</h3>
        <select className="form-select w-auto" value={filtro} onChange={handleFiltroChange}>
          <option value="activos">Activos</option>
          <option value="eliminados">Eliminados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((emp) => (
            <tr key={emp.empID}>
              <td>{emp.empID}</td>
              <td>{emp.firstName}</td>
              <td>{emp.lastName}</td>
              <td>{emp.type_emp === 'E' ? 'Empleado' : 'Visitante'}</td>
              <td>{emp.Active === 'Y' ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button className="btn btn-sm btn-info me-2" onClick={() => verFotoEmpleado(emp.empID)}>
                  Ver Foto
                </button>
                <button className="btn btn-sm btn-warning me-2" onClick={() => abrirEditarModal(emp)}>
                  Editar
                </button>
                {emp.Active === 'Y' ? (
                  <button className="btn btn-sm btn-danger" onClick={() => desactivarEmpleado(emp.empID)}>
                    Desactivar
                  </button>
                ) : (
                  <button className="btn btn-sm btn-success" onClick={() => restaurarEmpleado(emp.empID)}>
                    Restaurar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para mostrar la foto */}
      <Modal show={showFotoModal} onHide={() => setShowFotoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Foto del Empleado</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {fotoModal && <img src={fotoModal} alt="Foto empleado" className="img-fluid" />}
        </Modal.Body>
      </Modal>

      {/* Modal para editar todos los datos */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Empleado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              value={editModal.firstName}
              onChange={(e) => setEditModal({ ...editModal, firstName: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              value={editModal.lastName}
              onChange={(e) => setEditModal({ ...editModal, lastName: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Sexo</Form.Label>
            <Form.Select
              value={editModal.sex}
              onChange={(e) => setEditModal({ ...editModal, sex: e.target.value })}
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              value={editModal.type_emp}
              onChange={(e) => setEditModal({ ...editModal, type_emp: e.target.value })}
            >
              <option value="E">Empleado</option>
              <option value="V">Visitante</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Puesto</Form.Label>
            <Form.Select
              value={editModal.jobTitle}
              onChange={(e) => setEditModal({ ...editModal, jobTitle: e.target.value })}
            >
              <option value="">Seleccione Puesto</option>
              {puestos.map((p) => (
                <option key={p.jobTitle} value={p.jobTitle}>{p.Name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Departamento</Form.Label>
            <Form.Select
              value={editModal.dept}
              onChange={(e) => setEditModal({ ...editModal, dept: e.target.value })}
            >
              <option value="">Seleccione Departamento</option>
              {departamentos.map((d) => (
                <option key={d.Code} value={d.Code}>{d.Name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              value={editModal.mobile}
              onChange={(e) => setEditModal({ ...editModal, mobile: e.target.value })}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Correo</Form.Label>
            <Form.Control
              type="email"
              value={editModal.email}
              onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarCambiosEmpleado}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default EmpleadosLista;