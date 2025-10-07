import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";

// Constante por vista para endpoints
const BACKEND_URL = "http://localhost:3001".replace(/\/$/, "");

// Helpers de fecha
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const toYMD = (d) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const addMonths = (d, months) => {
  const x = new Date(d);
  const originalDay = x.getDate();
  x.setMonth(x.getMonth() + months);
  if (x.getDate() < originalDay) x.setDate(0); // último día del mes anterior si overflow
  return x;
};

// Catálogo de aseguradoras (Guatemala)
const aseguradorasGT = [
  "Seguros El Roble",
  "MAPFRE",
  "Aseguradora Rural",
  "Seguros Universales",
  "Aseguradora General",
  "G&T Seguros",
  "ASSA Compañía de Seguros",
  "Seguros Columna",
];

export default function EditarPoliza() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    numero_poliza: "",
    aseguradora: "",
    monto: "",
    fecha_emision: "",
    fecha_vencimiento: "",
  });
  const [errors, setErrors] = useState({});
  const [vehiculo, setVehiculo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Límites de fecha
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxEmision = useMemo(() => addMonths(today, 3), [today]);
  const minVencimiento = useMemo(
    () => startOfDay(formData.fecha_emision || today),
    [formData.fecha_emision, today]
  );

  useEffect(() => {
    const obtenerPoliza = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/polizas/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener la póliza");
        const data = await res.json();

        setFormData({
          numero_poliza: (data.Numero_Poliza || "").toUpperCase(),
          aseguradora: data.Aseguradora || "",
          monto: data.Monto ?? "",
          fecha_emision: data.Fecha_Emision
            ? String(data.Fecha_Emision).split("T")[0]
            : "",
          fecha_vencimiento: data.Fecha_Vencimiento
            ? String(data.Fecha_Vencimiento).split("T")[0]
            : "",
        });

        setVehiculo(`${data.Placa} - ${data.Marca} ${data.Linea} ${data.Modelo}`);
      } catch (error) {
        console.error("Error al cargar datos de la póliza:", error);
        Swal.fire("Error", "No se pudieron cargar los datos de la póliza", "error");
      } finally {
        setLoading(false);
      }
    };
    obtenerPoliza();
  }, [id]);

  // Saneo y cambios de inputs
  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "numero_poliza") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    }

    if (name === "monto") {
      // permitir escribir decimal; solo dígitos y punto
      value = value.replace(/[^0-9.]/g, "");
    }

    if (name === "fecha_emision") {
      // clamp visual: [hoy, hoy+3m]
      const d = startOfDay(value);
      if (d < today) value = toYMD(today);
      if (d > maxEmision) value = toYMD(maxEmision);

      // si vencimiento queda antes de la emisión, limpiarlo
      if (formData.fecha_vencimiento) {
        const fv = startOfDay(formData.fecha_vencimiento);
        if (fv < d) {
          setFormData((prev) => ({ ...prev, fecha_vencimiento: "" }));
        }
      }
    }

    if (name === "fecha_vencimiento") {
      // no pasada ni antes de emisión
      const min = startOfDay(formData.fecha_emision || today);
      const d = startOfDay(value);
      if (d < min) value = toYMD(min);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const msgs = [];

    // Número de póliza
    if (!formData.numero_poliza) {
      newErrors.numero_poliza = "El número de póliza es obligatorio.";
      msgs.push("• Número de póliza: obligatorio.");
    } else if (!/^[A-Z0-9]{1,15}$/.test(formData.numero_poliza)) {
      newErrors.numero_poliza = "Use sólo letras/números (máx. 15).";
      msgs.push("• Número de póliza: sólo letras/números (máx. 15).");
    }

    // Aseguradora
    if (!formData.aseguradora) {
      newErrors.aseguradora = "Seleccione una aseguradora.";
      msgs.push("• Aseguradora: seleccione una opción.");
    } else if (!aseguradorasGT.includes(formData.aseguradora)) {
      newErrors.aseguradora = "Seleccione una aseguradora válida.";
      msgs.push("• Aseguradora: debe ser una del listado.");
    }

    // Monto
    const montoNum = Number(formData.monto);
    if (formData.monto === "") {
      newErrors.monto = "El monto es obligatorio.";
      msgs.push("• Monto: obligatorio.");
    } else if (Number.isNaN(montoNum) || montoNum <= 0) {
      newErrors.monto = "El monto debe ser un número positivo.";
      msgs.push("• Monto: debe ser positivo.");
    } else if (montoNum > 100000) {
      newErrors.monto = "El monto no puede ser mayor a 100,000.";
      msgs.push("• Monto: ≤ 100,000.");
    }

    // Fechas
    if (!formData.fecha_emision) {
      newErrors.fecha_emision = "La fecha de emisión es obligatoria.";
      msgs.push("• Fecha de emisión: obligatoria.");
    } else {
      const fe = startOfDay(formData.fecha_emision);
      if (fe < today || fe > maxEmision) {
        newErrors.fecha_emision = "Emisión debe ser hoy o futura (≤ 3 meses).";
        msgs.push("• Fecha de emisión: hoy o hasta 3 meses.");
      }
    }

    if (!formData.fecha_vencimiento) {
      newErrors.fecha_vencimiento = "La fecha de vencimiento es obligatoria.";
      msgs.push("• Fecha de vencimiento: obligatoria.");
    } else {
      const fv = startOfDay(formData.fecha_vencimiento);
      const minV = startOfDay(formData.fecha_emision || today);
      if (fv < today) {
        newErrors.fecha_vencimiento = "Vencimiento no puede ser pasada.";
        msgs.push("• Fecha de vencimiento: no puede ser pasada.");
      } else if (fv < minV) {
        newErrors.fecha_vencimiento = "Vencimiento no puede ser anterior a la emisión.";
        msgs.push("• Fecha de vencimiento: no antes de la emisión.");
      }
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
        html: `<div style="text-align:left">${msgs.join("<br>")}</div>`,
      });
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/polizas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero_poliza: formData.numero_poliza,
          aseguradora: formData.aseguradora,
          monto: Number(formData.monto),
          fecha_emision: formData.fecha_emision,
          fecha_vencimiento: formData.fecha_vencimiento,
        }),
      });

      if (res.ok) {
        Swal.fire("Actualizado", "La póliza fue actualizada correctamente", "success");
        navigate("/polizas/consultar");
      } else {
        const err = await res.json().catch(() => ({}));
        Swal.fire("Error", err.error || "No se pudo actualizar la póliza", "error");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      Swal.fire("Error", "Error al actualizar la póliza", "error");
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="container">Cargando...</div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Editar Póliza</h2>
        <button
          className="btn btn-secondary mb-4"
          onClick={() => navigate("/polizas/consultar")}
        >
          <FaArrowLeft className="me-2" /> Volver
        </button>

        <form onSubmit={handleSubmit} noValidate>
          {/* Vehículo asignado (solo lectura, permanece igual) */}
          {vehiculo && (
            <div className="mb-3">
              <label className="form-label">Vehículo Asignado</label>
              <input type="text" className="form-control" value={vehiculo} readOnly />
            </div>
          )}

          {/* ===== FILA 1: 4 campos ===== */}
          <div className="row">
            {/* Número de Póliza */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Número de Póliza <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.numero_poliza ? "is-invalid" : ""}`}
                name="numero_poliza"
                value={formData.numero_poliza}
                onChange={handleChange}
                placeholder="Ej. ABC123456"
                maxLength={15}
                required
              />
              {errors.numero_poliza && (
                <div className="invalid-feedback">{errors.numero_poliza}</div>
              )}
              <div className="form-text">Solo letras y números, máx. 15.</div>
            </div>

            {/* Aseguradora */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Aseguradora <span className="text-danger">*</span></label>
              <select
                className={`form-select ${errors.aseguradora ? "is-invalid" : ""}`}
                name="aseguradora"
                value={formData.aseguradora}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione aseguradora</option>
                {aseguradorasGT.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              {errors.aseguradora && (
                <div className="invalid-feedback">{errors.aseguradora}</div>
              )}
            </div>

            {/* Monto */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Monto (Q) <span className="text-danger">*</span></label>
              <input
                type="number"
                className={`form-control ${errors.monto ? "is-invalid" : ""}`}
                name="monto"
                step="0.01"
                min="0.01"
                max="100000"
                value={formData.monto}
                onChange={handleChange}
                placeholder="Hasta 100,000"
                required
              />
              {errors.monto && <div className="invalid-feedback">{errors.monto}</div>}
            </div>

            {/* Fecha de Emisión */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha de Emisión <span className="text-danger">*</span></label>
              <input
                type="date"
                className={`form-control ${errors.fecha_emision ? "is-invalid" : ""}`}
                name="fecha_emision"
                value={formData.fecha_emision}
                onChange={handleChange}
                min={toYMD(today)}
                max={toYMD(maxEmision)}
                required
              />
              {errors.fecha_emision && (
                <div className="invalid-feedback">{errors.fecha_emision}</div>
              )}
              <div className="form-text">Hoy o hasta dentro de 3 meses.</div>
            </div>
          </div>

          {/* ===== FILA 2: 2 campos ===== */}
          <div className="row">
            {/* Fecha de Vencimiento */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha de Vencimiento <span className="text-danger">*</span></label>
              <input
                type="date"
                className={`form-control ${errors.fecha_vencimiento ? "is-invalid" : ""}`}
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={handleChange}
                min={toYMD(minVencimiento)}
                required
              />
              {errors.fecha_vencimiento && (
                <div className="invalid-feedback">{errors.fecha_vencimiento}</div>
              )}
              <div className="form-text">No puede ser pasada ni anterior a la emisión.</div>
            </div>

            {/* (Espacio para mantener 2 filas; puedes ubicar botones u otros campos aquí si luego agregas más) */}
            <div className="col-md-3 mb-3"></div>
          </div>

          <button type="submit" className="btn btn-primary">
            Guardar Cambios
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}
