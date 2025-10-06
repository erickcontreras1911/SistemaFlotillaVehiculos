import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";

const BACKEND_URL = "http://localhost:3001";

export default function EditarEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    dpi: "",
    telefono: "",
    direccion: "",
    email: "",
    fecha_nacimiento: "",
    fecha_contratacion: "",
    salario: "",
    id_rol: "",
    estatus: "Activo"
  });

  const [errors, setErrors] = useState({});

  // ===== Helpers =====
  const onlyDigits = (s) => (s || "").replace(/\D/g, "");

  const isValidEmail = (email) => {
    // algo@algo.algo (acepta .com, .org, .edu.gt, etc.)
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(String(email || "").toLowerCase());
  };

  const getAge = (isoDate) => {
    if (!isoDate) return 0;
    const today = new Date();
    const birth = new Date(isoDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const isPastOrToday = (isoDate) => {
    if (!isoDate) return false;
    const d = new Date(isoDate);
    const t = new Date();
    d.setHours(0, 0, 0, 0);
    t.setHours(0, 0, 0, 0);
    return d.getTime() <= t.getTime();
  };

  // ===== Cargar datos del empleado =====
  useEffect(() => {
    const obtenerEmpleado = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/empleados/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el empleado");
        const data = await res.json();

        setFormData({
          nombres: data.Nombres || "",
          apellidos: data.Apellidos || "",
          dpi: data.DPI || "",
          telefono: data.Telefono || "",
          direccion: data.Direccion || "",
          email: (data.Email || "").toLowerCase(),
          fecha_nacimiento: data.Fecha_Nacimiento ? String(data.Fecha_Nacimiento).split("T")[0] : "",
          fecha_contratacion: data.Fecha_Contratacion ? String(data.Fecha_Contratacion).split("T")[0] : "",
          salario: data.Salario ?? "",
          id_rol: data.ID_Rol ?? "",
          estatus: data.Estatus || "Activo"
        });
      } catch (error) {
        console.error("Error al cargar empleado:", error);
        Swal.fire("Error", "No se pudo cargar el empleado", "error");
      }
    };
    obtenerEmpleado();
  }, [id]);

  // ===== OnChange con normalizaciones y limpieza de error por campo =====
  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "dpi") {
      value = onlyDigits(value).slice(0, 13);
    }
    if (name === "telefono") {
      value = onlyDigits(value).slice(0, 8);
    }
    if (name === "email") {
      value = value.trim().toLowerCase();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // ===== Validación completa =====
  const validateForm = () => {
    const newErrors = {};
    const messages = [];

    // Requeridos
    if (!formData.nombres.trim()) {
      newErrors.nombres = "Este campo es obligatorio.";
      messages.push("• Nombres es obligatorio.");
    }
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Este campo es obligatorio.";
      messages.push("• Apellidos es obligatorio.");
    }

    // DPI: exactamente 13 dígitos
    if (!formData.dpi || formData.dpi.length !== 13) {
      newErrors.dpi = "El DPI debe tener exactamente 13 dígitos numéricos.";
      messages.push("• DPI: exactamente 13 dígitos numéricos.");
    }

    // Teléfono: requerido, 8 dígitos
    if (!formData.telefono || formData.telefono.length !== 8) {
      newErrors.telefono = "El teléfono debe tener 8 dígitos numéricos.";
      messages.push("• Teléfono: 8 dígitos numéricos.");
    }

    // Email: requerido, formato válido
    if (!formData.email) {
      newErrors.email = "El correo es obligatorio.";
      messages.push("• Correo: es obligatorio.");
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Formato de correo inválido (debe incluir @ y dominio).";
      messages.push("• Correo: formato inválido (debe incluir @ y dominio, ej. .com, .edu.gt).");
    }

    // Nacimiento: requerido y mayor de edad
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = "La fecha de nacimiento es obligatoria.";
      messages.push("• Fecha de nacimiento: es obligatoria.");
    } else if (getAge(formData.fecha_nacimiento) < 18) {
      newErrors.fecha_nacimiento = "El empleado debe ser mayor de edad (≥ 18).";
      messages.push("• Fecha de nacimiento: debe ser mayor de edad (≥ 18).");
    }

    // Contratación: requerida, no futura
    if (!formData.fecha_contratacion) {
      newErrors.fecha_contratacion = "La fecha de contratación es obligatoria.";
      messages.push("• Fecha de contratación: es obligatoria.");
    } else if (!isPastOrToday(formData.fecha_contratacion)) {
      newErrors.fecha_contratacion = "La fecha de contratación no puede ser futura.";
      messages.push("• Fecha de contratación: no puede ser futura.");
    }

    // Salario: requerido, numérico, rango 3500–75000
    const salarioNum = parseFloat(formData.salario);
    if (formData.salario === "") {
      newErrors.salario = "El salario es obligatorio.";
      messages.push("• Salario: es obligatorio.");
    } else if (Number.isNaN(salarioNum)) {
      newErrors.salario = "El salario debe ser numérico.";
      messages.push("• Salario: debe ser numérico.");
    } else if (salarioNum < 3500 || salarioNum > 75000) {
      newErrors.salario = "El salario debe estar entre 3500 y 75000.";
      messages.push("• Salario: debe estar entre 3500 y 75000.");
    }

    // Rol: requerido
    if (!formData.id_rol) {
      newErrors.id_rol = "Seleccione un rol.";
      messages.push("• Rol: es obligatorio.");
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, messages };
  };

  // ===== Submit =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { isValid, messages } = validateForm();
    if (!isValid) {
      Swal.fire({
        icon: "error",
        title: "Revisa los campos",
        html: `<div style="text-align:left">${messages.join("<br>")}</div>`
      });
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/empleados/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData) // evita enviar null; usa strings/valores válidos
      });

      if (res.ok) {
        Swal.fire("Actualizado", "Empleado actualizado correctamente", "success");
        navigate("/empleados/consultar");
      } else {
        const err = await res.json().catch(() => ({}));
        Swal.fire("Error", err.error || "No se pudo actualizar el empleado", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Hubo un problema de red", "error");
    }
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-2">Editar Empleado</h2>
        <p className="text-muted mb-4">
          Los campos marcados con <span className="text-danger">*</span> son obligatorios.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="row">
            {/* Nombres */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombres <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.nombres ? "is-invalid" : ""}`}
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
              {errors.nombres && <div className="invalid-feedback">{errors.nombres}</div>}
            </div>

            {/* Apellidos */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Apellidos <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.apellidos ? "is-invalid" : ""}`}
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
              {errors.apellidos && <div className="invalid-feedback">{errors.apellidos}</div>}
            </div>

            {/* DPI */}
            <div className="col-md-6 mb-3">
              <label className="form-label">DPI <span className="text-danger">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={13}
                className={`form-control ${errors.dpi ? "is-invalid" : ""}`}
                name="dpi"
                value={formData.dpi}
                onChange={handleChange}
                required
                placeholder="13 dígitos"
              />
              {errors.dpi && <div className="invalid-feedback">{errors.dpi}</div>}
            </div>

            {/* Teléfono */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Teléfono <span className="text-danger">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                className={`form-control ${errors.telefono ? "is-invalid" : ""}`}
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                placeholder="8 dígitos"
              />
              {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
            </div>

            {/* Dirección (opcional) */}
            <div className="col-12 mb-3">
              <label className="form-label">Dirección</label>
              <textarea
                className="form-control"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Correo electrónico <span className="text-danger">*</span></label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ejemplo@dominio.com"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            {/* Fecha de nacimiento */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha de Nacimiento <span className="text-danger">*</span></label>
              <input
                type="date"
                className={`form-control ${errors.fecha_nacimiento ? "is-invalid" : ""}`}
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
              />
              {errors.fecha_nacimiento && <div className="invalid-feedback">{errors.fecha_nacimiento}</div>}
            </div>

            {/* Fecha de contratación */}
            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha de Contratación <span className="text-danger">*</span></label>
              <input
                type="date"
                className={`form-control ${errors.fecha_contratacion ? "is-invalid" : ""}`}
                name="fecha_contratacion"
                value={formData.fecha_contratacion}
                onChange={handleChange}
                required
              />
              {errors.fecha_contratacion && <div className="invalid-feedback">{errors.fecha_contratacion}</div>}
            </div>

            {/* Salario */}
            <div className="col-md-4 mb-3">
              <label className="form-label">Salario (Q) <span className="text-danger">*</span></label>
              <input
                type="number"
                className={`form-control ${errors.salario ? "is-invalid" : ""}`}
                name="salario"
                step="0.01"
                min="3500"
                max="75000"
                value={formData.salario}
                onChange={handleChange}
                required
                placeholder="Entre 3500 y 75000"
              />
              {errors.salario && <div className="invalid-feedback">{errors.salario}</div>}
            </div>

            {/* Rol */}
            <div className="col-md-4 mb-3">
              <label className="form-label">Rol <span className="text-danger">*</span></label>
              <select
                className={`form-select ${errors.id_rol ? "is-invalid" : ""}`}
                name="id_rol"
                value={formData.id_rol}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un rol</option>
                <option value="1">Administrador</option>
                <option value="2">Supervisor</option>
                <option value="3">Piloto</option>
                <option value="4">Gerente</option>
                <option value="5">Mecánico</option>
              </select>
              {errors.id_rol && <div className="invalid-feedback">{errors.id_rol}</div>}
            </div>

            {/* Estatus (opcional) */}
            <div className="col-md-4 mb-3">
              <label className="form-label">Estatus</label>
              <select
                className="form-select"
                name="estatus"
                value={formData.estatus}
                onChange={handleChange}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">Guardar Cambios</button>
        </form>
      </div>
    </SidebarLayout>
  );
}
