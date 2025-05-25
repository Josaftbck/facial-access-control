import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ValidadorAcceso from './components/ValidadorAcceso';
import DashboardApp from './components/DashboardApp';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './components/toast-position.css';

function App() {
  return (
    <Router>
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

      <Routes>
        {/* Ruta principal: Solo validador de acceso */}
        <Route path="/" element={<ValidadorAcceso />} />

        {/* Ruta separada para dashboard administrativo */}
        <Route path="/dashboard/*" element={<DashboardApp />} />
      </Routes>
    </Router>
  );
}

export default App;