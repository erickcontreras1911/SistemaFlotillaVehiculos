import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
import {useNavigate } from "react-router-dom";

export default function AgregarPoliza() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_vehiculo: "",
    numero_poliza: "",
    aseguradora: "",
    monto: "",
    fecha_emision: "",
    fecha_vencimiento: ""
  });

  const [vehiculosDisponibles, setVehiculosDisponibles] = useState([]);

  const obtenerVehiculosSinPoliza = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/polizas/vehiculos-disponibles");
      const data = await res.json();
      setVehiculosDisponibles(data);
  
      if (data.length === 0) {
        Swal.fire({
          icon: "success",
          title: "¡Todos los vehículos cubiertos!",
          text: "Todos los vehículos activos ya tienen póliza asignada.",
          confirmButtonColor: "#28a745"
        });
      }
    } catch (error) {
      console.error("Error al obtener vehículos sin póliza:", error);
      Swal.fire("Error", "No se pudieron cargar los vehículos disponibles", "error");
    }
  };
  

  useEffect(() => {
    obtenerVehiculosSinPoliza();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_vehiculo) {
      Swal.fire("Atención", "Debe seleccionar un vehículo disponible", "warning");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/polizas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        Swal.fire("Registrado", "La póliza fue guardada correctamente", "success");
        setFormData({
          id_vehiculo: "",
          numero_poliza: "",
          aseguradora: "",
          monto: "",
          fecha_emision: "",
          fecha_vencimiento: ""
        });
        obtenerVehiculosSinPoliza();
        navigate("/polizas/consultar");
      } else {
        Swal.fire("Error", "No se pudo guardar la póliza", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Ocurrió un error de red", "error");
    }
  };

  const noHayVehiculos = vehiculosDisponibles.length === 0;

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Agregar Póliza</h2>

        {noHayVehiculos && (
          <div className="alert alert-success">
            Todos los vehículos activos ya tienen póliza asignada.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Vehículo *</label>
              <select
                className="form-select"
                name="id_vehiculo"
                value={formData.id_vehiculo}
                onChange={handleChange}
                disabled={noHayVehiculos}
                required
              >
                <option value="">Seleccione un vehículo</option>
                {vehiculosDisponibles.map((v) => (
                  <option key={v.ID_Vehiculo} value={v.ID_Vehiculo}>
                    {`${v.Placa} - ${v.Marca} ${v.Linea} ${v.Modelo}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Número de Póliza *</label>
              <input
                type="text"
                className="form-control"
                name="numero_poliza"
                value={formData.numero_poliza}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Aseguradora</label>
              <input
                type="text"
                className="form-control"
                name="aseguradora"
                value={formData.aseguradora}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Monto</label>
              <input
                type="number"
                className="form-control"
                name="monto"
                step="0.01"
                value={formData.monto}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha de Emisión</label>
              <input
                type="date"
                className="form-control"
                name="fecha_emision"
                value={formData.fecha_emision}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha de Vencimiento</label>
              <input
                type="date"
                className="form-control"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={noHayVehiculos}>
            Guardar Póliza
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}
