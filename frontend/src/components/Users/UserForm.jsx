import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    USER_CODE: '',
    U_NAME: '',
    PASSWORD: '',
    E_Mail: '',
    Department: -2,
    Branch: -2,
    Locked: 'N',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [error, setError] = useState('');

  // Modifica el useEffect para manejar mejor los errores
useEffect(() => {
    if (id) {
        // Modo edición
        async function fetchUser() {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${id}`);
                setFormData({
                    USER_CODE: res.data.USER_CODE || '',
                    U_NAME: res.data.U_NAME || '',
                    PASSWORD: '',
                    E_Mail: res.data.E_Mail || '',
                    Department: res.data.Department ?? -2,
                    Branch: res.data.Branch ?? -2,
                    Locked: res.data.Locked ?? 'N', // Cambiar is_active por Locked
                });
            } catch (err) {
                console.error('Error loading user:', err);
                setError('Error al cargar el usuario');
            }
        }
        fetchUser();
    } else {
        // Modo creación
        async function fetchNextUserCode() {
            setIsLoadingCode(true);
            setError('');
            
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/next-code`, {
                    timeout: 5000 // 5 segundos de timeout
                });
                
                if (typeof res.data === 'string' && res.data.startsWith('A')) {
                    setFormData(prev => ({
                        ...prev,
                        USER_CODE: res.data
                    }));
                } else {
                    throw new Error('Formato de código inválido');
                }
            } catch (err) {
                console.error('Error generating code:', err);
                // Generar código localmente si el servidor falla
                const fallbackCode = 'A' + (Math.floor(Math.random() * 9000) + 1000);
                setFormData(prev => ({
                    ...prev,
                    USER_CODE: fallbackCode
                }));
                setError('El sistema generó un código automático');
            } finally {
                setIsLoadingCode(false);
            }
        }
        
        // Pequeño retraso para evitar race conditions
        const timer = setTimeout(() => {
            fetchNextUserCode();
        }, 300);
        
        return () => clearTimeout(timer);
    }
}, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value;
    
    if (type === 'checkbox') val = checked;
    else if (['Department', 'Branch'].includes(name)) val = value === '' ? '' : parseInt(value);

    setFormData(prev => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!id && !formData.PASSWORD) {
      setError('La contraseña es obligatoria al crear un usuario.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = { ...formData };
      if (id && !formData.PASSWORD) {
        delete payload.PASSWORD;
      }

      const baseUrl = `${import.meta.env.VITE_API_URL}/api/users`;

      if (id) {
        await axios.put(`${baseUrl}/${id}`, payload);
      } else {
        await axios.post(baseUrl, payload);
      }

      navigate('../users');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Error al guardar el usuario');
    } finally {
      setIsLoading(false);
    }
  };


  

  return (
    <div className="container mt-4">
      <h2>{id ? 'Editar' : 'Crear'} Usuario</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Código de Usuario</label>
          <input
            type="text"
            className="form-control"
            name="USER_CODE"
            value={formData.USER_CODE}
            onChange={handleChange}
            required
            disabled={!!id || isLoadingCode}
            placeholder={isLoadingCode ? "Generando código..." : ""}
          />
          {isLoadingCode && <small className="text-muted">Generando código automático...</small>}
        </div>

        <div className="mb-3">
          <label className="form-label">Nombre del Usuario</label>
          <input
            type="text"
            className="form-control"
            name="U_NAME"
            value={formData.U_NAME}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            {id ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
          </label>
          <input
            type="password"
            className="form-control"
            name="PASSWORD"
            value={formData.PASSWORD}
            onChange={handleChange}
            placeholder={id ? 'Dejar en blanco para no cambiar' : ''}
            required={!id}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="E_Mail"
            value={formData.E_Mail}
            onChange={handleChange}
          />
        </div>

        <input
          type="hidden"
          name="Department"
          value={formData.Department}
          onChange={handleChange}
        />

        <input
          type="hidden"
          name="Branch"
          value={formData.Branch}
          onChange={handleChange}
        />

<div className="mb-3 form-check">
  <input
    type="checkbox"
    className="form-check-input"
    name="Locked"
    checked={formData.Locked === 'N'}
    onChange={(e) => {
      setFormData({
        ...formData,
        Locked: e.target.checked ? 'N' : 'Y'
      });
    }}
    id="lockedCheck"
  />
  <label className="form-check-label" htmlFor="lockedCheck">
    Usuario Desbloqueado
  </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isLoading || (!id && isLoadingCode)}
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate('../users')}
          disabled={isLoading}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default UserForm;