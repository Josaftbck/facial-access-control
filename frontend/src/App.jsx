import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // ✅ Navbar exportado por default
import Departamentos from './components/Departamento'; // ✅ CRUD de departamentos
import Puestos from './components/Puestos'; // ✅ IMPORTA el componente Puestos
import Empleados from './components/Empleado';  
// import Empleados from './components/Empleados'; // 🔒 para futuro
import 'bootstrap/dist/css/bootstrap.min.css'; // ✅ Bootstrap activado

function App() {
  return (
    <Router>
      <Navbar /> {/* Menú fijo en todas las rutas */}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<h3>Bienvenido al sistema</h3>} />
          <Route path="/departamentos" element={<Departamentos />} />
          <Route path="/puestos" element={<Puestos />} /> {/* ✅ Nueva ruta */}
          <Route path="/empleados" element={<Empleados />} /> */
        </Routes>
      </div>
    </Router>
  );
}

export default App;