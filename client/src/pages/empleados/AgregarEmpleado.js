import { useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import {useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function AgregarEmpleado() {
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
    id_rol: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Aquí luego llamaremos a la API para insertar el empleado
    try {
        const response = await fetch("http://localhost:3001/api/empleados/agregar", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          
          if (response.ok) {
            Swal.fire("Empleado agregado", "El registro fue exitoso", "success");
            setFormData({
              nombres: "",
              apellidos: "",
              dpi: "",
              telefono: "",
              direccion: "",
              email: "",
              fecha_nacimiento: "",
              fecha_contratacion: "",
              salario: "",
              id_rol: ""
            });
            navigate("/empleados/consultar");
          } else {
            const errorData = await response.json();
            Swal.fire("Error", errorData.error || "No se pudo agregar el empleado", "error");
          }
          
    } catch (error) {
      Swal.fire("Error", "Hubo un problema al guardar el empleado", "error");
    }
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Agregar Empleado</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombres *</label>
              <input
                type="text"
                className="form-control"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Apellidos *</label>
              <input
                type="text"
                className="form-control"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">DPI *</label>
              <input
                type="text"
                className="form-control"
                name="dpi"
                value={formData.dpi}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-control"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Dirección</label>
              <textarea
                className="form-control"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha de Nacimiento</label>
              <input
                type="date"
                className="form-control"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha de Contratación</label>
              <input
                type="date"
                className="form-control"
                name="fecha_contratacion"
                value={formData.fecha_contratacion}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Salario</label>
              <input
                type="number"
                className="form-control"
                name="salario"
                step="0.01"
                value={formData.salario}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-8 mb-3">
              <label className="form-label">Rol *</label>
              <select
                className="form-select"
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
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Guardar Empleado
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}