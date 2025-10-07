// src/pages/recorridos/ConsultarRecorrido.js
import { useEffect, useMemo, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

// Constante por vista para endpoints
const BACKEND_URL = "https://sistemaflotillavehiculos.onrender.com".replace(/\/$/, "");

export default function ConsultarRecorrido() {
  const [recorridos, setRecorridos] = useState([]);
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroPiloto, setFiltroPiloto] = useState("");
  const [filtroLugar, setFiltroLugar] = useState("");
  const navigate = useNavigate();

  // paginación
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const obtenerRecorridos = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/recorridos`);
      const data = await res.json();
      setRecorridos(data);
    } catch (error) {
      console.error("Error al cargar recorridos:", error);
    }
  };

  useEffect(() => {
    obtenerRecorridos();
  }, []);

  // Filtro (memorizar para paginación y performance)
  const recorridosFiltrados = useMemo(() => {
    const placa = filtroPlaca.toLowerCase();
    const piloto = filtroPiloto.toLowerCase();
    const lugar = filtroLugar.toLowerCase();

    return recorridos.filter((r) => {
      const vehiculo = String(r.Vehiculo || "").toLowerCase();
      const pil = String(r.Piloto || "").toLowerCase();
      const a = String(r.Punto_A || "").toLowerCase();
      const b = String(r.Punto_B || "").toLowerCase();

      const coincidePlaca = vehiculo.includes(placa);
      const coincidePiloto = pil.includes(piloto);
      const coincideLugar = a.includes(lugar) || b.includes(lugar);
      return coincidePlaca && coincidePiloto && coincideLugar;
    });
  }, [recorridos, filtroPlaca, filtroPiloto, filtroLugar]);

  // Resetear página cuando cambian filtros
  useEffect(() => {
    setPage(1);
  }, [filtroPlaca, filtroPiloto, filtroLugar]);

  // Paginación calculada
  const total = recorridosFiltrados.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = Math.min((page - 1) * pageSize, (totalPages - 1) * pageSize);
  const pageEnd = Math.min(pageStart + pageSize, total);
  const recorridosPagina = recorridosFiltrados.slice(pageStart, pageEnd);

  const goToPage = (p) => {
    const target = Math.min(Math.max(1, p), totalPages);
    setPage(target);
  };

  const eliminarRecorrido = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el recorrido permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmacion.isConfirmed) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/recorridos/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire("Eliminado", "El recorrido fue eliminado correctamente", "success");
          obtenerRecorridos(); // recargar tabla
        } else {
          Swal.fire("Error", "No se pudo eliminar el recorrido", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Ocurrió un error de red", "error");
      }
    }
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Listado de Recorridos</h2>

        <div className="row mb-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por piloto"
              value={filtroPiloto}
              onChange={(e) => setFiltroPiloto(e.target.value)}
            />
          </div>

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
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por lugar (Punto A o B)"
              value={filtroLugar}
              onChange={(e) => setFiltroLugar(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Piloto Asignado</th>
                <th>Vehículo</th>
                <th>Punto A</th>
                <th>Punto B</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recorridosPagina.map((r) => (
                <tr key={r.ID_Recorrido}>
                  <td>{r.ID_Recorrido}</td>
                  <td>{r.Piloto}</td>
                  <td>{r.Vehiculo}</td>
                  <td>{r.Punto_A}</td>
                  <td>{r.Punto_B}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary btn-sm flex-fill"
                        onClick={() => navigate(`/recorridos/detallar/${r.ID_Recorrido}`)}
                      >
                        <FaEye className="me-1" />
                        Ver más
                      </button>
                      <button
                        className="btn btn-success btn-sm flex-fill"
                        onClick={() => navigate(`/recorridos/modificar/${r.ID_Recorrido}`)}
                      >
                        <FaEdit className="me-1" />
                        Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm flex-fill"
                        onClick={() => eliminarRecorrido(r.ID_Recorrido)}
                      >
                        <FaTrash className="me-1" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {recorridosPagina.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No hay recorridos para mostrar con los filtros aplicados.
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
