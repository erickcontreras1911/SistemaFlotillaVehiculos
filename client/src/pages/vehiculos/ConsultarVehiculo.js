import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash, FaCar } from "react-icons/fa";
const BACKEND_URL = "https://sistemaflotillavehiculos.onrender.com";


export default function ConsultarVehiculo() {
  const [vehiculos, setVehiculos] = useState([]);
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroAsignacion, setFiltroAsignacion] = useState("");
  const navigate = useNavigate();

  const obtenerVehiculos = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/vehiculos`);
      const data = await res.json();
      setVehiculos(data);
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    }
  };

  useEffect(() => {
    obtenerVehiculos();
  }, []);

  const vehiculosFiltrados = vehiculos.filter((v) => {
    const placaCoincide = v.Placa.toLowerCase().includes(filtroPlaca.toLowerCase());
    const tipoCoincide = filtroTipo ? v.Tipos === filtroTipo : true;
    const asignadoCoincide = filtroAsignacion
      ? filtroAsignacion === "Asignado"
        ? v.Piloto !== null
        : v.Piloto === null
      : true;
    return placaCoincide && tipoCoincide && asignadoCoincide;
  });

  const tiposUnicos = [...new Set(vehiculos.map((v) => v.Tipos).filter(Boolean))];

  const eliminarVehiculo = async (vehiculo) => {
    const confirmacion = await Swal.fire({
      title: `¿Eliminar el vehículo ${vehiculo.Placa}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });
  
    if (confirmacion.isConfirmed) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/vehiculos/${vehiculo.ID_Vehiculo}`, {
          method: "DELETE" 
        });
  
        if (res.ok) {
          Swal.fire("Eliminado", "El vehículo fue eliminado exitosamente", "success");
          obtenerVehiculos(); // Refrescar lista
        } else {
          const data = await res.json();
          Swal.fire("No se puede eliminar", data.error, "warning");
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Ocurrió un error al eliminar el vehículo", "error");
      }
    }
  };
  

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Listado de Vehículos</h2>

        <div className="row mb-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por placa"
              value={filtroPlaca}
              onChange={(e) => setFiltroPlaca(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {tiposUnicos.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filtroAsignacion}
              onChange={(e) => setFiltroAsignacion(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Disponible">Disponible</option>
              <option value="Asignado">Asignado</option>
            </select>
          </div>
        </div>

        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Marca</th>
              <th>Línea</th>
              <th>Modelo</th>
              <th>Estatus</th>
              <th>Asignado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.map((v) => (
              <tr key={v.ID_Vehiculo}>
                <td>{v.ID_Vehiculo}</td>
                <td>{v.Placa}</td>
                <td>{v.Tipos}</td>
                <td>{v.Marca}</td>
                <td>{v.Linea}</td>
                <td>{v.Modelo}</td>
                <td>{v.Estatus}</td>
                <td>
                  {v.Piloto ? (
                    <span>{v.Piloto}</span>
                  ) : (
                    <span className="text-success fw-bold">Disponible</span>
                  )}
                </td>
                <td>
                  <div className="d-flex w-100 gap-2">
                    <button
                      className="btn btn-primary btn-sm flex-fill"
                      onClick={() => navigate(`/vehiculos/detalle/${v.ID_Vehiculo}`)}
                    >
                     <FaEye className="me-1" />
                      Ver más
                    </button>
                    <button
                      className="btn btn-success btn-sm flex-fill"
                      onClick={() => navigate(`/vehiculos/modificar/${v.ID_Vehiculo}`)}
                    >
                      <FaEdit className="me-1" />
                      Editar
                    </button>

                    <button
                      className="btn btn-warning btn-sm flex-fill"
                      onClick={() => navigate(`/vehiculos/kilometraje/${v.ID_Vehiculo}`)}
                    >
                      <FaCar className="me-1" />
                      Kilometraje
                    </button>

                    <button
                      className="btn btn-danger btn-sm flex-fill"
                      onClick={() => eliminarVehiculo(v)}

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