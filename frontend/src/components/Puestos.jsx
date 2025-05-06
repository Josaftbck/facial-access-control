import { useEffect, useState } from 'react';
import axios from 'axios';

function Puestos() {
  const [puestos, setPuestos] = useState([]);
  const [form, setForm] = useState({ Name: '', Remarks: '' });
  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [filtro, setFiltro] = useState('activos'); // 👈 Guardamos el filtro actual

  const URL = 'http://localhost:8000/puestos';

  useEffect(() => {
    obtenerPuestos(); // Al cargar, trae los activos por defecto
  }, []);

  const obtenerPuestos = async (estado = 'activos') => {
    try {
      const res = await axios.get(`${URL}?estado=${estado}`);
      setPuestos(res.data);
      setFiltro(estado); // Guardamos qué filtro está activo para saber si desactivar el form, por ejemplo
    } catch (error) {
      console.error('Error al obtener puestos:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await axios.put(`${URL}/${idEditando}`, form);
      } else {
        await axios.post(URL, form);
      }
      setForm({ Name: '', Remarks: '' });
      setEditando(false);
      setIdEditando(null);
      obtenerPuestos(filtro); // 👈 Refrescamos la lista en el estado actual
    } catch (error) {
      console.error('Error al guardar puesto:', error);
    }
  };

  const editarPuesto = (p) => {
    setForm({ Name: p.Name, Remarks: p.Remarks });
    setEditando(true);
    setIdEditando(p.jobTitle);
  };

  const eliminarPuesto = async (id) => {
    if (confirm('¿Eliminar este puesto?')) {
      try {
        await axios.delete(`${URL}/${id}`);
        obtenerPuestos(filtro); // 👈 Refrescamos la lista en el estado actual
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const restaurarPuesto = async (id) => {
    if (confirm('¿Restaurar este puesto?')) {
      try {
        await axios.put(`${URL}/${id}/restaurar`);
        obtenerPuestos(filtro); // 👈 Refrescamos la lista en el estado actual
      } catch (error) {
        console.error('Error al restaurar:', error);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>{editando ? 'Editar' : 'Crear'} Puesto</h2>

      {/* ✅ Filtro */}
      <div className="mt-3 mb-3">
        <label>Filtrar: </label>
        <select
          className="form-select w-auto d-inline-block ms-2"
          onChange={(e) => obtenerPuestos(e.target.value)}
          value={filtro}
        >
          <option value="activos">Activos</option>
          <option value="eliminados">Eliminados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {/* ✅ Formulario */}
      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Nombre"
            name="Name"
            value={form.Name}
            onChange={handleChange}
            required
            disabled={filtro === 'eliminados'} // Desactiva si estamos viendo eliminados
          />
        </div>
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Observaciones"
            name="Remarks"
            value={form.Remarks}
            onChange={handleChange}
            disabled={filtro === 'eliminados'} // Desactiva si estamos viendo eliminados
          />
        </div>
        <div className="col-12">
          <button
            type="submit"
            className={`btn ${editando ? 'btn-warning' : 'btn-primary'}`}
            disabled={filtro === 'eliminados'} // Desactiva si estamos viendo eliminados
          >
            {editando ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>

      {/* ✅ Tabla */}
      <h3 className="mt-5">Lista de Puestos</h3>
      <table className="table table-bordered mt-3">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Observaciones</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {puestos.map((p) => (
            <tr key={p.jobTitle}>
              <td>{p.jobTitle}</td>
              <td>{p.Name}</td>
              <td>{p.Remarks}</td>
              <td>
                {p.Active ? (
                  <>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => editarPuesto(p)}
                      disabled={filtro === 'eliminados'}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => eliminarPuesto(p.jobTitle)}
                      disabled={filtro === 'eliminados'}
                    >
                      Eliminar
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => restaurarPuesto(p.jobTitle)}
                  >
                    Restaurar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Puestos;