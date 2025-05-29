import { Navbar, Nav, Container } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import LogoutButton from './LOG/LogoutButton'; // Importa el componente LogoutButton
import { useAuth } from '../context/AuthContext'; // Opcional: para mostrar el nombre de usuario

function AppNavbar() {
    const { user } = useAuth(); // Opcional: para mostrar información del usuario
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
            <Nav.Link as={NavLink} to="/dashboard/users">
              Lista de Usuarios
            </Nav.Link>

            {/* Opcional: Mostrar información del usuario */}
            {user && (
              <Nav.Item className="text-light d-flex align-items-center px-3">
                <span>Hola, {user.username}</span>
              </Nav.Item>
            )}
             {/* Botón de cerrar sesión */}
            <Nav.Item>
              <LogoutButton />
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;