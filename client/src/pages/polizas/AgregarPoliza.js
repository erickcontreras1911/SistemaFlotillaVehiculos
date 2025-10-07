import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// Constante por vista (mantenible)
const BACKEND_URL = "https://sistemaflotillavehiculos.onrender.com".replace(/\/$/, "");

// Helpers de fecha
const toYMD = (d) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const addMonths = (d, months) => {
  const x = new Date(d);
  const day = x.getDate();
  x.setMonth(x.getMonth() + months);

  // Ajuste por meses con menos días
  if (x.getDate() < day) {
    x.setDate(0); // último día del mes anterior al “overflow”
  }
  return x;
};

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
  const [errors, setErrors] = useState({});
  const [vehiculosDisponibles, setVehiculosDisponibles] = useState([]);

  // Fechas límite
  const today = startOfDay(new Date());
  const maxEmision = addMonths(today, 3);
  const minVencimiento = startOfDay(formData.fecha_emision || today);

  // Aseguradoras (Guatemala)
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

  // Cargar vehículos sin póliza
  const obtenerVehiculosSinPoliza = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/polizas/vehiculos-disponibles`);
      const data = await res.json();
      setVehiculosDisponibles(data);

      if (data.length === 0) {
        Swal.fire({
          icon: "success",
          title: "¡Todos los vehículos cubiertos!",
          text: "Todos los vehículos activos ya tienen póliza asignada.",
          confirmButtonColor: "#28a745",
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

  // Handlers con saneo
  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "numero_poliza") {
      v = v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    }

    if (name === "monto") {
      // Permitimos vacío mientras escribe; validamos al guardar
      // (no forzamos aquí para no pelear con el input)
      // Sólo evitamos caracteres no numéricos excepto punto.
      v = v.replace(/[^0-9.]/g, "");
    }

    if (name === "fecha_emision") {
      // Clamp visualmente a rango [today, today + 3m]
      const d = startOfDay(v);
      if (d < today) v = toYMD(today);
      if (d > maxEmision) v = toYMD(maxEmision);

      // Si vencimiento quedó antes de la nueva emisión, limpiarlo
      if (formData.fecha_vencimiento) {
        const fv = startOfDay(formData.fecha_vencimiento);
        if (fv < d) {
          setFormData((prev) => ({ ...prev, fecha_vencimiento: "" }));
        }
      }
    }

    if (name === "fecha_vencimiento") {
      // No pasada y no antes de emision si emision existe
      const min = startOfDay(formData.fecha_emision || today);
      const d = startOfDay(v);
      if (d < min) v = toYMD(min);
    }

    setFormData((prev) => ({ ...prev, [name]: v }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const msgs = [];

    // Vehículo
    if (!formData.id_vehiculo) {
      newErrors.id_vehiculo = "Debe seleccionar un vehículo disponible.";
      msgs.push("• Seleccione un vehículo disponible.");
    }

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

    // Monto (positivo, ≤ 100,000)
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
      const res = await fetch(`${BACKEND_URL}/api/polizas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire("Registrado", "La póliza fue guardada correctamente", "success");
        setFormData({
          id_vehiculo: "",
          numero_poliza: "",
          aseguradora: "",
          monto: "",
          fecha_emision: "",
          fecha_vencimiento: "",
        });
        obtenerVehiculosSinPoliza();
        navigate("/polizas/consultar");
      } else {
        const err = await res.json().catch(() => ({}));
        Swal.fire("Error", err.error || "No se pudo guardar la póliza", "error");
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

        <form onSubmit={handleSubmit} noValidate>
          {/* ===== FILA 1: 4 campos ===== */}
          <div className="row">
            {/* Vehículo */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Vehículo <span className="text-danger">*</span></label>
              <select
                className={`form-select ${errors.id_vehiculo ? "is-invalid" : ""}`}
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
              {errors.id_vehiculo && <div className="invalid-feedback">{errors.id_vehiculo}</div>}
            </div>

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
              {errors.numero_poliza && <div className="invalid-feedback">{errors.numero_poliza}</div>}
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
              {errors.aseguradora && <div className="invalid-feedback">{errors.aseguradora}</div>}
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
          </div>

          {/* ===== FILA 2: 2 campos ===== */}
          <div className="row">
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
              {errors.fecha_emision && <div className="invalid-feedback">{errors.fecha_emision}</div>}
              <div className="form-text">Hoy o hasta dentro de 3 meses.</div>
            </div>

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
              {errors.fecha_vencimiento && <div className="invalid-feedback">{errors.fecha_vencimiento}</div>}
              <div className="form-text">No puede ser pasada ni anterior a la emisión.</div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={vehiculosDisponibles.length === 0}>
            Guardar Póliza
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}
