import { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, ListGroup, Badge, Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function InicioDashboard() {
  const [resumen, setResumen] = useState(null);
  const [ultimos, setUltimos] = useState([]);
  const [modalTipo, setModalTipo] = useState(null);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [resResumen, resUltimos] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/eventos/resumen`),
          axios.get(`${import.meta.env.VITE_API_URL}/eventos/ultimos`)
        ]);
        setResumen(resResumen.data);
        setUltimos(resUltimos.data);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    };
    fetchDatos();
  }, []);

  const abrirModal = async (tipo) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/eventos/filtrar/${tipo}`);
      setEventosFiltrados(res.data);
      setModalTipo(tipo);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
    }
  };

  const cerrarModal = () => {
    setModalTipo(null);
    setEventosFiltrados([]);
  };

  const dataGrafico = resumen ? [
    { tipo: 'Exitosos', valor: resumen.exitosos },
    { tipo: 'Denegados', valor: resumen.fallidos },
    { tipo: 'Total', valor: resumen.total_eventos }
  ] : [];

  return (
    <div>
      <h3 className="mb-4">Bienvenido al panel administrativo</h3>

      <Row className="g-4 mb-4">
        <Col md={6} lg={4}>
          <Card className="shadow h-100">
            <Card.Body>
              <Card.Title>📋 Departamentos</Card.Title>
              <Card.Text>Gestiona los departamentos activos, eliminados y su información.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4}>
          <Card className="shadow h-100">
            <Card.Body>
              <Card.Title>👥 Empleados</Card.Title>
              <Card.Text>Visualiza la lista de empleados y asigna accesos por departamento.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4}>
          <Card className="shadow h-100">
            <Card.Body>
              <Card.Title>🔒 Validaciones</Card.Title>
              <Card.Text>Accede a los registros de intentos de acceso y actividad reciente.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h4 className="mb-3">Resumen de Hoy</h4>
      {cargando ? (
        <Spinner animation="border" />
      ) : resumen ? (
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card bg="success" text="white" className="shadow text-center" onClick={() => abrirModal('exitosos')} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <Card.Title>Exitosos</Card.Title>
                <h2>{resumen.exitosos}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card bg="danger" text="white" className="shadow text-center" onClick={() => abrirModal('denegados')} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <Card.Title> Denegados</Card.Title>
                <h2>{resumen.fallidos}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card bg="dark" text="white" className="shadow text-center" onClick={() => abrirModal('todos')} style={{ cursor: 'pointer' }}>
              <Card.Body>
                <Card.Title> Todos</Card.Title>
                <h2>{resumen.total_eventos}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <p>No se pudo cargar el resumen.</p>
      )}

      <Row className="g-4">
        <Col md={6}>
          <h4 className="mb-3">Últimos registros</h4>
          {ultimos.length === 0 ? (
            <p>No hay registros recientes.</p>
          ) : (
            <ListGroup>
              {ultimos.map((e, i) => (
                <ListGroup.Item key={i} className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-bold">{e.usuario}</div>
                    <small className="text-muted">{e.fecha}</small>
                    <div className="mt-2">
                      <Badge bg={e.resultado === "Exitoso" ? "success" : "danger"} className="me-2">
                        {e.resultado}
                      </Badge>
                      <Badge bg="secondary" className="me-2">Intentos: {e.intentos}</Badge>
                      <Badge bg="info" className="me-2">Depto: {e.departamento}</Badge>
                      <Badge bg="dark">Dispositivo: {e.dispositivo}</Badge>
                    </div>
                    {e.nota && (
                      <div className="mt-2 text-muted">
                        <small>📝 {e.nota}</small>
                      </div>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>

        <Col md={6}>
          <h4 className="mb-3">Estadísticas Visuales</h4>
          <Card className="shadow">
            <Card.Body>
              {resumen ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dataGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tipo" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="valor" fill="#0d6efd" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center">No disponible</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal dinámico para accesos */}
      <Modal show={modalTipo !== null} onHide={cerrarModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Registros — {modalTipo?.toUpperCase()}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <ListGroup>
            {eventosFiltrados.map((e, i) => (
              <ListGroup.Item key={i}>
                <div className="fw-bold">{e.usuario}</div>
                <div className="d-flex flex-wrap gap-2 mt-1">
                  <Badge bg={e.resultado === "Exitoso" ? "success" : "danger"}>{e.resultado}</Badge>
                  <Badge bg="secondary">Intentos: {e.intentos}</Badge>
                  <Badge bg="info">Depto: {e.departamento}</Badge>
                  <Badge bg="dark">Dispositivo: {e.dispositivo}</Badge>
                  <span className="text-muted">{e.fecha}</span>
                </div>
                {e.nota && (
                  <div className="text-muted mt-1"><small>📝 {e.nota}</small></div>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModal}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default InicioDashboard;