import { useEffect, useMemo, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Constante por vista para endpoints
const BACKEND_URL = "https://sistemaflotillavehiculos.onrender.com".replace(/\/$/, "");

export default function ConsultarMantenimiento() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [filtros, setFiltros] = useState({
    placa: "",
    tipo: "",
    taller: ""
  });

  // Paginación
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const navigate = useNavigate();

  useEffect(() => {
    const obtenerMantenimientos = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/mantenimientos`);
        const data = await res.json();
        setMantenimientos(data);
      } catch (error) {
        console.error("Error al cargar mantenimientos:", error);
        Swal.fire("Error", "No se pudo obtener la lista de mantenimientos", "error");
      }
    };

    obtenerMantenimientos();
  }, []);

  const handleChangeFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value.toLowerCase() }));
  };

  // Filtrado memorizado (para rendimiento y paginación)
  const mantenimientosFiltrados = useMemo(() => {
    return mantenimientos.filter((m) =>
      (filtros.placa === "" || String(m.Vehiculo || "").toLowerCase().includes(filtros.placa)) &&
      (filtros.tipo === "" || String(m.Tipo_Mantenimiento || "").toLowerCase() === filtros.tipo) &&
      (filtros.taller === "" || String(m.Nombre_Taller || "").toLowerCase().includes(filtros.taller))
    );
  }, [mantenimientos, filtros]);

  // Resetear página al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [filtros]);

  // Cálculo de paginación
  const total = mantenimientosFiltrados.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = Math.min((page - 1) * pageSize, (totalPages - 1) * pageSize);
  const pageEnd = Math.min(pageStart + pageSize, total);
  const mantenimientosPagina = mantenimientosFiltrados.slice(pageStart, pageEnd);

  const goToPage = (p) => {
    const target = Math.min(Math.max(1, p), totalPages);
    setPage(target);
  };

  const eliminarMantenimiento = async (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción eliminará el mantenimiento.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/mantenimientos/${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            Swal.fire("Eliminado", "Mantenimiento eliminado", "success");
            setMantenimientos((prev) =>
              prev.filter((mant) => mant.ID_Mantenimiento !== id)
            );
          } else {
            Swal.fire("Error", "No se pudo eliminar", "error");
          }
        } catch (error) {
          Swal.fire("Error", "Error al eliminar", "error");
        }
      }
    });
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Consultar Mantenimientos</h2>

        {/* Filtros */}
        <div className="row mb-4">
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              name="placa"
              placeholder="Buscar por placa..."
              value={filtros.placa}
              onChange={handleChangeFiltro}
            />
          </div>
          <div className="col-md-4 mb-2">
            <select
              className="form-select"
              name="tipo"
              value={filtros.tipo}
              onChange={handleChangeFiltro}
            >
              <option value="">Todos los tipos</option>
              <option value="Correctivo">Correctivo</option>
              <option value="Preventivo">Preventivo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              name="taller"
              placeholder="Buscar por taller..."
              value={filtros.taller}
              onChange={handleChangeFiltro}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Vehículo</th>
                <th>Tipo</th>
                <th>Título</th>
                <th>Taller</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mantenimientosPagina.map((m) => (
                <tr key={m.ID_Mantenimiento}>
                  <td>{m.ID_Mantenimiento}</td>
                  <td>{m.Vehiculo}</td>
                  <td>{m.Tipo_Mantenimiento}</td>
                  <td>{m.Titulo_Mantenimiento}</td>
                  <td>{m.Nombre_Taller}</td>
                  <td>{new Date(m.Fecha).toLocaleDateString("es-GT")}</td>
                  <td className="text-center">
                    <div className="d-flex w-100 gap-2">
                      <button
                        className="btn btn-sm btn-primary flex-fill"
                        onClick={() => navigate(`/mantenimientos/detallar/${m.ID_Mantenimiento}`)}
                      >
                        <FaEye className="me-1" />
                        Ver más
                      </button>
                      <button
                        className="btn btn-sm btn-success flex-fill"
                        onClick={() => navigate(`/mantenimientos/modificar/${m.ID_Mantenimiento}`)}
                      >
                        <FaEdit className="me-1" />
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger flex-fill"
                        onClick={() => eliminarMantenimiento(m.ID_Mantenimiento)}
                      >
                        <FaTrash className="me-1" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {mantenimientosPagina.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="d-flex align-items-center justify-content-between">
          <div className="text-muted">
            Mostrando <b>{total === 0 ? 0 : pageStart + 1}</b>–<b>{pageEnd}</b> de <b>{total}</b>
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(page - 1)}>
                  Anterior
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                .map((pnum) => (
                  <li key={pnum} className={`page-item ${page === pnum ? "active" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(pnum)}>
                      {pnum}
                    </button>
                  </li>
                ))}
              <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => goToPage(page + 1)}>
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </SidebarLayout>
  );
}
