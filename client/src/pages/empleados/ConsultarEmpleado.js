import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import SidebarLayout from "../../layouts/SidebarLayout";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const BACKEND_URL = "http://localhost:3001";

export default function ConsultarEmpleado() {
  const [empleados, setEmpleados] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const navigate = useNavigate();

  const obtenerEmpleados = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/empleados`);
      const data = await res.json();
      setEmpleados(data);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  useEffect(() => {
    obtenerEmpleados();
  }, []);

  const eliminarEmpleado = async (empleado) => {
    const confirmacion = await Swal.fire({
      title: `¿Eliminar a ${empleado.Nombres} ${empleado.Apellidos}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
  
    if (confirmacion.isConfirmed) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/empleados/${empleado.ID_Empleado}`, {
          method: "DELETE",
        });
  
        if (res.ok) {
          Swal.fire("Eliminado", "El empleado fue eliminado", "success");
          obtenerEmpleados(); // recarga la lista
        } else {
          Swal.fire("Error", "No se puede eliminar el empleado, por que tiene el rol Piloto y tiene un vehiculo asignado", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Error de red o servidor", "error");
      }
    }
  };
  

  const empleadosFiltrados = empleados.filter(emp => {
    const nombreCompleto = `${emp.Nombres} ${emp.Apellidos}`.toLowerCase();
    const nombreCoincide = nombreCompleto.includes(filtroNombre.toLowerCase());
    const rolCoincide = filtroRol ? emp.Rol === filtroRol : true;
    return nombreCoincide && rolCoincide;
  });

  const rolesUnicos = [...new Set(empleados.map(e => e.Rol).filter(Boolean))];

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Lista de Empleados</h2>

        <div className="row mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <select
              className="form-select"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <option value="">Todos los roles</option>
              {rolesUnicos.map((rol) => (
                <option key={rol} value={rol}>{rol}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Rol</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleadosFiltrados.map((emp) => (
              <tr key={emp.ID_Empleado}>
                <td>{emp.ID_Empleado}</td>
                <td>{emp.Nombres}</td>
                <td>{emp.Apellidos}</td>
                <td>{emp.Rol}</td>
                <td>{emp.Telefono}</td>
                <td>{emp.Email}</td>
                <td>
                    <div className="d-flex w-100 gap-2">
                        <button
                        className="btn btn-primary btn-sm flex-fill"
                        onClick={() => navigate(`/empleados/detalle/${emp.ID_Empleado}`)}
                        >
                        <FaEye className="me-1" />
                        Ver más
                        </button>
                        <button
                        className="btn btn-success btn-sm flex-fill"
                        onClick={() => navigate(`/empleados/modificar/${emp.ID_Empleado}`)}
                        >
                        <FaEdit className="me-1" />
                        Editar
                        </button>
                        <button
                        className="btn btn-danger btn-sm flex-fill"
                        onClick={() => eliminarEmpleado(emp)}
                        >
                        <FaTrash className="me-1" />
                        Eliminar
                        </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SidebarLayout>
  );
}