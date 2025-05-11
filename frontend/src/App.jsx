import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // ✅ Navbar exportado por default
import Departamentos from './components/Departamento'; // ✅ CRUD de departamentos
import Puestos from './components/Puestos'; // ✅ CRUD de puestos
import Empleados from './components/Empleado'; // ✅ Formulario de reconocimiento facial
import EmpleadosLista from './components/EmpleadosLista'; // ✅ Lista de empleados
import 'bootstrap/dist/css/bootstrap.min.css'; // ✅ Bootstrap activado

function App() {
  return (
    <Router>
      <Navbar /> {/* Menú fijo en todas las rutas */}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<h3>Bienvenido al sistema</h3>} />
          <Route path="/departamentos" element={<Departamentos />} />
          <Route path="/puestos" element={<Puestos />} />
          <Route path="/empleados" element={<Empleados />} /> {/* Formulario de reconocimiento */}
          <Route path="/empleados-lista" element={<EmpleadosLista />} /> {/* Lista de empleados */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;