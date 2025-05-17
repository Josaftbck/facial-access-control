import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Departamentos from './components/Departamento';
import Puestos from './components/Puestos';
import Empleados from './components/Empleado';
import EmpleadosLista from './components/EmpleadosLista';
import ValidadorAcceso from './components/ValidadorAcceso';
import Dispositivos from './components/Dispositivos';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<h3>Bienvenido al sistema</h3>} />
          <Route path="/departamentos" element={<Departamentos />} />
          <Route path="/puestos" element={<Puestos />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/empleados-lista" element={<EmpleadosLista />} />
          <Route path="/validar" element={<ValidadorAcceso />} />
          <Route path="/dispositivos" element={<Dispositivos />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;