import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";

// Constante por vista para endpoints
const BACKEND_URL = "https://sistemaflotillavehiculos.onrender.com".replace(/\/$/, "");

export default function DetalleRecorrido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recorrido, setRecorrido] = useState(null);

  useEffect(() => {
    const obtenerRecorrido = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/recorridos/${id}`);
        const data = await res.json();
        setRecorrido(data);
      } catch (error) {
        console.error("Error al obtener recorrido:", error);
        Swal.fire("Error", "No se pudo obtener el recorrido", "error");
      }
    };

    obtenerRecorrido();
  }, [id]);

  if (!recorrido) {
    return (
      <SidebarLayout>
        <div className="container">Cargando detalles del recorrido...</div>
      </SidebarLayout>
    );
  }

  const horas = recorrido.Tiempo_Aproximado;
  const aplicaViatico = horas >= 8;

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Detalle del Recorrido</h2>
        <button
          className="btn btn-secondary mb-4"
          onClick={() => navigate("/recorridos/consultar")}
        >
          <FaArrowLeft className="me-2" />
          Volver
        </button>

        <form>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Piloto</label>
              <input
                type="text"
                className="form-control"
                value={recorrido.Piloto}
                readOnly
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Vehículo</label>
              <input
                type="text"
                className="form-control"
                value={recorrido.Vehiculo}
                readOnly
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Punto A (Origen)</label>
              <input
                type="text"
                className="form-control"
                value={recorrido.Punto_A}
                readOnly
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Punto B (Destino)</label>
              <input
                type="text"
                className="form-control"
                value={recorrido.Punto_B}
                readOnly
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Distancia en Kilómetros</label>
              <input
                type="text"
                className="form-control"
                value={recorrido.Distancia}
                readOnly
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Tiempo Aproximado</label>
              <input
                type="text"
                className="form-control"
                value={recorrido.Tiempo_Aproximado}
                readOnly
              />
            </div>
          </div>

          {/* ALERTA DE VIÁTICOS */}
          <div className="row">
            <div className="col-12">
              <div
                className={`alert ${
                  aplicaViatico ? "alert-success" : "alert-danger"
                }`}
                role="alert"
              >
                {aplicaViatico
                  ? "Sí aplica a viáticos por comida por ser un recorrido mayor a 8 horas"
                  : "No aplica a viáticos por comida por ser un recorrido menor a 8 horas"}
              </div>
            </div>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}
