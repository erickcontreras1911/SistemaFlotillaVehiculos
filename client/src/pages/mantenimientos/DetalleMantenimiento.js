import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";

// Constante por vista para endpoints
const BACKEND_URL = "https://sistemaflotillavehiculos.onrender.com".replace(/\/$/, "");

export default function DetalleMantenimiento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mantenimiento, setMantenimiento] = useState(null);

  useEffect(() => {
    const obtenerMantenimiento = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/mantenimientos/${id}`);
        const data = await res.json();
        setMantenimiento(data);
      } catch (error) {
        console.error("Error al obtener el mantenimiento:", error);
        Swal.fire("Error", "No se pudo cargar el mantenimiento", "error");
      }
    };

    obtenerMantenimiento();
  }, [id]);

  if (!mantenimiento) {
    return (
      <SidebarLayout>
        <div className="container">Cargando detalles del mantenimiento...</div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Detalle del Mantenimiento</h2>

        <button
          className="btn btn-secondary mb-4"
          onClick={() => navigate("/mantenimientos/consultar")}
        >
          <FaArrowLeft className="me-2" />
          Volver
        </button>

        <form>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Vehículo</label>
              <input type="text" className="form-control" value={mantenimiento.Vehiculo} readOnly />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Tipo de Mantenimiento</label>
              <input type="text" className="form-control" value={mantenimiento.Tipo_Mantenimiento} readOnly />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-control"
                value={mantenimiento.Fecha.split("T")[0]}
                readOnly
              />
            </div>

            <div className="col-8 mb-3">
              <label className="form-label">Título del Mantenimiento</label>
              <input
                type="text"
                className="form-control"
                value={mantenimiento.Titulo_Mantenimiento}
                readOnly
              />
            </div>

            <div className="col-4 mb-3">
              <label className="form-label">Taller</label>
              <input type="text" className="form-control" value={mantenimiento.Nombre_Taller} readOnly />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" rows="8" value={mantenimiento.Descripcion || ""} readOnly />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Kilometraje</label>
              <input type="text" className="form-control" value={mantenimiento.Kilometraje || ""} readOnly />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Frecuencia Servicio (km)</label>
              <input
                type="text"
                className="form-control"
                value={mantenimiento.Frecuencia_Servicio || ""}
                readOnly
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Próximo Servicio (km)</label>
              <input
                type="text"
                className="form-control"
                value={mantenimiento.Kilometraje_Proximo_Servicio || ""}
                readOnly
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Costo</label>
              <input type="text" className="form-control" value={mantenimiento.Costo} readOnly />
            </div>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}
