import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Departamentos from "./Departamento";
import Puestos from "./Puestos";
import Empleados from "./Empleado";
import EmpleadosLista from "./EmpleadosLista";
import Dispositivos from "./Dispositivos";
import InicioDashboard from "./InicioDashboard";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DashboardApp() {
  return (
    <>
      <Navbar />

      <ToastContainer
        position="top-right"
        className="toast-container-custom"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<InicioDashboard />} /> {/* ✅ Ruta base */}
          <Route path="departamentos" element={<Departamentos />} />
          <Route path="puestos" element={<Puestos />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="empleados-lista" element={<EmpleadosLista />} />
          <Route path="dispositivos" element={<Dispositivos />} />
        </Routes>
      </div>
    </>
  );
}

export default DashboardApp;