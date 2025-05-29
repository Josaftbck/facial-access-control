import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ValidadorAcceso from './components/ValidadorAcceso';
import DashboardApp from './components/DashboardApp';
import Login from './components/LOG/Login';
import ProtectedRoute from './utils/ProtectedRoute';

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
        {/* Ruta de login pública */}
        <Route path="/login" element={<Login />} />

        {/* Ruta principal protegida */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ValidadorAcceso />
            </ProtectedRoute>
          }
        />

        {/* Dashboard protegido */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
