import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";

export default function EditarRecorrido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    piloto: "",
    vehiculo: "",
    punto_a: "",
    punto_b: "",
    distancia: "",
    tiempo_aproximado: ""
  });

  useEffect(() => {
    const obtenerRecorrido = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/recorridos/${id}`);
        const data = await res.json();
        setFormData({
          piloto: data.Piloto,
          vehiculo: data.Vehiculo,
          punto_a: data.Punto_A,
          punto_b: data.Punto_B,
          distancia: data.Distancia,
          tiempo_aproximado: data.Tiempo_Aproximado
        });
      } catch (error) {
        console.error("Error al cargar recorrido:", error);
        Swal.fire("Error", "No se pudo cargar el recorrido", "error");
      }
    };

    obtenerRecorrido();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/api/recorridos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          punto_a: formData.punto_a,
          punto_b: formData.punto_b,
          distancia: formData.distancia,
          tiempo_aproximado: formData.tiempo_aproximado
        })
      });

      if (res.ok) {
        Swal.fire("Éxito", "Recorrido actualizado correctamente", "success");
        navigate("/recorridos/consultar");
      } else {
        Swal.fire("Error", "No se pudo actualizar el recorrido", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de red", "error");
    }
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Editar Recorrido</h2>
        <button
          className="btn btn-secondary mb-4"
          onClick={() => navigate("/recorridos/consultar")}
        >
          <FaArrowLeft className="me-2" /> Volver
        </button>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Piloto</label>
              <input type="text" className="form-control" value={formData.piloto} readOnly />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Vehículo</label>
              <input type="text" className="form-control" value={formData.vehiculo} readOnly />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Punto A (Origen)</label>
              <input
                type="text"
                name="punto_a"
                className="form-control"
                value={formData.punto_a}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Punto B (Destino)</label>
              <input
                type="text"
                name="punto_b"
                className="form-control"
                value={formData.punto_b}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Distancia</label>
              <input
                type="text"
                name="distancia"
                className="form-control"
                value={formData.distancia}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Tiempo Aproximado</label>
              <input
                type="text"
                name="tiempo_aproximado"
                className="form-control"
                value={formData.tiempo_aproximado}
                onChange={handleChange}
              />
            </div>
          </div>

          <button className="btn btn-primary">Guardar Cambios</button>
        </form>
      </div>
    </SidebarLayout>
  );
}
