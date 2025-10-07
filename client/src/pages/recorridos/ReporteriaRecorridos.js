import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { Bar, Line, Pie } from "react-chartjs-2";
import { FaFileExcel } from "react-icons/fa";
import Swal from "sweetalert2";
// registra automáticamente todas las escalas, elementos y plugins
import "chart.js/auto";

// Constante por vista para endpoints
const BACKEND_URL = "http://localhost:3001".replace(/\/$/, "");

export default function ReporteriaRecorridos() {
  const [data, setData] = useState({
    topVehicles: [],
    topPilots: [],
    popularRoutes: [],
    performance: [],
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/recorridos/dashboard/summary`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(setData)
      .catch(() =>
        Swal.fire("Error", "No se pudo cargar datos del dashboard", "error")
      );
  }, []);

  // Exportar Excel (solo dashboard)
  const exportExcel = () => {
    fetch(`${BACKEND_URL}/api/recorridos/dashboard/reporte-excel`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Reporte_Dashboard_Recorridos.xlsx";
        a.click();
      })
      .catch(() =>
        Swal.fire("Error", "No se pudo descargar el reporte", "error")
      );
  };

  // Exportar Excel (todos los recorridos)
  const exportAllExcel = () => {
    fetch(`${BACKEND_URL}/api/recorridos/all-excel`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Todos_Recorridos.xlsx";
        a.click();
      })
      .catch(() =>
        Swal.fire("Error", "No se pudo descargar el Excel completo", "error")
      );
  };

  // helpers para datasets
  const makeChart = (labels, values, label, type = "bar") => {
    const ds = { label, data: values };
    if (type === "pie") {
      return {
        labels,
        datasets: [
          {
            ...ds,
            backgroundColor: [
              "#4dc9f6",
              "#f67019",
              "#f53794",
              "#537bc4",
              "#acc236",
              "#166a8f",
              "#00a950",
              "#58595b",
              "#8549ba",
            ],
          },
        ],
      };
    }
    if (type === "line") {
      return {
        labels,
        datasets: [
          {
            ...ds,
            fill: false,
            tension: 0.25,
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.25)",
          },
        ],
      };
    }
    // bar (default)
    return {
      labels,
      datasets: [
        {
          ...ds,
          backgroundColor: "rgba(75,192,192,0.6)",
          borderColor: "rgba(75,192,192,1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // opciones de gráficos (mejor legibilidad)
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { mode: "index", intersect: false },
    },
  };
  const barOptions = {
    ...commonOptions,
    scales: {
      x: { ticks: { autoSkip: true, maxRotation: 30, minRotation: 0 } },
      y: { beginAtZero: true, grace: "10%" },
    },
  };
  const barHOptions = {
    ...barOptions,
    indexAxis: "y",
  };
  const lineOptions = {
    ...commonOptions,
    scales: {
      x: { ticks: { autoSkip: true } },
      y: { beginAtZero: true, grace: "10%" },
    },
  };
  const pieOptions = {
    ...commonOptions,
  };

  const ChartCard = ({ title, children }) => (
    <div className="col-lg-6 mb-4">
      <div className="card h-100 shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-center mb-3">{title}</h5>
          <div style={{ height: 340 }}>{children}</div>
        </div>
      </div>
    </div>
  );

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Dashboard de Recorridos</h2>

        {/* Botones de descarga (solo Excel) */}
        <div className="d-flex flex-wrap align-items-start mb-4 gap-2">
          <button className="btn btn-success" onClick={exportExcel}>
            <FaFileExcel className="me-1" /> Exportar Dashboard Excel
          </button>
          <button className="btn btn-primary" onClick={exportAllExcel}>
            <FaFileExcel className="me-1" /> Descargar Todo Excel
          </button>
        </div>

        {/* Disposición en 2 filas / 2 columnas, con cards y alturas consistentes */}
        <div className="row">
          {/* 1) Top Vehículos */}
          <ChartCard title="Top 5 Vehículos (Nº Recorridos)">
            <Bar
              data={makeChart(
                data.topVehicles.map((r) => r.label),
                data.topVehicles.map((r) => r.value),
                "Recorridos"
              )}
              options={barOptions}
            />
          </ChartCard>

          {/* 2) Top Pilotos */}
          <ChartCard title="Top 5 Pilotos (Nº Recorridos)">
            <Pie
              data={makeChart(
                data.topPilots.map((r) => r.label),
                data.topPilots.map((r) => r.value),
                "Recorridos",
                "pie"
              )}
              options={pieOptions}
            />
          </ChartCard>

          {/* 3) Rutas más frecuentes (horizontal para mejor lectura) */}
          <ChartCard title="Rutas más Frecuentes">
            <Bar
              data={makeChart(
                data.popularRoutes.map((r) => r.label),
                data.popularRoutes.map((r) => r.value),
                "Veces"
              )}
              options={barHOptions}
            />
          </ChartCard>

          {/* 4) Rendimiento promedio por vehículo */}
          <ChartCard title="Rendimiento Promedio por Vehículo (Km/H)">
            <Line
              data={makeChart(
                data.performance.map((r) => r.label),
                data.performance.map((r) => r.value),
                "Km / Hora",
                "line"
              )}
              options={lineOptions}
            />
          </ChartCard>
        </div>
      </div>
    </SidebarLayout>
  );
}
