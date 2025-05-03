import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import SidebarLayout from "../../layouts/SidebarLayout";

export default function RegistrarKilometraje() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [nuevoKm, setNuevoKm] = useState("");
  const [recorrido, setRecorrido] = useState(0);

  useEffect(() => {
    const fetchVehiculo = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/vehiculos/${id}`);
        const data = await res.json();
        setVehiculo(data);
      } catch (error) {
        Swal.fire("Error", "No se pudo cargar el vehículo", "error");
      }
    };

    fetchVehiculo();
  }, [id]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nuevoKm <= vehiculo.Kilometraje) {
      return Swal.fire("Error", "El nuevo kilometraje debe ser mayor al actual", "error");
    }

    try {
      const res = await fetch("http://localhost:3001/api/vehiculos/kilometraje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_vehiculo: vehiculo.ID_Vehiculo,
          kilometraje_nuevo: parseInt(nuevoKm)
        })
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire("Éxito", `Kilometraje actualizado correctamente.\nRecorrido: ${data.recorrido} km`, "success").then(() => {
          navigate("/vehiculos/consultar");
        });
      } else {
        Swal.fire("Error", data.error || "No se pudo registrar", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de red", "error");
    }
  };

  if (!vehiculo) return <SidebarLayout><div className="container">Cargando...</div></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Registrar Nuevo Kilometraje</h2>
        <form onSubmit={handleSubmit}>
          <h4>Vehículo: {vehiculo.Placa} - {vehiculo.Marca} {vehiculo.Linea} {vehiculo.Modelo}</h4>
          <h5>Kilometraje actual: {vehiculo.Kilometraje} km</h5>

          <div className="mb-3">
            <label className="form-label">Nuevo Kilometraje</label>
            <input
              type="number"
              className="form-control"
              value={nuevoKm}
              onChange={(e) => {
                setNuevoKm(e.target.value);
                setRecorrido(e.target.value - vehiculo.Kilometraje);
              }}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Kilometraje Recorrido</label>
            <input type="text" className="form-control" value={`${recorrido} km`} readOnly />
          </div>

          <button className="btn btn-primary">Guardar</button>
        </form>
      </div>
    </SidebarLayout>
  );
}
