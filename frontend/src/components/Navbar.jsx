import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">Seguridad Global</NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Inicio
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/departamentos">
                Departamentos
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/puestos">
                Puestos
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/empleados">
                Empleados
              </NavLink>
            </li>
            {/* Agregá más rutas aquí según avances */}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;