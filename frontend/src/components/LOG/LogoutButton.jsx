// components/LogoutButton.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">
      Cerrar Sesión
    </button>
  );
}

export default LogoutButton;