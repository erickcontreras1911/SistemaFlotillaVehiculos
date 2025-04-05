import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import { FaRoute } from "react-icons/fa";

export default function AgregarRecorrido() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroPiloto, setFiltroPiloto] = useState("");

  const navigate = useNavigate();

  const obtenerAsignaciones = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/asignacion/asignados");
      const data = await res.json();
      setAsignaciones(data);
    } catch (error) {
      console.error("Error al obtener asignaciones:", error);
    }
  };

  useEffect(() => {
    obtenerAsignaciones();
  }, []);

  const asignacionesFiltradas = asignaciones.filter((a) => {
    const coincidePlaca = a.Placa.toLowerCase().includes(filtroPlaca.toLowerCase());
    const coincidePiloto = a.Piloto.toLowerCase().includes(filtroPiloto.toLowerCase());
    return coincidePlaca && coincidePiloto;
  });
  

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


        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>Piloto</th>
              <th>Vehículo Asignado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {asignacionesFiltradas.map((a) => (
                <tr key={a.ID_Asignacion}>
                <td>{a.Piloto}</td>
                <td>{`${a.Placa} - ${a.Marca} ${a.Linea} ${a.Modelo}`}</td>
                <td>
                    <button
                    className="btn btn-success btn-sm"
                    onClick={() =>
                        navigate(`/recorridos/detalle/${a.ID_Asignacion}`)
                    }
                    >
                    <FaRoute className="me-1" />
                    Asignar Recorrido
                    </button>
                </td>
                </tr>
            ))}
          </tbody>

        </table>
      </div>
    </SidebarLayout>
  );
}
