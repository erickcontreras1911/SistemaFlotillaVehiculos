import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import { FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
const BACKEND_URL = "http://localhost:3001";

export default function DetalleVehiculo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return "";
    const fecha = new Date(fechaIso);
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  useEffect(() => {
    const obtenerVehiculo = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/vehiculos/${id}`);
        const data = await res.json();
        setVehiculo(data);

        const anioTarjeta = new Date(data.Impresion_Tarjeta_Circulacion).getFullYear();
        const anioActual = new Date().getFullYear();

        if (anioTarjeta < anioActual) {
          Swal.fire({
            icon: "warning",
            title: "Impuesto de Circulación Pendiente",
            text: "Este vehículo no tiene pagado el impuesto de circulación del año actual y tambien debe renovar la tarjeta de circulación-",
          });
        }

      } catch (error) {
        console.error("Error al obtener vehículo:", error);
      }
    };

    obtenerVehiculo();
  }, [id]);

  if (!vehiculo) return <SidebarLayout><div className="container">Cargando...</div></SidebarLayout>;

  let alerta = null;
  if (vehiculo.Kilometraje_Proximo_Servicio !== null) {
    const diferencia = vehiculo.Kilometraje_Proximo_Servicio - vehiculo.Kilometraje;

    if (diferencia < 0) {
      alerta = (
        <div className="alert alert-danger">
          ¡El servicio de motor está vencido por {Math.abs(diferencia)} km!
        </div>
      );
    } else if (diferencia < 1000) {
      alerta = (
        <div className="alert alert-warning">
          Faltan {diferencia} km para el próximo servicio de motor.
        </div>
      );
    } else {
      alerta = (
        <div className="alert alert-success">
          Faltan {diferencia} km para el próximo servicio de motor.
        </div>
      );
    }
  }

  const anioTarjeta = new Date(vehiculo.Impresion_Tarjeta_Circulacion).getFullYear();
  const anioActual = new Date().getFullYear();
  const tarjetaVigente = anioTarjeta === anioActual;

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Detalle del Vehículo</h2>
        <button className="btn btn-secondary mb-4" onClick={() => navigate("/vehiculos/consultar")}>
          <FaArrowLeft className="me-2" /> Volver
        </button>
        {alerta}
        <form>
          <div className="row">
            {Object.entries({
              Placa: vehiculo.Placa,
              Tipo: vehiculo.Tipos,
              Marca: vehiculo.Marca,
              Modelo: vehiculo.Modelo,
              Linea: vehiculo.Linea,
              Chasis: vehiculo.Chasis,
              Color: vehiculo.Color,
              Asientos: vehiculo.Asientos,
              Motor: vehiculo.Motor,
              Combustible: vehiculo.Combustible,
              Transmision: vehiculo.Transmision,
              Estatus: vehiculo.Estatus,
              Kilometraje: vehiculo.Kilometraje,
              Piloto_Asignado: vehiculo.Piloto || "Disponible",
              Impuesto_Circulacion_Anual: `Q ${parseFloat(vehiculo.Impuesto_Circulacion_Anual || 0).toFixed(2)}`
            }).map(([label, value]) => (
              <div className="col-md-3 mb-3" key={label}>
                <label className="form-label">{label.replace(/_/g, " ")}</label>
                <input type="text" className="form-control" value={value} readOnly />
              </div>
            ))}

            {/* Tarjeta de circulación con título y color */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Impresión Tarjeta Circulación</label>
              <input
                type="text"
                className={`form-control fw-bold ${tarjetaVigente ? "text-success" : "text-danger"}`}
                value={formatearFecha(vehiculo.Impresion_Tarjeta_Circulacion)}
                readOnly
                title={
                  tarjetaVigente
                    ? "La tarjeta de circulación está vigente"
                    : "Debe pagar el impuesto del año actual e imprimir la tarjeta"
                }
              />
            </div>

            {/* Estado del impuesto */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Impuesto Año Actual</label>
              <input
                type="text"
                className={`form-control fw-bold ${tarjetaVigente ? "text-success" : "text-danger"}`}
                value={tarjetaVigente ? "Pagado" : "Pendiente"}
                readOnly
              />
            </div>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}
