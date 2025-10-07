import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";

// Constante por vista para endpoints
const BACKEND_URL = "https://sistemaflotillavehiculos.onrender.com".replace(/\/$/, "");

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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const obtenerRecorrido = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/recorridos/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el recorrido");
        const data = await res.json();

        setFormData({
          piloto: data.Piloto || "",
          vehiculo: data.Vehiculo || "",
          punto_a: data.Punto_A || "",
          punto_b: data.Punto_B || "",
          distancia: (data.Distancia ?? "").toString(),
          tiempo_aproximado: (data.Tiempo_Aproximado ?? "").toString()
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

    // Distancia: entero > 0 y < 1000; solo dígitos
    if (name === "distancia") {
      const digits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, distancia: digits }));
      if (errors.distancia) setErrors((prev) => ({ ...prev, distancia: null }));
      return;
    }

    // Tiempo: decimal > 0 y < 24; dígitos y un solo punto
    if (name === "tiempo_aproximado") {
      let v = value.replace(/[^0-9.]/g, "");
      const parts = v.split(".");
      if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
      setFormData((prev) => ({ ...prev, tiempo_aproximado: v }));
      if (errors.tiempo_aproximado) setErrors((prev) => ({ ...prev, tiempo_aproximado: null }));
      return;
    }

    // Puntos A/B (texto libre)
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const msgs = [];

    if (!formData.punto_a.trim()) {
      newErrors.punto_a = "El Punto A (origen) es obligatorio.";
      msgs.push("• Punto A: obligatorio.");
    }
    if (!formData.punto_b.trim()) {
      newErrors.punto_b = "El Punto B (destino) es obligatorio.";
      msgs.push("• Punto B: obligatorio.");
    }

    const dist = formData.distancia === "" ? NaN : parseInt(formData.distancia, 10);
    if (!Number.isInteger(dist) || dist <= 0 || dist >= 1000) {
      newErrors.distancia = "La distancia debe ser un entero mayor a 0 y menor a 1000.";
      msgs.push("• Distancia: entero > 0 y < 1000.");
    }

    const timeNum = formData.tiempo_aproximado === "" ? NaN : Number(formData.tiempo_aproximado);
    if (Number.isNaN(timeNum) || timeNum <= 0 || timeNum >= 24) {
      newErrors.tiempo_aproximado = "El tiempo debe ser un número decimal mayor a 0 y menor a 24.";
      msgs.push("• Tiempo: decimal > 0 y < 24.");
    }

    setErrors(newErrors);
    return { ok: Object.keys(newErrors).length === 0, msgs };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { ok, msgs } = validateForm();
    if (!ok) {
      Swal.fire({
        icon: "error",
        title: "Revisa los campos",
        html: `<div style="text-align:left">${msgs.join("<br>")}</div>`
      });
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/recorridos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          punto_a: formData.punto_a.trim(),
          punto_b: formData.punto_b.trim(),
          distancia: parseInt(formData.distancia, 10),
          tiempo_aproximado: Number(formData.tiempo_aproximado)
        })
      });

      if (res.ok) {
        Swal.fire("Éxito", "Recorrido actualizado correctamente", "success");
        navigate("/recorridos/consultar");
      } else {
        const err = await res.json().catch(() => ({}));
        Swal.fire("Error", err.error || "No se pudo actualizar el recorrido", "error");
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

        <form onSubmit={handleSubmit} noValidate>
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
              <label className="form-label">Punto A (Origen) <span className="text-danger">*</span></label>
              <input
                type="text"
                name="punto_a"
                className={`form-control ${errors.punto_a ? "is-invalid" : ""}`}
                value={formData.punto_a}
                onChange={handleChange}
                required
              />
              {errors.punto_a && <div className="invalid-feedback">{errors.punto_a}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Punto B (Destino) <span className="text-danger">*</span></label>
              <input
                type="text"
                name="punto_b"
                className={`form-control ${errors.punto_b ? "is-invalid" : ""}`}
                value={formData.punto_b}
                onChange={handleChange}
                required
              />
              {errors.punto_b && <div className="invalid-feedback">{errors.punto_b}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Distancia (Kms.) <span className="text-danger">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                name="distancia"
                placeholder="Entero > 0 y < 1000"
                className={`form-control ${errors.distancia ? "is-invalid" : ""}`}
                value={formData.distancia}
                onChange={handleChange}
                required
              />
              {errors.distancia && <div className="invalid-feedback">{errors.distancia}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Tiempo Aproximado (Horas) <span className="text-danger">*</span></label>
              <input
                type="text"
                inputMode="decimal"
                name="tiempo_aproximado"
                placeholder="Decimal > 0 y < 24 (ej. 5.5)"
                className={`form-control ${errors.tiempo_aproximado ? "is-invalid" : ""}`}
                value={formData.tiempo_aproximado}
                onChange={handleChange}
                required
              />
              {errors.tiempo_aproximado && <div className="invalid-feedback">{errors.tiempo_aproximado}</div>}
            </div>
          </div>

          <button className="btn btn-primary">Guardar Cambios</button>
        </form>
      </div>
    </SidebarLayout>
  );
}
