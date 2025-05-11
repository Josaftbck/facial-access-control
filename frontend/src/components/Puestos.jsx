import { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Puestos() {
  const [puestos, setPuestos] = useState([]);
  const [filtro, setFiltro] = useState('activos');
  const [form, setForm] = useState({ Name: '', Remarks: '' });
  const [editando, setEditando] = useState(false);
  const [codigoEditando, setCodigoEditando] = useState(null);

  const BASE_URL = 'http://localhost:8000/puestos';

  useEffect(() => {
    obtenerPuestos();
  }, [filtro]);

  const obtenerPuestos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}?estado=${filtro}`);
      setPuestos(res.data);
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
        await axios.put(`${BASE_URL}/${codigoEditando}`, form);
      } else {
        await axios.post(BASE_URL, form);
      }
      setForm({ Name: '', Remarks: '' });
      setEditando(false);
      setCodigoEditando(null);
      obtenerPuestos();
    } catch (error) {
      console.error('Error al guardar puesto:', error);
    }
  };

  const editarPuesto = (p) => {
    setForm({ Name: p.Name, Remarks: p.Remarks });
    setEditando(true);
    setCodigoEditando(p.jobTitle);
  };

  const eliminarPuesto = async (codigo) => {
    if (confirm('¿Estás seguro de desactivar este puesto?')) {
      try {
        await axios.put(`${BASE_URL}/${codigo}/desactivar`);
        obtenerPuestos();
      } catch (error) {
        console.error('Error al desactivar puesto:', error);
      }
    }
  };

  const restaurarPuesto = async (codigo) => {
    if (confirm('¿Deseas restaurar este puesto?')) {
      try {
        await axios.put(`${BASE_URL}/${codigo}/restaurar`);
        obtenerPuestos();
      } catch (error) {
        console.error('Error al restaurar puesto:', error);
      }
    }
  };

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">{editando ? 'Editar Puesto' : 'Crear Puesto'}</h2>

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            name="Name"
            value={form.Name}
            onChange={handleChange}
            className="form-control"
            placeholder="Nombre del puesto"
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

      {/* Filtro alineado bonito */}
      <div className="d-flex justify-content-between align-items-center mb-3 mt-5">
        <h3>Lista de Puestos</h3>
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
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => eliminarPuesto(p.jobTitle)}
                    >
                      Desactivar
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