import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";

// Constante por vista para endpoints
const BACKEND_URL = "http://localhost:3001".replace(/\/$/, "");

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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const obtenerAsignacion = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/asignacion/${idAsignacion}`);
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

    // Distancia: entero > 0 y < 1000; solo dígitos mientras escribe
    if (name === "distancia") {
      const digits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, distancia: digits }));
      if (errors.distancia) setErrors((prev) => ({ ...prev, distancia: null }));
      return;
    }

    // Tiempo: decimal > 0 y < 24; permitir solo dígitos y un punto
    if (name === "tiempo_aproximado") {
      let v = value.replace(/[^0-9.]/g, "");
      // permitir un solo punto
      const parts = v.split(".");
      if (parts.length > 2) {
        v = parts[0] + "." + parts.slice(1).join("");
      }
      setFormData((prev) => ({ ...prev, tiempo_aproximado: v }));
      if (errors.tiempo_aproximado) setErrors((prev) => ({ ...prev, tiempo_aproximado: null }));
      return;
    }

    // Punto A / Punto B tal cual
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const msgs = [];

    // Punto A/B
    if (!formData.punto_a.trim()) {
      newErrors.punto_a = "El Punto A (origen) es obligatorio.";
      msgs.push("• Punto A: obligatorio.");
    }
    if (!formData.punto_b.trim()) {
      newErrors.punto_b = "El Punto B (destino) es obligatorio.";
      msgs.push("• Punto B: obligatorio.");
    }

    // Distancia entero >0 y <1000
    const dist = formData.distancia === "" ? NaN : parseInt(formData.distancia, 10);
    if (!Number.isInteger(dist) || dist <= 0 || dist >= 1000) {
      newErrors.distancia = "La distancia debe ser un entero mayor a 0 y menor a 1000.";
      msgs.push("• Distancia: entero > 0 y < 1000.");
    }

    // Tiempo decimal >0 y <24
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
      const res = await fetch(`${BACKEND_URL}/api/recorridos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_piloto: asignacion.ID_Empleado,
          id_vehiculo: asignacion.ID_Vehiculo,
          punto_a: formData.punto_a.trim(),
          punto_b: formData.punto_b.trim(),
          distancia: parseInt(formData.distancia, 10),
          tiempo_aproximado: Number(formData.tiempo_aproximado)
        })
      });

      if (res.ok) {
        Swal.fire("Éxito", "Recorrido registrado correctamente", "success");
        navigate("/recorridos/consultar");
      } else {
        const err = await res.json().catch(() => ({}));
        Swal.fire("Error", err.error || "No se pudo guardar el recorrido", "error");
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
        <form onSubmit={handleSubmit} noValidate>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Piloto</label>
              <input
                type="text"
                className="form-control"
                value={asignacion.NombrePiloto}
                readOnly
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Vehículo</label>
              <input
                type="text"
                className="form-control"
                value={asignacion.DescripcionVehiculo}
                readOnly
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Punto A (Origen) <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.punto_a ? "is-invalid" : ""}`}
                name="punto_a"
                value={formData.punto_a}
                onChange={handleChange}
                required
              />
              {errors.punto_a && <div className="invalid-feedback">{errors.punto_a}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Punto B (Destino) <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.punto_b ? "is-invalid" : ""}`}
                name="punto_b"
                value={formData.punto_b}
                onChange={handleChange}
                required
              />
              {errors.punto_b && <div className="invalid-feedback">{errors.punto_b}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label">Distancia (Kms.) <span className="text-danger">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Distancia en km (ej. 150)"
                className={`form-control ${errors.distancia ? "is-invalid" : ""}`}
                name="distancia"
                value={formData.distancia}
                onChange={handleChange}
                required
              />
              {errors.distancia && <div className="invalid-feedback">{errors.distancia}</div>}
              <div className="form-text">Solo enteros, &gt; 0 y &lt; 1000.</div>
            </div>

            <div className="col-md-6">
              <label className="form-label">Tiempo Aproximado (Horas) <span className="text-danger">*</span></label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Tiempo en horas (ej. 5.5)"
                className={`form-control ${errors.tiempo_aproximado ? "is-invalid" : ""}`}
                name="tiempo_aproximado"
                value={formData.tiempo_aproximado}
                onChange={handleChange}
                required
              />
              {errors.tiempo_aproximado && <div className="invalid-feedback">{errors.tiempo_aproximado}</div>}
              <div className="form-text">Decimal, &gt; 0 y &lt; 24.</div>
            </div>
          </div>

          <button className="btn btn-primary">Guardar Recorrido</button>
        </form>
      </div>
    </SidebarLayout>
  );
}
