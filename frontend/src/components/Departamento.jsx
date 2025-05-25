import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import './toast-position.css';

function Departamento() {
  const [departamentos, setDepartamentos] = useState([]);
  const [form, setForm] = useState({ Name: '', Remarks: '' });
  const [editando, setEditando] = useState(false);
  const [codigoEditando, setCodigoEditando] = useState(null);
  const [filtro, setFiltro] = useState('activos');
  const [showModal, setShowModal] = useState(false);
  const [codigoEliminar, setCodigoEliminar] = useState(null);

  const BASE_URL = `${import.meta.env.VITE_API_URL}/departamentos`;

  const buildURL = (path = '', estado = 'activos') => {
    return `${BASE_URL}${path ? `/${path}` : ''}?estado=${estado}`;
  };

  useEffect(() => {
    obtenerDepartamentos();
  }, [filtro]);

  const obtenerDepartamentos = async () => {
    try {
      const res = await axios.get(buildURL('', filtro));
      setDepartamentos(res.data);
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await axios.put(`${BASE_URL}/${codigoEditando}`, form);
        toast.success('Departamento actualizado correctamente');
      } else {
        await axios.post(BASE_URL, form);
        toast.success('Departamento registrado correctamente');
      }
      setForm({ Name: '', Remarks: '' });
      setEditando(false);
      setCodigoEditando(null);
      obtenerDepartamentos();
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar el departamento');
    }
  };

  const editarDepartamento = (dept) => {
    setForm({ Name: dept.Name, Remarks: dept.Remarks });
    setEditando(true);
    setCodigoEditando(dept.Code);
  };

  const confirmarEliminar = (codigo) => {
    setCodigoEliminar(codigo);
    setShowModal(true);
  };

  const eliminarDepartamento = async () => {
    try {
      await axios.delete(`${BASE_URL}/${codigoEliminar}`);
      toast.info('Departamento eliminado');
      obtenerDepartamentos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el departamento');
    } finally {
      setShowModal(false);
    }
  };

  const restaurarDepartamento = async (codigo) => {
    try {
      await axios.put(`${BASE_URL}/${codigo}/restaurar`);
      toast.success('Departamento restaurado');
      obtenerDepartamentos();
    } catch (error) {
      console.error('Error al restaurar:', error);
      toast.error('Error al restaurar el departamento');
    }
  };

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  return (
    <div className="container mt-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        className="toast-container-custom"
      />

      <h2 className="mb-4">{editando ? 'Editar' : 'Crear'} Departamento</h2>

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            name="Name"
            value={form.Name}
            onChange={handleChange}
            className="form-control"
            placeholder="Nombre"
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Observaciones</label>
          <input
            type="text"
            name="Remarks"
            value={form.Remarks}
            onChange={handleChange}
            className="form-control"
            placeholder="Observaciones"
          />
        </div>
        <div className="col-12">
          <button type="submit" className={`btn ${editando ? 'btn-warning' : 'btn-primary'}`}>
            {editando ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>

      <div className="d-flex justify-content-between align-items-center mt-5 flex-wrap">
        <h3 className="mb-3 mb-md-0">Departamentos Registrados</h3>
        <select className="form-select w-auto" value={filtro} onChange={handleFiltroChange}>
          <option value="activos">Activos</option>
          <option value="eliminados">Eliminados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <div className="table-responsive mt-3">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Observaciones</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {departamentos.map((d) => (
              <tr key={d.Code}>
                <td>{d.Code}</td>
                <td>{d.Name}</td>
                <td>{d.Remarks}</td>
                <td>{d.Active ? 'Activo' : 'Inactivo'}</td>
                <td>
                  {d.Active ? (
                    <>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => editarDepartamento(d)}>
                        Editar
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => confirmarEliminar(d.Code)}>
                        Eliminar
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-sm btn-success" onClick={() => restaurarDepartamento(d.Code)}>
                      Restaurar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de eliminar este departamento?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={eliminarDepartamento}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Departamento;