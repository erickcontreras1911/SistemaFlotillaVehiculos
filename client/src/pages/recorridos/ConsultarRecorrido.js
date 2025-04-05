// src/pages/recorridos/ConsultarRecorrido.js
import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

export default function ConsultarRecorrido() {
  const [recorridos, setRecorridos] = useState([]);
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroPiloto, setFiltroPiloto] = useState("");
  const [filtroLugar, setFiltroLugar] = useState("");
  const navigate = useNavigate();

  const obtenerRecorridos = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/recorridos");
      const data = await res.json();
      setRecorridos(data);
    } catch (error) {
      console.error("Error al cargar recorridos:", error);
    }
  };

  useEffect(() => {
    obtenerRecorridos();
  }, []);

  const recorridosFiltrados = recorridos.filter((r) => {
    const coincidePlaca = r.Vehiculo.toLowerCase().includes(filtroPlaca.toLowerCase());
    const coincidePiloto = r.Piloto.toLowerCase().includes(filtroPiloto.toLowerCase());
    const coincideLugar =
      r.Punto_A.toLowerCase().includes(filtroLugar.toLowerCase()) ||
      r.Punto_B.toLowerCase().includes(filtroLugar.toLowerCase());
    return coincidePlaca && coincidePiloto && coincideLugar;
  });

  const eliminarRecorrido = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará el recorrido permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });
  
    if (confirmacion.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:3001/api/recorridos/${id}`, {
          method: "DELETE"
        });
  
        if (res.ok) {
          Swal.fire("Eliminado", "El recorrido fue eliminado correctamente", "success");
          obtenerRecorridos(); // vuelve a cargar la tabla
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
            {recorridosFiltrados.map((r) => (
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
          </tbody>
        </table>
      </div>
    </SidebarLayout>
  );
}
