import { useEffect, useMemo, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaEye,
  FaEdit,
  FaTrash,
  FaFilePdf,
} from "react-icons/fa";

// Constante por vista para endpoints
const BACKEND_URL = "https://sistemaflotillavehiculos.onrender.com".replace(/\/$/, "");

// Utilidades de fecha
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const hoyGT = () => startOfDay(new Date()); // para simplicidad usamos hora local
const formatGT = (d) =>
  new Date(d).toLocaleDateString("es-GT", { timeZone: "America/Guatemala" });

// Devuelve días hasta vencimiento (negativo si ya venció)
const diasHasta = (fechaVenc) => {
  if (!fechaVenc) return -9999; // tratar como vencida
  const hoy = hoyGT();
  const fv = startOfDay(new Date(fechaVenc));
  const diffMs = fv.getTime() - hoy.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

// Estado por día restante:
// - vencidas: días < 0
// - proximas: 0 ≤ días ≤ 60
// - vigentes: días > 60
const getEstadoPoliza = (fechaVencimiento) => {
  const d = diasHasta(fechaVencimiento);
  if (d < 0) {
    return {
      key: "vencidas",
      color: "danger",
      icon: <FaTimesCircle className="ms-1 text-danger" />,
      dias: d,
    };
  }
  if (d <= 60) {
    return {
      key: "proximas",
      color: "warning",
      icon: <FaExclamationTriangle className="ms-1 text-warning" />,
      dias: d,
    };
  }
  return {
    key: "vigentes",
    color: "success",
    icon: <FaCheckCircle className="ms-1 text-success" />,
    dias: d,
  };
};

export default function ConsultarPolizas() {
  const [polizas, setPolizas] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [vehiculosSinPoliza, setVehiculosSinPoliza] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("todas"); // "todas" | "vigentes" | "proximas" | "vencidas"
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const navigate = useNavigate();

  useEffect(() => {
    obtenerPolizas();
    obtenerVehiculosSinPoliza();
  }, []);

  const obtenerPolizas = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/polizas`);
      const data = await res.json();
      setPolizas(data);
    } catch (error) {
      console.error("Error al cargar pólizas:", error);
      Swal.fire("Error", "No se pudieron cargar las pólizas", "error");
    }
  };

  const obtenerVehiculosSinPoliza = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/polizas/vehiculos-disponibles`);
      const data = await res.json();
      setVehiculosSinPoliza(data);
    } catch (error) {
      console.error("Error al cargar vehículos sin póliza:", error);
    }
  };

  const eliminarPoliza = async (poliza) => {
    const hoy = new Date();
    const vencimiento = new Date(poliza.Fecha_Vencimiento);
    let mensajeConfirmacion = "¿Está seguro que desea eliminar esta póliza?";
    if (vencimiento >= hoy) {
      mensajeConfirmacion =
        "La póliza aún está vigente. ¿Está seguro que desea eliminarla?";
    }

    const confirmacion = await Swal.fire({
      title: "Eliminar Póliza",
      text: mensajeConfirmacion,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmacion.isConfirmed) {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/polizas/${poliza.ID_Poliza}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          Swal.fire("Eliminada", "La póliza fue eliminada exitosamente", "success");
          obtenerPolizas();
          obtenerVehiculosSinPoliza();
        } else {
          Swal.fire("Error", "No se pudo eliminar la póliza", "error");
        }
      } catch (error) {
        console.error("Error:", error);
        Swal.fire("Error", "Error al eliminar la póliza", "error");
      }
    }
  };

  // Filtrado por texto (número, placa o aseguradora)
  const aplicaFiltroTexto = (p) => {
    if (!filtroTexto.trim()) return true;
    const f = filtroTexto.toLowerCase();
    return (
      (p.Numero_Poliza || "").toLowerCase().includes(f) ||
      (p.Placa || "").toLowerCase().includes(f) ||
      (p.Aseguradora || "").toLowerCase().includes(f)
    );
  };

  // Filtrado por estado
  const aplicaFiltroEstado = (p) => {
    if (estadoFiltro === "todas") return true;
    const { key } = getEstadoPoliza(p.Fecha_Vencimiento);
    return key === estadoFiltro;
  };

  // Conjunto filtrado (para paginación y PDF)
  const polizasFiltradas = useMemo(() => {
    return polizas.filter((p) => aplicaFiltroTexto(p) && aplicaFiltroEstado(p));
  }, [polizas, filtroTexto, estadoFiltro]);

  // Paginación
  const total = polizasFiltradas.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageStart = Math.min((page - 1) * pageSize, (totalPages - 1) * pageSize);
  const pageEnd = Math.min(pageStart + pageSize, total);
  const polizasPagina = polizasFiltradas.slice(pageStart, pageEnd);

  const goToPage = (p) => {
    const target = Math.min(Math.max(1, p), totalPages);
    setPage(target);
  };

  // Resetear página al cambiar filtros/búsqueda
  useEffect(() => {
    setPage(1);
  }, [filtroTexto, estadoFiltro]);

  // Título del PDF según filtros
  const tituloPDF = useMemo(() => {
    if (filtroTexto.trim()) {
      return `Pólizas que coinciden con la búsqueda "${filtroTexto.trim()}"`;
    }
    switch (estadoFiltro) {
      case "vigentes":
        return "Pólizas vigentes";
      case "proximas":
        return "Pólizas próximas a vencer";
      case "vencidas":
        return "Pólizas vencidas";
      default:
        return "Todas las pólizas";
    }
  }, [estadoFiltro, filtroTexto]);

  // Generar PDF con el conjunto filtrado completo (no solo la página)
  const generarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(tituloPDF, 105, 18, { align: "center" });

    const fechaActual = new Date().toLocaleDateString("es-GT", {
      timeZone: "America/Guatemala",
    });
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${fechaActual}`, 14, 26);

    const columnas = [
      { header: "ID", dataKey: "id" },
      { header: "Número", dataKey: "numero" },
      { header: "Placa", dataKey: "placa" },
      { header: "Aseguradora", dataKey: "aseguradora" },
      { header: "Vencimiento", dataKey: "vencimiento" },
      { header: "Estado", dataKey: "estado" },
    ];

    const filas = polizasFiltradas.map((p) => {
      const estado = getEstadoPoliza(p.Fecha_Vencimiento).key;
      const label =
        estado === "vencidas"
          ? "Vencida"
          : estado === "proximas"
          ? "Próxima"
          : "Vigente";
      return {
        id: p.ID_Poliza,
        numero: p.Numero_Poliza,
        placa: p.Placa,
        aseguradora: p.Aseguradora,
        vencimiento: formatGT(p.Fecha_Vencimiento), // igual que en la tabla
        estado: label,
      };
    });

    autoTable(doc, {
      startY: 32,
      columns: columnas,
      body: filas,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] },
      bodyStyles: { valign: "middle" },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: "center" });
    }

    const fileName = `${tituloPDF.replace(/\s+/g, "_").toLowerCase()}.pdf`;
    doc.save(fileName);
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4 text-success d-flex align-items-center justify-content-between">
          <span>Pólizas</span>
          <button className="btn btn-danger" onClick={generarPDF}>
            <FaFilePdf className="me-2" />
            Generar Reporte PDF
          </button>
        </h2>

        {/* Filtros */}
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <input
              type="text"
              placeholder="Filtrar por número, placa o aseguradora"
              className="form-control"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className={`btn btn-outline-secondary ${estadoFiltro === "todas" ? "active" : ""}`}
                onClick={() => setEstadoFiltro("todas")}
              >
                Todas
              </button>
              <button
                type="button"
                className={`btn btn-outline-success ${estadoFiltro === "vigentes" ? "active" : ""}`}
                onClick={() => setEstadoFiltro("vigentes")}
              >
                Vigentes
              </button>
              <button
                type="button"
                className={`btn btn-outline-warning ${estadoFiltro === "proximas" ? "active" : ""}`}
                onClick={() => setEstadoFiltro("proximas")}
              >
                Próximas a vencer
              </button>
              <button
                type="button"
                className={`btn btn-outline-danger ${estadoFiltro === "vencidas" ? "active" : ""}`}
                onClick={() => setEstadoFiltro("vencidas")}
              >
                Vencidas
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Número</th>
                <th>Vehículo</th>
                <th>Aseguradora</th>
                <th>Vencimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {polizasPagina.map((p) => {
                const estado = getEstadoPoliza(p.Fecha_Vencimiento);
                return (
                  <tr key={p.ID_Poliza}>
                    <td>{p.ID_Poliza}</td>
                    <td>{p.Numero_Poliza}</td>
                    <td>{`${p.Placa} - ${p.Marca} ${p.Linea} ${p.Modelo}`}</td>
                    <td>{p.Aseguradora}</td>
                    <td className={`fw-bold text-${estado.color}`}>
                      {formatGT(p.Fecha_Vencimiento)} {estado.icon}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/polizas/detalle/${p.ID_Poliza}`)}
                        >
                          <FaEye /> Ver
                        </button>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => navigate(`/polizas/modificar/${p.ID_Poliza}`)}
                        >
                          <FaEdit /> Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => eliminarPoliza(p)}
                        >
                          <FaTrash /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {polizasPagina.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No hay pólizas para mostrar con los filtros aplicados.
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
                  <li
                    key={pnum}
                    className={`page-item ${page === pnum ? "active" : ""}`}
                  >
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

        {/* Vehículos sin póliza (igual) */}
        {vehiculosSinPoliza.length > 0 && (
          <>
            <h3 className="mt-5 text-warning">Vehículos Sin Póliza</h3>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Placa</th>
                    <th>Tipo</th>
                    <th>Marca</th>
                    <th>Línea</th>
                    <th>Modelo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiculosSinPoliza.map((v) => (
                    <tr key={v.ID_Vehiculo} className="table-warning">
                      <td>{v.ID_Vehiculo}</td>
                      <td>{v.Placa}</td>
                      <td>{v.Tipos}</td>
                      <td>{v.Marca}</td>
                      <td>{v.Linea}</td>
                      <td>{v.Modelo}</td>
                      <td>{v.Estatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
