/**
 * Componente de barra lateral con enlaces de navegación.
 */
const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Menu Principal</h2>
      <ul>
        <li><a href="#">Dashboard</a></li>
        <li><a href="#">Empleados</a></li>
        <li><a href="#">Configuración</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;

