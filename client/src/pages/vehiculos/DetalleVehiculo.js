import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import { FaArrowLeft } from "react-icons/fa";

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
        const res = await fetch(`http://localhost:3001/api/vehiculos/${id}`);
        const data = await res.json();
        setVehiculo(data);
      } catch (error) {
        console.error("Error al obtener vehículo:", error);
      }
    };
  
    obtenerVehiculo();
  }, [id]);
  

  if (!vehiculo) return <SidebarLayout><div className="container">Cargando...</div></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Detalle del Vehículo</h2>
        <button className="btn btn-secondary mb-4" onClick={() => navigate("/vehiculos/consultar")}>
          <FaArrowLeft className="me-2" /> Volver
        </button>

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
              Impuesto_Circulacion_Anual: `Q ${parseFloat(vehiculo.Impuesto_Circulacion_Anual || 0).toFixed(2)}`,
              Impuesto_Anio_Actual: vehiculo.Impuesto_Anio_Actual,
              Kilometraje: vehiculo.Kilometraje,
              Impresion_Tarjeta_Circulacion: formatearFecha(vehiculo.Impresion_Tarjeta_Circulacion),
              Piloto_Asignado: vehiculo.Piloto || "Disponible"
            }).map(([label, value]) => (
              <div className="col-md-3 mb-3" key={label}>
                <label className="form-label">{label.replace(/_/g, " ")}</label>
                <input type="text" className="form-control" value={value} readOnly />
              </div>
            ))}
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}
