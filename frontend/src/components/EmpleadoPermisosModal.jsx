import { useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';

function EmpleadoPermisosModal({ show, handleClose, empleado, onPermisosActualizados }) {
  const [departamentos, setDepartamentos] = useState([]);
  const [accesos, setAccesos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    if (empleado && show) {
      cargarDepartamentos();
      cargarAccesos();
      cargarFoto();
    }
  }, [empleado, show]);

  const cargarDepartamentos = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/departamentos`);
      setDepartamentos(res.data);
    } catch (error) {
      console.error('Error cargando departamentos:', error);
    }
  };

  const cargarAccesos = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/accesos/empleado/${empleado.empID}`);
      const activos = res.data.filter((a) => a.is_active).map((a) => a.dept_code);
      setAccesos(activos);
    } catch (error) {
      console.error('Error cargando accesos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarFoto = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/empleados/${empleado.empID}/imagen`, { responseType: 'blob' });
      setFoto(URL.createObjectURL(res.data));
    } catch (error) {
      console.error('Error al cargar la foto del empleado:', error);
    }
  };

  const toggleAcceso = (codigo) => {
    if (accesos.includes(codigo)) {
      setAccesos(accesos.filter((id) => id !== codigo));
    } else {
      setAccesos([...accesos, codigo]);
    }
  };

  const guardarCambios = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/accesos/empleado/${empleado.empID}`, {
        emp_id: empleado.empID,
        access_list: accesos,
      });

      if (typeof onPermisosActualizados === 'function') {
        onPermisosActualizados(); // 🔔 Emitir evento al componente padre
      }

      handleClose();
    } catch (error) {
      console.error('❌ Error al guardar los accesos', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Accesos para: {empleado?.firstName} {empleado?.lastName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <div className="row">
            {/* Lado izquierdo */}
            <div className="col-md-4 text-center">
              {foto && (
                <img
                  src={foto}
                  alt="Foto del empleado"
                  className="img-fluid rounded mb-3"
                  style={{ maxHeight: '180px' }}
                />
              )}
              <h5>{empleado.firstName} {empleado.lastName}</h5>
              <p className="text-muted">{empleado.jobTitleName}</p>
            </div>

            {/* Lado derecho */}
            <div className="col-md-8">
              <h6>Permisos por Departamento</h6>
              <div className="row">
                {departamentos.map((dep) => (
                  <div key={dep.Code} className="col-sm-6">
                    <Form.Check
                      type="checkbox"
                      id={`dep-${dep.Code}`}
                      label={dep.Name}
                      checked={accesos.includes(dep.Code)}
                      onChange={() => toggleAcceso(dep.Code)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
        <Button variant="primary" onClick={guardarCambios}>Guardar</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EmpleadoPermisosModal;