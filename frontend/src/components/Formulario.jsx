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
    <section className="login-container">
      <h1>User login</h1>

      <form className="formulario" onSubmit={manejarEnvio}>
        {error && <p className="error">Todos los campos son obligatorios</p>}

        <input
          type="text"
          placeholder="Nombre de usuario"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
        />
        <button type="submit">Iniciar sesión</button>
      </form>
    </section>
  );
}







