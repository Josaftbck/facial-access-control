import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';



function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const BASE_URL = `${import.meta.env.VITE_API_URL}`;
        const response = await axios.get(`${BASE_URL}/api/users`);
        console.log("Respuesta de API:", response.data);
        setUsers(response.data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar usuarios');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="text-center mt-4">Cargando...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;


const handleBlockUser = async (userId) => {
  try {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
      Locked: 'Y'
    });
    // Actualizar la lista de usuarios
    const updatedUsers = users.map(user => 
      user.USERID === userId ? {...user, Locked: 'Y'} : user
    );
    setUsers(updatedUsers);
  } catch (err) {
    console.error('Error al bloquear usuario:', err);
    setError('Error al bloquear usuario');
  }
};

const handleUnblockUser = async (userId) => {
  try {
    await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
      Locked: 'N'
    });
    // Actualizar la lista de usuarios
    const updatedUsers = users.map(user => 
      user.USERID === userId ? {...user, Locked: 'N'} : user
    );
    setUsers(updatedUsers);
  } catch (err) {
    console.error('Error al desbloquear usuario:', err);
    setError('Error al desbloquear usuario');
  }
};



  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Lista de Usuarios</h2>
        <Link to="new" className="btn btn-success">
          Crear Usuario
        </Link>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Bloqueado</th>
            <th>Último Login</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.USERID}>
              <td>{user.USER_CODE}</td>
              <td>{user.U_NAME}</td>
              <td>{user.E_Mail || '-'}</td>
              <td>
                <span className={`badge ${user.Locked === 'N' ? 'bg-success' : 'bg-danger'}`}>
                  {user.Locked === 'N' ? 'No' : 'Sí'}
                </span>
              </td>
              <td>
                {user.lastLogin ? 
                  new Date(user.lastLogin).toLocaleString() : 
                  'Nunca'}
              </td>
              <td>
                <Link to={`${user.USERID}`} className="btn btn-sm btn-primary me-2">
                  Editar
                </Link>
                {user.Locked === 'N' ? (
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => handleBlockUser(user.USERID)}
                  >
                    Bloquear
                  </button>
                ) : (
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handleUnblockUser(user.USERID)}
                  >
                    Desbloquear
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;
