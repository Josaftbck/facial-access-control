import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dispositivos() {
  const [dispositivos, setDispositivos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const [formulario, setFormulario] = useState({
    DeviceName: '',
    DeviceType: 'Cámara',
    Department_d: '',
    IPAddress: '',
    MACAddress: '',
    Notes: ''
  });

  const obtenerDispositivos = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/devices`);
      let data = res.data;
      if (filtroEstado === "activos") {
        data = data.filter(d => d.Status === "Activo");
      } else if (filtroEstado === "inactivos") {
        data = data.filter(d => d.Status === "Inactivo");
      }
      setDispositivos(data);
    } catch (error) {
      toast.error("❌ Error al obtener dispositivos");
      console.error("Error obteniendo dispositivos", error);
    }
  };

  const obtenerDepartamentos = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/departamentos`);
    setDepartamentos(res.data);
  };

  useEffect(() => {
    obtenerDispositivos();
    obtenerDepartamentos();
  }, [filtroEstado]);

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("DeviceName", formulario.DeviceName);
      formData.append("DeviceType", formulario.DeviceType);
      formData.append("Department_d", formulario.Department_d);
      formData.append("IPAddress", formulario.IPAddress);
      formData.append("MACAddress", formulario.MACAddress);
      formData.append("Notes", formulario.Notes);
      formData.append("Status", "Activo");

      if (editando) {
        await axios.put(`${import.meta.env.VITE_API_URL}/devices/${editando}`, formData);
        toast.success(" Dispositivo actualizado correctamente");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/devices`, formData);
        toast.success(" Dispositivo registrado correctamente");
      }

      setShowModal(false);
      obtenerDispositivos();
      setFormulario({
        DeviceName: '',
        DeviceType: 'Cámara',
        Department_d: '',
        IPAddress: '',
        MACAddress: '',
        Notes: ''
      });
      setEditando(null);
    } catch (error) {
      toast.error("❌ Error al guardar dispositivo");
      console.error(error);
    }
  };

  const editarDispositivo = (dispositivo) => {
    setFormulario({
      DeviceName: dispositivo.DeviceName,
      DeviceType: dispositivo.DeviceType,
      Department_d: dispositivo.Department_d,
      IPAddress: dispositivo.IPAddress,
      MACAddress: dispositivo.MACAddress,
      Notes: dispositivo.Notes || ''
    });
    setEditando(dispositivo.DeviceID);
    setShowModal(true);
  };

  const desactivarDispositivo = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/devices/${id}`);
      toast.info(" Dispositivo desactivado");
      obtenerDispositivos();
    } catch (error) {
      toast.error("❌ Error al desactivar dispositivo");
      console.error(error);
    }
  };

  const restaurarDispositivo = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/devices/${id}/restaurar`);
      toast.success("Dispositivo restaurado correctamente");
      obtenerDispositivos();
    } catch (error) {
      toast.error("❌ Error al restaurar dispositivo");
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} className="toast-container-custom" />

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3>Dispositivos Registrados</h3>
        <Form.Select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{ maxWidth: "200px" }}
        >
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
          <option value="todos">Todos</option>
        </Form.Select>
      </div>

      <Button onClick={() => { setShowModal(true); setEditando(null); }}>+ Agregar dispositivo</Button>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Departamento</th>
            <th>IP</th>
            <th>MAC</th>
            <th>Estado</th>
            <th>Registrado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {dispositivos.map((d) => (
            <tr key={d.DeviceID}>
              <td>{d.DeviceID}</td>
              <td>{d.DeviceName}</td>
              <td>{d.DeviceType}</td>
              <td>{departamentos.find(dep => String(dep.Code) === String(d.Department_d))?.Name || "Desconocido"}</td>
              <td>{d.IPAddress}</td>
              <td>{d.MACAddress}</td>
              <td>{d.Status}</td>
              <td>{new Date(d.RegisteredAt).toLocaleString()}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => editarDispositivo(d)}>Editar</Button>
                {d.Status === "Activo" ? (
                  <Button variant="danger" size="sm" onClick={() => desactivarDispositivo(d.DeviceID)}>Desactivar</Button>
                ) : (
                  <Button variant="success" size="sm" onClick={() => restaurarDispositivo(d.DeviceID)}>Restaurar</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editando ? "Editar dispositivo" : "Registrar nuevo dispositivo"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nombre del dispositivo</Form.Label>
              <Form.Control name="DeviceName" value={formulario.DeviceName} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Tipo</Form.Label>
              <Form.Select name="DeviceType" value={formulario.DeviceType} onChange={handleChange}>
                <option value="Cámara">Cámara</option>
                <option value="Lector Huella">Lector Huella</option>
                <option value="Otro">Otro</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Departamento</Form.Label>
              <Form.Select name="Department_d" value={formulario.Department_d} onChange={handleChange}>
                <option value="">Seleccione departamento</option>
                {departamentos.map((d) => (
                  <option key={d.Code} value={d.Code}>{d.Name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>IP Address</Form.Label>
              <Form.Control name="IPAddress" value={formulario.IPAddress} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>MAC Address</Form.Label>
              <Form.Control name="MACAddress" value={formulario.MACAddress} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Notas</Form.Label>
              <Form.Control name="Notes" value={formulario.Notes} onChange={handleChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>{editando ? "Actualizar" : "Guardar"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Dispositivos;