import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";

export default function DetalleAgregarRecorrido() {
  const { idAsignacion } = useParams();
  const navigate = useNavigate();
  const [asignacion, setAsignacion] = useState(null);
  const [formData, setFormData] = useState({
    punto_a: "",
    punto_b: "",
    distancia: "",
    tiempo_aproximado: ""
  });

  useEffect(() => {
    const obtenerAsignacion = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/asignacion/${idAsignacion}`);
        const data = await res.json();
        setAsignacion(data);
      } catch (error) {
        console.error("Error al cargar asignación:", error);
        Swal.fire("Error", "No se pudo obtener la asignación", "error");
      }
    };

    obtenerAsignacion();
  }, [idAsignacion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/api/recorridos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_piloto: asignacion.ID_Empleado,
          id_vehiculo: asignacion.ID_Vehiculo,
          ...formData
        })
      });

      if (res.ok) {
        Swal.fire("Éxito", "Recorrido registrado correctamente", "success");
        navigate("/recorridos/consultar");
      } else {
        Swal.fire("Error", "No se pudo guardar el recorrido", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de red al guardar recorrido", "error");
    }
  };

  if (!asignacion) {
    return (
      <SidebarLayout>
        <div className="container">Cargando datos...</div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Detalle Recorrido</h2>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Piloto</label>
              <input type="text" className="form-control" value={asignacion.NombrePiloto} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label">Vehículo</label>
              <input type="text" className="form-control" value={asignacion.DescripcionVehiculo} readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label">Punto A (Origen)</label>
              <input
                type="text"
                className="form-control"
                name="punto_a"
                value={formData.punto_a}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Punto B (Destino)</label>
              <input
                type="text"
                className="form-control"
                name="punto_b"
                value={formData.punto_b}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Distancia (Kms.)</label>
              <input
                type="number"
                placeholder="Distancia en Kms Eje. 150 Kms."
                className="form-control"
                name="distancia"
                value={formData.distancia}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Tiempo Aproximado (Horas)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Tiempo en horas Ej. 5.5 horas"
                name="tiempo_aproximado"
                value={formData.tiempo_aproximado}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button className="btn btn-primary">Guardar Recorrido</button>
        </form>
      </div>
    </SidebarLayout>
  );
}
