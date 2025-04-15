import "./Formulario.css";
import { useState } from "react";

/**
 * Componente de formulario de inicio de sesión.
 * Permite al usuario ingresar su nombre y contraseña para iniciar sesión.
 */
export function Formulario({ setUser }) {
  const [nombre, setNombre] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState(false);

  // Maneja el envío del formulario
  const manejarEnvio = (e) => {
    e.preventDefault();

    // Validar que los campos no estén vacíos
    if (nombre.trim() === "" || contraseña.trim() === "") {
      setError(true);
      return;
    }

    // Si los datos son válidos, se guarda el usuario
    setError(false);
    setUser({ nombre });
    console.log("Inicio de sesión exitoso:", nombre);
  };

  return (
    <div className="container">
      <div className="login-container">

        <form onSubmit={manejarEnvio}>
          <h2>User login</h2>

          {error && <p className="error">Todos los campos son obligatorios</p>}

          <div class="input-box">
            
            <input
              type="text"
              required="required"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <label>Nombre de usuario</label>
            <div class="input-line"></div>
          </div>

          <div class="input-box">
            <input
              type="password"
              required="required"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
            />
            <label>Contraseña</label>
            <div class="input-line"></div>
          </div>

          <button className="login-button" type="submit">Iniciar sesión</button>
        </form>
      </div>
    </div>
  );
}