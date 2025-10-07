import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
const BACKEND_URL = "https://sistemaflotillavehiculos.onrender.com";

export default function AsignarVehiculo() {
  const [pilotos, setPilotos] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [formData, setFormData] = useState({
    id_empleado: "",
    id_vehiculo: "",
    observaciones: ""
  });

  const obtenerDisponibles = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/asignacion/disponibles`);
      const data = await res.json();
  
      setPilotos(data.pilotos);
      setVehiculos(data.vehiculos);
  
      if (data.pilotos.length === 0) {
        Swal.fire("Sin pilotos disponibles", "No hay pilotos disponibles para asignar un vehículo.", "info");
      }
  
      if (data.vehiculos.length === 0) {
        Swal.fire("Sin vehículos disponibles", "No hay vehículos disponibles para asignar a un piloto.", "info");
      }
  
    } catch (error) {
      console.error("Error al obtener datos disponibles:", error);
      Swal.fire("Error", "No se pudo cargar la información de disponibilidad", "error");
    }
  };
  

  useEffect(() => {
    obtenerDisponibles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/asignacion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        Swal.fire("Asignación realizada", "Vehículo asignado al piloto correctamente", "success");
        setFormData({ id_empleado: "", id_vehiculo: "", observaciones: "" });
        obtenerDisponibles();
      } else {
        const error = await res.json();
        Swal.fire("Error", error.error || "No se pudo asignar el vehículo", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Error de red o servidor", "error");
    }
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Asignar Vehículo a Piloto</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Piloto disponible *</label>
              <select
                className="form-select"
                name="id_empleado"
                value={formData.id_empleado}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un piloto</option>
                {pilotos.map((p) => (
                  <option key={p.ID_Empleado} value={p.ID_Empleado}>
                    {p.Nombres} {p.Apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Vehículo disponible *</label>
              <select
                className="form-select"
                name="id_vehiculo"
                value={formData.id_vehiculo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un vehículo</option>
                {vehiculos.map((v) => (
                  <option key={v.ID_Vehiculo} value={v.ID_Vehiculo}>
                    {v.Placa} - {v.Marca} {v.Modelo}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Observaciones</label>
              <textarea
                className="form-control"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Asignar Vehículo
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}
