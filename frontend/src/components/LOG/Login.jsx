import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './Login.css'; // Importa el archivo CSS
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      login({
        token: response.data.access_token,
        user: { username }
      });
      
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Bienvenido</h2>
          <p>Ingresa tus credenciales para continuar</p>
        </div>
        
        <div className="login-body">
          {error && (
            <div className="alert alert-danger error-message">
              {error}
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <FaUser className="me-2" />
                Usuario
              </label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Ingresa tu usuario"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <FaLock className="me-2" />
                Contraseña
              </label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Ingresa tu contraseña"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary login-btn w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Cargando...</span>
              ) : (
                <>
                  <FaSignInAlt className="me-2" />
                  Ingresar
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="login-footer">
          <p>¿Problemas para ingresar? <a href="#">Contacta al administrador</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;