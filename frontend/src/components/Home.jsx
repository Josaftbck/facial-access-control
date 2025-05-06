import React from "react";
import Sidebar from "./Sidebar";

/**
 * Componente principal de la vista una vez que el usuario ha iniciado sesión.
 * Muestra el nombre del usuario, botón de cerrar sesión y contenido del dashboard.
 */
export function Home({ user }) {
  // Cierra sesión eliminando los datos del usuario del localStorage
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload(); // Recarga la app para volver a la pantalla de login
  };

  return (
    <div className="home-container">
      <Sidebar />
      <div className="main-content">
        <h2>Bienvenido, {user.nombre}</h2>
        <button onClick={handleLogout}>Cerrar sesión</button>

        {/* Contenido principal que se muestra en el dashboard */}
        <div className="dashboard-content">
          <h3>Contenido de Dashboard o Selección</h3>
          <p>Elige una opción del menú de la izquierda para mostrar contenido aquí.</p>
        </div>
      </div>
    </div>
  );
}







  
