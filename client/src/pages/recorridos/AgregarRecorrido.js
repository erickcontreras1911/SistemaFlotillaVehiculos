// src/pages/recorridos/AgregarRecorrido.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import { FaRoute } from "react-icons/fa";

// Constante por vista para endpoints
const BACKEND_URL = "http://localhost:3001".replace(/\/$/, "");

export default function AgregarRecorrido() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroPiloto, setFiltroPiloto] = useState("");

  // paginación
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const navigate = useNavigate();

  const obtenerAsignaciones = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/asignacion/asignados`);
      const data = await res.json();
      setAsignaciones(data);
    } catch (error) {
      console.error("Error al obtener asignaciones:", error);
    }
  };

  useEffect(() => {
    obtenerAsignaciones();
  }, []);

  // Filtrar (memoriza resultado para paginación/performance)
  const asignacionesFiltradas = useMemo(() => {
    const placa = filtroPlaca.toLowerCase();
    const piloto = filtroPiloto.toLowerCase();

    return asignaciones.filter((a) => {
      const placaTxt = String(a.Placa || "").toLowerCase();
      const pilotoTxt = String(a.Piloto || "").toLowerCase();
      return placaTxt.includes(placa) && pilotoTxt.includes(piloto);
    });
  }, [asignaciones, filtroPlaca, filtroPiloto]);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPage(1);
  }, [filtroPlaca, filtroPiloto]);

  // Paginación calculada
  const total = asignacionesFiltradas.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = Math.min((page - 1) * pageSize, (totalPages - 1) * pageSize);
  const pageEnd = Math.min(pageStart + pageSize, total);
  const asignacionesPagina = asignacionesFiltradas.slice(pageStart, pageEnd);

  const goToPage = (p) => {
    const target = Math.min(Math.max(1, p), totalPages);
    setPage(target);
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Pilotos con Vehículo Asignado</h2>

        <div className="row mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre del piloto"
              value={filtroPiloto}
              onChange={(e) => setFiltroPiloto(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por placa"
              value={filtroPlaca}
              onChange={(e) => setFiltroPlaca(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>Piloto</th>
                <th>Vehículo Asignado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {asignacionesPagina.map((a) => (
                <tr key={a.ID_Asignacion}>
                  <td>{a.Piloto}</td>
                  <td>{`${a.Placa} - ${a.Marca} ${a.Linea} ${a.Modelo}`}</td>
                  <td>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => navigate(`/recorridos/detalle/${a.ID_Asignacion}`)}
                    >
                      <FaRoute className="me-1" />
                      Asignar Recorrido
                    </button>
                  </td>
                </tr>
              ))}

              {asignacionesPagina.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-4">
                    No hay asignaciones para mostrar con los filtros aplicados.
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
