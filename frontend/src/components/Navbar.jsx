import { Navbar, Nav, Container } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

function AppNavbar() {
  return (
    <Navbar bg="dark" expand="lg" variant="dark" className='fixed-top'>
      <Container>
        <Navbar.Brand as={NavLink} to="/dashboard">
          Seguridad Global
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/dashboard" end>
              Inicio
            </Nav.Link>
            <Nav.Link as={NavLink} to="/dashboard/departamentos">
              Departamentos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/dashboard/puestos">
              Puestos
            </Nav.Link>
            <Nav.Link as={NavLink} to="/dashboard/empleados-lista">
              Empleados
            </Nav.Link>
            <Nav.Link as={NavLink} to="/dashboard/empleados">
              Registro Biometrico
            </Nav.Link>

            <Nav.Link as={NavLink} to="/dashboard/dispositivos">
              Dispositivos
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;