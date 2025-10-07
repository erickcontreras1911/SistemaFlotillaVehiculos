import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronRight,
  FaUserTie,
  FaCar,
  FaFileAlt,
  FaRoute,
  FaTools,
  FaSignOutAlt
} from "react-icons/fa";

const menuItems = [
  {
    title: "Empleados",
    icon: <FaUserTie className="me-2" />,
    subItems: [
      { name: "- Agregar Empleado", path: "/empleados/agregar" },
      { name: "- Consultar Empleados", path: "/empleados/consultar" },
    ],
  },
  {
    title: "Vehículos",
    icon: <FaCar className="me-2" />,
    subItems: [
      { name: "- Agregar Vehículo", path: "/vehiculos/agregar" },
      { name: "- Consultar Vehículos", path: "/vehiculos/consultar" },
      { name: "- Asignar Vehículo", path: "/vehiculos/asignar" },
      { name: "- Desasignar Vehículo", path: "/vehiculos/desasignar" },
    ],
  },
  {
    title: "Pólizas",
    icon: <FaFileAlt className="me-2" />,
    subItems: [
      { name: "- Agregar Póliza", path: "/polizas/agregar" },
      { name: "- Consultar Póliza", path: "/polizas/consultar" },
    ],
  },
  {
    title: "Recorridos",
    icon: <FaRoute className="me-2" />,
    subItems: [
      { name: "- Agregar Recorrido", path: "/recorridos/agregar" },
      { name: "- Consultar Recorrido", path: "/recorridos/consultar" },
      { name: "- Reportería de Recorridos", path: "/recorridos/reporteria" },
    ],
  },
  {
    title: "Mantenimientos",
    icon: <FaTools className="me-2" />,
    subItems: [
      { name: "- Agregar Mantenimiento", path: "/mantenimientos/agregar" },
      { name: "- Consultar Mantenimiento", path: "/mantenimientos/consultar" },
    ],
  },
];

export default function SidebarLayout({ children }) {
  const [openSections, setOpenSections] = useState({});
  const navigate = useNavigate();

  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem("auth_ok");
    navigate("/", { replace: true });
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <aside
        className="bg-dark text-white p-3"
        style={{ width: "250px", display: "flex", flexDirection: "column" }}
      >
        {/* Logo -> Home */}
        <div className="text-center mb-4">
          <Link to="/home" className="text-decoration-none text-white">
            <img
              src="/logo.png"
              alt="Logo"
              className="img-fluid rounded-circle"
              style={{ width: 80 }}
            />
            <h5 className="mt-2 mb-0">Flotillas</h5>
          </Link>
        </div>

        {/* Navegación (ocupa el espacio disponible) */}
        <nav style={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <div key={item.title} className="mb-2">
              <button
                className="btn btn-outline-light w-100 d-flex justify-content-between align-items-center"
                onClick={() => toggleSection(item.title)}
              >
                <span>
                  {item.icon} {item.title}
                </span>
                {openSections[item.title] ? <FaChevronDown /> : <FaChevronRight />}
              </button>
              {openSections[item.title] && (
                <ul className="list-group list-group-flush mt-1">
                  {item.subItems.map((sub) => (
                    <li key={sub.name} className="list-group-item bg-dark px-3 py-2 border-0">
                      <Link to={sub.path} className="text-white text-decoration-none">
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>

        {/* Cerrar sesión (pegado abajo) */}
        <div className="mt-3 pt-3 border-top border-secondary">
          <button
            className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="me-2" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-grow-1 p-4 bg-light">{children}</main>
    </div>
  );
}
