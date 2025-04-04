import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import { FaArrowLeft } from "react-icons/fa";

export default function DetalleEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState(null);

  const obtenerEmpleado = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/empleados/${id}`);
      const data = await res.json();
      setEmpleado(data);
    } catch (error) {
      console.error("Error al cargar empleado:", error);
    }
  };

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return "";
    const fecha = new Date(fechaIso);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  useEffect(() => {
    obtenerEmpleado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!empleado) return <SidebarLayout><div className="container">Cargando...</div></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Detalle del Empleado</h2>

        <button className="btn btn-secondary mb-4" onClick={() => navigate("/empleados/consultar")}> 
          <FaArrowLeft className="me-2" /> Volver
        </button>

        <form>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombres</label>
              <input type="text" className="form-control" value={empleado.Nombres} readOnly />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Apellidos</label>
              <input type="text" className="form-control" value={empleado.Apellidos} readOnly />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">DPI</label>
              <input type="text" className="form-control" value={empleado.DPI} readOnly />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Teléfono</label>
              <input type="text" className="form-control" value={empleado.Telefono} readOnly />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Dirección</label>
              <input type="text" className="form-control" value={empleado.Direccion} readOnly />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={empleado.Email} readOnly />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha Nacimiento</label>
              <input type="text" className="form-control" value={formatearFecha(empleado.Fecha_Nacimiento)} readOnly />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha Contratación</label>
              <input type="text" className="form-control" value={formatearFecha(empleado.Fecha_Contratacion)} readOnly />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Salario</label>
              <input type="text" className="form-control" value={`Q ${empleado.Salario}`} readOnly />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Rol</label>
              <input type="text" className="form-control" value={empleado.Rol} readOnly />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Estatus</label>
              <input type="text" className="form-control" value={empleado.Estatus} readOnly />
            </div>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}