import { useMemo, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const BACKEND_URL = "http://localhost:3001"; // tu constante

// ===== Helpers de placa, asientos y validaciones =====
const getPrefixByTipo = (tipo) => {
  if (tipo === "Motocicleta") return "M";
  if (tipo === "Camion" || tipo === "Panel") return "C";
  if (tipo === "Sedan" || tipo === "Pickup") return "P";
  return "";
};

const getAsientosByTipo = (tipo) => {
  switch (tipo) {
    case "Motocicleta": return 2;
    case "Sedan": return 5;
    case "Camion": return 3;
    case "Panel": return 3;
    case "Pickup": return 5;
    default: return "";
  }
};

// Reconstruye la placa forzando prefijo + 3 dígitos + 3 letras
const sanitizePlaca = (input, prefix) => {
  if (!prefix) return "";
  const raw = (input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  let rest = raw.startsWith(prefix) ? raw.slice(1) : raw;

  let digits = "";
  let letters = "";
  for (const ch of rest) {
    if (digits.length < 3 && /[0-9]/.test(ch)) digits += ch;
    else if (digits.length === 3 && letters.length < 3 && /[A-Z]/.test(ch)) letters += ch;
    if (digits.length === 3 && letters.length === 3) break;
  }
  return `${prefix}${digits}${letters}`;
};

const placaRegex = (tipo) => {
  const p = getPrefixByTipo(tipo);
  if (!p) return /^$/; // no tipo aún
  return new RegExp(`^${p}[0-9]{3}[A-Z]{3}$`);
};

const colorHex = {
  Blanco: "#FFFFFF", Negro: "#000000", Gris: "#808080", Plata: "#C0C0C0",
  Azul: "#1E3A8A", Rojo: "#B91C1C", Verde: "#166534", Amarillo: "#FACC15",
  Naranja: "#FB923C", Café: "#8B4513", Beige: "#F5F5DC", Vino: "#800020",
  Dorado: "#D4AF37", Celeste: "#87CEEB", Morado: "#6B21A8"
};

export default function AgregarVehiculo() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tipos: "",
    placa: "",
    marca: "",
    linea: "",
    modelo: "",
    chasis: "",
    color: "",
    asientos: "",
    motor: "",
    combustible: "",
    transmision: "",
    impuesto_circulacion_anual: "",
    impuesto_anio_actual: "",
    kilometraje: "",
    impresion_tarjeta_circulacion: ""
  });

  const [errors, setErrors] = useState({});

  // ===== Marcas por tipo =====
  const marcasSedanPickup = [
    "Toyota", "Nissan", "Honda", "Hyundai", "Kia",
    "Chevrolet", "Ford", "Volkswagen", "Mazda", "Mitsubishi",
    "Subaru", "Renault", "Peugeot", "Suzuki", "BMW"
  ];

  const marcasCamionPanel = [
    "Hino", "Isuzu", "Fuso", "Iveco", "Mercedes-Benz",
    "Scania", "Volvo", "Freightliner", "International", "Kia"
  ];

  const marcasMoto = [
    "Honda", "Yamaha", "Suzuki", "Kawasaki", "KTM",
    "Bajaj", "TVS", "Royal Enfield", "Ducati", "BMW Motorrad"
  ];

  const opcionesMarca = useMemo(() => {
    if (formData.tipos === "Motocicleta") return marcasMoto;
    if (formData.tipos === "Camion" || formData.tipos === "Panel") return marcasCamionPanel;
    if (formData.tipos === "Sedan" || formData.tipos === "Pickup") return marcasSedanPickup;
    return [];
  }, [formData.tipos]);

  // ===== Handlers de cambios =====
  const handleTipoChange = (e) => {
    const tipo = e.target.value;
    const prefix = getPrefixByTipo(tipo);
    setFormData((prev) => ({
      ...prev,
      tipos: tipo,
      placa: sanitizePlaca(prev.placa, prefix),
      asientos: getAsientosByTipo(tipo),
      marca: "" // al cambiar tipo, forzamos nueva selección de marca
    }));
    setErrors((prev) => ({ ...prev, tipos: null, placa: null, asientos: null, marca: null }));
  };

  const handlePlacaChange = (e) => {
    const prefix = getPrefixByTipo(formData.tipos);
    const value = sanitizePlaca(e.target.value, prefix);
    setFormData((prev) => ({ ...prev, placa: value }));
    if (errors.placa) setErrors((prev) => ({ ...prev, placa: null }));
  };

  const handleLineaChange = (e) => {
    // Solo letras, números, espacio y guion
    const v = e.target.value.replace(/[^A-Za-z0-9\s-]/g, "");
    setFormData((prev) => ({ ...prev, linea: v }));
    if (errors.linea) setErrors((prev) => ({ ...prev, linea: null }));
  };

  const handleChasisChange = (e) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
    setFormData((prev) => ({ ...prev, chasis: v }));
    if (errors.chasis) setErrors((prev) => ({ ...prev, chasis: null }));
  };

  const handleModeloChange = (e) => {
    setFormData((prev) => ({ ...prev, modelo: e.target.value }));
    if (errors.modelo) setErrors((prev) => ({ ...prev, modelo: null }));
  };

  const handleMotorChange = (e) => {
    setFormData((prev) => ({ ...prev, motor: e.target.value }));
    if (errors.motor) setErrors((prev) => ({ ...prev, motor: null }));
  };

  const handleKilometrajeChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, kilometraje: v }));
    if (errors.kilometraje) setErrors((prev) => ({ ...prev, kilometraje: null }));
  };

  const handleGenericChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // ===== Validación completa =====
  const validateForm = () => {
    const newErrors = {};
    const msgs = [];
    const y = new Date().getFullYear();

    // Tipo
    if (!formData.tipos) {
      newErrors.tipos = "Seleccione el tipo de vehículo.";
      msgs.push("• Tipo: es obligatorio.");
    }

    // Placa
    const re = placaRegex(formData.tipos);
    if (!re.test(formData.placa)) {
      newErrors.placa = "Formato de placa inválido. Debe ser " +
        `${getPrefixByTipo(formData.tipos)}123ABC (1 letra según tipo, 3 dígitos y 3 letras).`;
      msgs.push("• Placa: formato inválido (ej. P123ABC, C456DEF, M789GHI).");
    }

    // Marca según tipo
    if (!formData.marca || !opcionesMarca.includes(formData.marca)) {
      newErrors.marca = "Seleccione una marca válida para el tipo elegido.";
      msgs.push("• Marca: seleccione una del listado para ese tipo.");
    }

    // Línea
    if (!formData.linea.trim()) {
      newErrors.linea = "La línea es obligatoria.";
      msgs.push("• Línea: es obligatoria.");
    } else if (/[^A-Za-z0-9\s-]/.test(formData.linea)) {
      newErrors.linea = "La línea contiene caracteres inválidos.";
      msgs.push("• Línea: solo letras, números, espacios y guiones.");
    }

    // Modelo
    const modeloNum = parseInt(formData.modelo, 10);
    if (Number.isNaN(modeloNum)) {
      newErrors.modelo = "Modelo debe ser numérico.";
      msgs.push("• Modelo: debe ser numérico.");
    } else if (modeloNum <= 2000 || modeloNum > y) {
      newErrors.modelo = `Modelo debe ser > 2000 y ≤ ${y}.`;
      msgs.push(`• Modelo: > 2000 y ≤ ${y}.`);
    }

    // Chasis
    if (formData.chasis && !/^[A-Z0-9]{1,20}$/.test(formData.chasis)) {
      newErrors.chasis = "Chasis debe ser alfanumérico (máx. 20).";
      msgs.push("• Chasis: alfanumérico (máx. 20).");
    }

    // Color
    if (!formData.color) {
      newErrors.color = "Seleccione un color.";
      msgs.push("• Color: es obligatorio.");
    }

    // Asientos (automático)
    const asientosNum = parseInt(formData.asientos, 10);
    if (Number.isNaN(asientosNum) || asientosNum <= 0) {
      newErrors.asientos = "Asientos inválidos.";
      msgs.push("• Asientos: automáticos según tipo.");
    }

    // Motor
    const motorNum = parseInt(formData.motor, 10);
    if (Number.isNaN(motorNum)) {
      newErrors.motor = "Motor debe ser numérico.";
      msgs.push("• Motor: debe ser numérico.");
    } else if (motorNum <= 1000 || motorNum > 6000) {
      newErrors.motor = "Motor debe ser > 1000 y ≤ 6000.";
      msgs.push("• Motor: > 1000 y ≤ 6000.");
    }

    // Impuestos
    const impAnual = parseFloat(formData.impuesto_circulacion_anual);
    if (Number.isNaN(impAnual) || impAnual < 0) {
      newErrors.impuesto_circulacion_anual = "Impuesto anual inválido.";
      msgs.push("• Impuesto anual: numérico (≥ 0).");
    }
    if (!formData.impuesto_anio_actual) {
      newErrors.impuesto_anio_actual = "Seleccione estado del impuesto del año actual.";
      msgs.push("• Impuesto año actual: seleccione estado.");
    }

    // Kilometraje
    const km = parseInt(formData.kilometraje, 10);
    if (Number.isNaN(km) || km <= 0) {
      newErrors.kilometraje = "Kilometraje debe ser entero mayor a 0.";
      msgs.push("• Kilometraje: entero > 0.");
    }

    // Impresión tarjeta (≤ 1 año de antigüedad)
    if (!formData.impresion_tarjeta_circulacion) {
      newErrors.impresion_tarjeta_circulacion = "La fecha de impresión es obligatoria.";
      msgs.push("• Fecha de impresión de tarjeta: es obligatoria.");
    } else {
      const today = new Date(); today.setHours(0,0,0,0);
      const d = new Date(formData.impresion_tarjeta_circulacion); d.setHours(0,0,0,0);
      const oneYearAgo = new Date(today); oneYearAgo.setFullYear(today.getFullYear() - 1);
      if (d < oneYearAgo) {
        newErrors.impresion_tarjeta_circulacion = "La impresión no puede tener más de 1 año de antigüedad.";
        msgs.push("• Impresión de tarjeta: no más de 1 año de antigüedad.");
      }
    }

    setErrors(newErrors);
    return { ok: Object.keys(newErrors).length === 0, msgs };
  };

  // ===== Submit =====
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
      const payload = {
        ...formData,
        placa: formData.placa.toUpperCase(),
        asientos: Number(formData.asientos),
        modelo: Number(formData.modelo),
        motor: Number(formData.motor),
        impuesto_circulacion_anual: Number(formData.impuesto_circulacion_anual),
        kilometraje: Number(formData.kilometraje)
      };

      const res = await fetch(`${BACKEND_URL}/api/vehiculos/agregar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire("Vehículo registrado", "El registro fue exitoso", "success");
        setFormData({
          tipos: "", placa: "", marca: "", linea: "", modelo: "",
          chasis: "", color: "", asientos: "", motor: "",
          combustible: "", transmision: "",
          impuesto_circulacion_anual: "", impuesto_anio_actual: "",
          kilometraje: "", impresion_tarjeta_circulacion: ""
        });
        setErrors({});
        navigate("/vehiculos/consultar");
      } else {
        const err = await res.json().catch(() => ({}));
        Swal.fire("Error", err.error || "No se pudo registrar el vehículo", "error");
      }
    } catch (error) {
      console.error("Error al registrar vehículo:", error);
      Swal.fire("Error", "Hubo un problema de red", "error");
    }
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-2">Agregar Vehículo</h2>
        <p className="text-muted mb-4">
          Los campos con <span className="text-danger">*</span> son obligatorios.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            {/* Tipo (primero) */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Tipo <span className="text-danger">*</span></label>
              <select
                className={`form-select ${errors.tipos ? "is-invalid" : ""}`}
                name="tipos"
                value={formData.tipos}
                onChange={handleTipoChange}
                required
              >
                <option value="">Seleccione tipo</option>
                <option value="Camion">Camion</option>
                <option value="Panel">Panel</option>
                <option value="Pickup">Pickup</option>
                <option value="Sedan">Sedan</option>
                <option value="Motocicleta">Motocicleta</option>
              </select>
              {errors.tipos && <div className="invalid-feedback">{errors.tipos}</div>}
            </div>

            {/* Placa (segundo) */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Placa <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.placa ? "is-invalid" : ""}`}
                name="placa"
                value={formData.placa}
                onChange={handlePlacaChange}
                placeholder={`${getPrefixByTipo(formData.tipos)}123ABC`}
                disabled={!formData.tipos} // bloqueado hasta elegir tipo
                required
              />
              {errors.placa && <div className="invalid-feedback">{errors.placa}</div>}
              <small className="text-muted">
                Formato: {getPrefixByTipo(formData.tipos) || "?"}123ABC
              </small>
            </div>

            {/* Marca (según tipo) */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Marca <span className="text-danger">*</span></label>
              <select
                className={`form-select ${errors.marca ? "is-invalid" : ""}`}
                name="marca"
                value={formData.marca}
                onChange={handleGenericChange}
                disabled={!formData.tipos}
                required
              >
                <option value="">{formData.tipos ? "Seleccione marca" : "Primero elija tipo"}</option>
                {opcionesMarca.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.marca && <div className="invalid-feedback">{errors.marca}</div>}
            </div>

            {/* Línea */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Línea <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.linea ? "is-invalid" : ""}`}
                name="linea"
                value={formData.linea}
                onChange={handleLineaChange}
                required
              />
              {errors.linea && <div className="invalid-feedback">{errors.linea}</div>}
            </div>

            {/* Modelo */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Modelo <span className="text-danger">*</span></label>
              <input
                type="number"
                className={`form-control ${errors.modelo ? "is-invalid" : ""}`}
                name="modelo"
                value={formData.modelo}
                onChange={handleModeloChange}
                min="2001"
                max={new Date().getFullYear()}
                step="1"
                required
              />
              {errors.modelo && <div className="invalid-feedback">{errors.modelo}</div>}
            </div>

            {/* Chasis */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Chasis</label>
              <input
                type="text"
                className={`form-control ${errors.chasis ? "is-invalid" : ""}`}
                name="chasis"
                value={formData.chasis}
                onChange={handleChasisChange}
                placeholder="Alfanumérico, máx. 20"
              />
              {errors.chasis && <div className="invalid-feedback">{errors.chasis}</div>}
            </div>

            {/* Color + preview */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Color <span className="text-danger">*</span></label>
              <div className="d-flex gap-2 align-items-center">
                <select
                  className={`form-select ${errors.color ? "is-invalid" : ""}`}
                  name="color"
                  value={formData.color}
                  onChange={handleGenericChange}
                  required
                >
                  <option value="">Seleccione color</option>
                  {Object.keys(colorHex).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div
                  title={formData.color || "—"}
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    border: "1px solid #ddd",
                    background: colorHex[formData.color] || "transparent"
                  }}
                />
              </div>
              {errors.color && <div className="invalid-feedback d-block">{errors.color}</div>}
            </div>

            {/* Asientos (automático) */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Asientos <span className="text-danger">*</span></label>
              <input
                type="number"
                className={`form-control ${errors.asientos ? "is-invalid" : ""}`}
                name="asientos"
                value={formData.asientos}
                readOnly
                disabled
              />
              {errors.asientos && <div className="invalid-feedback">{errors.asientos}</div>}
              <small className="text-muted">Se asigna automáticamente según el tipo.</small>
            </div>

            {/* Motor */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Motor (cc) <span className="text-danger">*</span></label>
              <input
                type="number"
                className={`form-control ${errors.motor ? "is-invalid" : ""}`}
                name="motor"
                value={formData.motor}
                onChange={handleMotorChange}
                min="1001" max="6000" step="1"
                required
              />
              {errors.motor && <div className="invalid-feedback">{errors.motor}</div>}
            </div>

            {/* Combustible */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Combustible</label>
              <select
                className="form-select"
                name="combustible"
                value={formData.combustible}
                onChange={handleGenericChange}
              >
                <option value="">Seleccione tipo</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Diesel">Diesel</option>
              </select>
            </div>

            {/* Transmisión */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Transmisión</label>
              <select
                className="form-select"
                name="transmision"
                value={formData.transmision}
                onChange={handleGenericChange}
              >
                <option value="">Seleccione tipo</option>
                <option value="Automática">Automática</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Impuestos */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Impuesto Anual (Q) <span className="text-danger">*</span></label>
              <input
                type="number"
                step="0.01"
                className={`form-control ${errors.impuesto_circulacion_anual ? "is-invalid" : ""}`}
                name="impuesto_circulacion_anual"
                value={formData.impuesto_circulacion_anual}
                onChange={handleGenericChange}
                required
              />
              {errors.impuesto_circulacion_anual && <div className="invalid-feedback">{errors.impuesto_circulacion_anual}</div>}
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Impuesto Año Actual <span className="text-danger">*</span></label>
              <select
                className={`form-select ${errors.impuesto_anio_actual ? "is-invalid" : ""}`}
                name="impuesto_anio_actual"
                value={formData.impuesto_anio_actual}
                onChange={handleGenericChange}
                required
              >
                <option value="">Seleccione estado</option>
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
              {errors.impuesto_anio_actual && <div className="invalid-feedback">{errors.impuesto_anio_actual}</div>}
            </div>

            {/* Kilometraje */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Kilometraje <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.kilometraje ? "is-invalid" : ""}`}
                name="kilometraje"
                value={formData.kilometraje}
                onChange={handleKilometrajeChange}
                placeholder="Entero > 0"
                required
              />
              {errors.kilometraje && <div className="invalid-feedback">{errors.kilometraje}</div>}
            </div>

            {/* Impresión tarjeta de circulación */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha Impresión Tarjeta <span className="text-danger">*</span></label>
              <input
                type="date"
                className={`form-control ${errors.impresion_tarjeta_circulacion ? "is-invalid" : ""}`}
                name="impresion_tarjeta_circulacion"
                value={formData.impresion_tarjeta_circulacion}
                onChange={handleGenericChange}
                required
              />
              {errors.impresion_tarjeta_circulacion && <div className="invalid-feedback">{errors.impresion_tarjeta_circulacion}</div>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary">Guardar Vehículo</button>
        </form>
      </div>
    </SidebarLayout>
  );
}
