import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
import Select from "react-select";

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

export default function EditarMantenimiento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [formData, setFormData] = useState({
    id_vehiculo: "",
    tipo_mantenimiento: "",
    fecha: "",
    kilometraje: "",
    titulo_mantenimiento: "",
    descripcion: "",
    id_taller: "",
    costo: "",
    frecuencia_servicio: "",
    kilometraje_proximo_servicio: ""
  });
  const [errors, setErrors] = useState({});

  // Límites de fecha: hoy ± 3 meses
  const today = useMemo(() => startOfDay(new Date()), []);
  const minDate = useMemo(() => addMonths(today, -3), [today]);
  const maxDate = useMemo(() => addMonths(today, 3), [today]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMant, resVehiculos, resTalleres] = await Promise.all([
          fetch(`${BACKEND_URL}/api/mantenimientos/${id}`),
          fetch(`${BACKEND_URL}/api/vehiculos/activos`),
          fetch(`${BACKEND_URL}/api/talleres`)
        ]);

        if (!resMant.ok) throw new Error("No se pudo obtener el mantenimiento");

        const mantenimiento = await resMant.json();
        const vehiculosData = await resVehiculos.json();
        const talleresData = await resTalleres.json();

        setVehiculos(vehiculosData);
        setTalleres(talleresData);

        setFormData({
          id_vehiculo: String(mantenimiento.ID_Vehiculo ?? ""),
          tipo_mantenimiento: mantenimiento.Tipo_Mantenimiento ?? "",
          fecha: mantenimiento.Fecha ? mantenimiento.Fecha.slice(0, 10) : "",
          kilometraje: (mantenimiento.Kilometraje ?? "").toString(),
          titulo_mantenimiento: mantenimiento.Titulo_Mantenimiento ?? "",
          descripcion: mantenimiento.Descripcion ?? "",
          id_taller: (mantenimiento.ID_Taller ?? "").toString(),
          costo: (mantenimiento.Costo ?? "").toString(),
          frecuencia_servicio: (mantenimiento.Frecuencia_Servicio ?? "").toString(),
          kilometraje_proximo_servicio: (mantenimiento.Kilometraje_Proximo_Servicio ?? "").toString()
        });
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Swal.fire("Error", "No se pudieron cargar los datos", "error");
      }
    };

    fetchData();
  }, [id]);

  // React-select options
  const vehiculoOptions = vehiculos.map((v) => ({
    value: String(v.ID_Vehiculo),
    label: `${v.Placa} - ${v.Marca} ${v.Linea} ${v.Modelo}`
  }));
  const selectedVehiculo = vehiculoOptions.find((opt) => opt.value === formData.id_vehiculo);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = { ...prev };

      if (name === "tipo_mantenimiento") {
        updated.tipo_mantenimiento = value;
        if (value === "Servicio de Motor") {
          updated.frecuencia_servicio = "7000";
        } else if (updated.frecuencia_servicio === "7000") {
          // si venía auto-seteado, lo dejamos editable en blanco
          updated.frecuencia_servicio = "";
        }
      } else if (name === "fecha") {
        // Clamp visual a rango permitido
        let v = value;
        const d = startOfDay(v);
        if (d < minDate) v = toYMD(minDate);
        if (d > maxDate) v = toYMD(maxDate);
        updated.fecha = v;
      } else if (name === "kilometraje" || name === "frecuencia_servicio") {
        // enteros no negativos
        const digits = value.replace(/\D/g, "");
        updated[name] = digits;

        const km = parseInt(name === "kilometraje" ? digits : updated.kilometraje, 10);
        const freq = parseInt(name === "frecuencia_servicio" ? digits : updated.frecuencia_servicio, 10);
        if (Number.isFinite(km) && Number.isFinite(freq)) {
          updated.kilometraje_proximo_servicio = String(km + freq);
        } else {
          updated.kilometraje_proximo_servicio = "";
        }
      } else if (name === "costo") {
        // decimal no negativo, un solo punto
        let v = value.replace(/[^0-9.]/g, "");
        const parts = v.split(".");
        if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
        updated.costo = v;
      } else {
        updated[name] = value;
      }

      return updated;
    });

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const msgs = [];

    if (!formData.id_vehiculo) {
      newErrors.id_vehiculo = "Debe seleccionar un vehículo.";
      msgs.push("• Vehículo: obligatorio.");
    }
    if (!formData.tipo_mantenimiento) {
      newErrors.tipo_mantenimiento = "Seleccione un tipo.";
      msgs.push("• Tipo de mantenimiento: obligatorio.");
    }

    if (!formData.fecha) {
      newErrors.fecha = "Seleccione una fecha.";
      msgs.push("• Fecha: obligatoria.");
    } else {
      const d = startOfDay(formData.fecha);
      if (d < minDate || d > maxDate) {
        newErrors.fecha = "La fecha debe estar dentro de los últimos 3 meses o los próximos 3 meses.";
        msgs.push("• Fecha: dentro de ± 3 meses desde hoy.");
      }
    }

    // Kilometraje (entero >= 0)
    const km = formData.kilometraje === "" ? NaN : parseInt(formData.kilometraje, 10);
    if (!Number.isInteger(km) || km < 0) {
      newErrors.kilometraje = "Kilometraje debe ser un entero no negativo.";
      msgs.push("• Kilometraje: entero ≥ 0.");
    }

    // Frecuencia servicio (entero >= 0)
    const freq = formData.frecuencia_servicio === "" ? NaN : parseInt(formData.frecuencia_servicio, 10);
    if (!Number.isInteger(freq) || freq < 0) {
      newErrors.frecuencia_servicio = "Frecuencia debe ser un entero no negativo.";
      msgs.push("• Frecuencia de servicio: entero ≥ 0.");
    }

    // Próximo servicio (km + freq) calculado
    if (Number.isInteger(km) && Number.isInteger(freq)) {
      const prox = km + freq;
      if (!(prox >= 0)) {
        newErrors.kilometraje_proximo_servicio = "Próximo servicio debe ser un entero no negativo.";
        msgs.push("• Próximo servicio: entero ≥ 0.");
      }
    }

    // Costo (opcional pero si viene debe ser >= 0)
    if (formData.costo !== "") {
      const c = Number(formData.costo);
      if (Number.isNaN(c) || c < 0) {
        newErrors.costo = "El costo debe ser un número no negativo.";
        msgs.push("• Costo: número ≥ 0.");
      }
    }

    if (!formData.titulo_mantenimiento.trim()) {
      newErrors.titulo_mantenimiento = "El título es obligatorio.";
      msgs.push("• Título del mantenimiento: obligatorio.");
    }

    if (!formData.id_taller) {
      newErrors.id_taller = "Seleccione un taller.";
      msgs.push("• Taller: obligatorio.");
    }

    setErrors(newErrors);

    if (msgs.length) {
      Swal.fire({
        icon: "error",
        title: "Revisa los campos",
        html: `<div style="text-align:left">${msgs.join("<br>")}</div>`
      });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/mantenimientos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_vehiculo: formData.id_vehiculo ? Number(formData.id_vehiculo) : null,
          tipo_mantenimiento: formData.tipo_mantenimiento,
          fecha: formData.fecha,
          kilometraje: formData.kilometraje === "" ? null : parseInt(formData.kilometraje, 10),
          titulo_mantenimiento: formData.titulo_mantenimiento,
          descripcion: formData.descripcion || "",
          id_taller: formData.id_taller ? Number(formData.id_taller) : null,
          costo: formData.costo === "" ? null : Number(formData.costo),
          frecuencia_servicio:
            formData.frecuencia_servicio === "" ? null : parseInt(formData.frecuencia_servicio, 10),
          kilometraje_proximo_servicio:
            formData.kilometraje_proximo_servicio === ""
              ? null
              : parseInt(formData.kilometraje_proximo_servicio, 10)
        })
      });

      if (res.ok) {
        Swal.fire("Éxito", "Mantenimiento actualizado correctamente", "success");
        navigate("/mantenimientos/consultar");
      } else {
        const err = await res.json().catch(() => ({}));
        Swal.fire("Error", err.error || "No se pudo actualizar el mantenimiento", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "Error de red", "error");
    }
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Editar Mantenimiento</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            {/* Vehículo */}
            <div className="col-md-12 mb-3">
              <label className="form-label">Vehículo <span className="text-danger">*</span></label>
              <Select
                options={vehiculoOptions}
                value={selectedVehiculo || null}
                onChange={(selected) =>
                  setFormData((prev) => ({ ...prev, id_vehiculo: selected ? selected.value : "" }))
                }
                placeholder="Seleccione un vehículo"
                isSearchable
              />
              {errors.id_vehiculo && <div className="text-danger small mt-1">{errors.id_vehiculo}</div>}
            </div>

            {/* Tipo de mantenimiento */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Tipo de Mantenimiento <span className="text-danger">*</span></label>
              <select
                name="tipo_mantenimiento"
                className={`form-select ${errors.tipo_mantenimiento ? "is-invalid" : ""}`}
                value={formData.tipo_mantenimiento}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione tipo</option>
                <option value="Correctivo">Correctivo</option>
                <option value="Preventivo">Preventivo</option>
                <option value="Servicio de Motor">Servicio de Motor</option>
                <option value="Otro">Otro</option>
              </select>
              {errors.tipo_mantenimiento && <div className="invalid-feedback">{errors.tipo_mantenimiento}</div>}
            </div>

            {/* Fecha */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Fecha <span className="text-danger">*</span></label>
              <input
                type="date"
                name="fecha"
                className={`form-control ${errors.fecha ? "is-invalid" : ""}`}
                value={formData.fecha}
                onChange={handleChange}
                min={toYMD(minDate)}
                max={toYMD(maxDate)}
                required
              />
              {errors.fecha && <div className="invalid-feedback">{errors.fecha}</div>}
              <div className="form-text">Solo fechas dentro de los últimos 3 meses o los próximos 3 meses.</div>
            </div>

            {/* Título */}
            <div className="col-12 mb-3">
              <label className="form-label">Título del Mantenimiento <span className="text-danger">*</span></label>
              <input
                type="text"
                name="titulo_mantenimiento"
                className={`form-control ${errors.titulo_mantenimiento ? "is-invalid" : ""}`}
                value={formData.titulo_mantenimiento}
                onChange={handleChange}
                required
              />
              {errors.titulo_mantenimiento && <div className="invalid-feedback">{errors.titulo_mantenimiento}</div>}
            </div>

            {/* Descripción */}
            <div className="col-12 mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                className="form-control"
                rows="4"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>

            {/* Kilometraje actual */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Kilometraje <span className="text-danger">*</span></label>
              <input
                type="number"
                name="kilometraje"
                className={`form-control ${errors.kilometraje ? "is-invalid" : ""}`}
                value={formData.kilometraje}
                onChange={handleChange}
                min="0"
                step="1"
                required
              />
              {errors.kilometraje && <div className="invalid-feedback">{errors.kilometraje}</div>}
            </div>

            {/* Frecuencia servicio */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Frecuencia de Servicio (km) <span className="text-danger">*</span></label>
              <input
                type="number"
                name="frecuencia_servicio"
                className={`form-control ${errors.frecuencia_servicio ? "is-invalid" : ""}`}
                value={formData.frecuencia_servicio}
                onChange={handleChange}
                min="0"
                step="1"
                readOnly={formData.tipo_mantenimiento === "Servicio de Motor"}
                required
              />
              {errors.frecuencia_servicio && <div className="invalid-feedback">{errors.frecuencia_servicio}</div>}
            </div>

            {/* Próximo servicio (calculado) */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Próximo Servicio (km)</label>
              <input
                type="number"
                className={`form-control ${errors.kilometraje_proximo_servicio ? "is-invalid" : ""}`}
                value={formData.kilometraje_proximo_servicio || ""}
                readOnly
              />
              {errors.kilometraje_proximo_servicio && (
                <div className="invalid-feedback">{errors.kilometraje_proximo_servicio}</div>
              )}
            </div>

            {/* Costo */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Costo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="costo"
                className={`form-control ${errors.costo ? "is-invalid" : ""}`}
                value={formData.costo}
                onChange={handleChange}
              />
              {errors.costo && <div className="invalid-feedback">{errors.costo}</div>}
            </div>

            <div className="col-md-12 mb-3">
              {/* Taller */}
              <select
                name="id_taller"
                className={`form-select ${errors.id_taller ? "is-invalid" : ""}`}
                value={formData.id_taller}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un taller</option>
                {talleres.map((t) => (
                  <option key={t.ID_Taller} value={t.ID_Taller}>
                    {t.Nombre_Taller}
                  </option>
                ))}
              </select>
              {errors.id_taller && <div className="invalid-feedback">{errors.id_taller}</div>}
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary">Guardar Cambios</button>
            </div>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}
