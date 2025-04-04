import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";

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
    estatus: ""
  });

  useEffect(() => {
    const obtenerEmpleado = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/empleados/${id}`);
        const data = await res.json();

        setFormData({
          nombres: data.Nombres,
          apellidos: data.Apellidos,
          dpi: data.DPI,
          telefono: data.Telefono || "",
          direccion: data.Direccion || "",
          email: data.Email || "",
          fecha_nacimiento: data.Fecha_Nacimiento?.split("T")[0] || "",
          fecha_contratacion: data.Fecha_Contratacion?.split("T")[0] || "",
          salario: data.Salario || "",
          id_rol: data.ID_Rol || "",
          estatus: data.Estatus || "Activo"
        });
      } catch (error) {
        console.error("Error al cargar empleado:", error);
      }
    };
    obtenerEmpleado();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:3001/api/empleados/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        Swal.fire("Actualizado", "Empleado actualizado correctamente", "success");
        navigate("/empleados/consultar");
      } else {
        Swal.fire("Error", "No se pudo actualizar el empleado", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Hubo un problema de red", "error");
    }
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Editar Empleado</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombres</label>
              <input type="text" className="form-control" name="nombres" value={formData.nombres} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Apellidos</label>
              <input type="text" className="form-control" name="apellidos" value={formData.apellidos} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">DPI</label>
              <input type="text" className="form-control" name="dpi" value={formData.dpi} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Teléfono</label>
              <input type="text" className="form-control" name="telefono" value={formData.telefono} onChange={handleChange} />
            </div>
            <div className="col-12 mb-3">
              <label className="form-label">Dirección</label>
              <textarea className="form-control" name="direccion" value={formData.direccion} onChange={handleChange}></textarea>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha de Nacimiento</label>
              <input type="date" className="form-control" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha de Contratación</label>
              <input type="date" className="form-control" name="fecha_contratacion" value={formData.fecha_contratacion} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Salario</label>
              <input type="number" step="0.01" className="form-control" name="salario" value={formData.salario} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Rol</label>
              <select className="form-select" name="id_rol" value={formData.id_rol} onChange={handleChange} required>
                <option value="">Seleccione un rol</option>
                <option value="1">Administrador</option>
                <option value="2">Supervisor</option>
                <option value="3">Piloto</option>
                <option value="4">Gerente</option>
                <option value="5">Mecánico</option>
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Estatus</label>
              <select className="form-select" name="estatus" value={formData.estatus} onChange={handleChange}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar Cambios
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}