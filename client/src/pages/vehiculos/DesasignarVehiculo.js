import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
const BACKEND_URL = "http://localhost:3001";

export default function DesasignarVehiculo() {
  const [asignaciones, setAsignaciones] = useState([]);

  const obtenerAsignaciones = async () => {
    try {  
      const res = await fetch(`${BACKEND_URL}/api/asignacion/asignados`);
      const data = await res.json();
      setAsignaciones(data);
    } catch (error) {
      console.error("Error al cargar asignaciones:", error);
      Swal.fire("Error", "No se pudo cargar la información", "error");
    }
  };

  useEffect(() => {
    obtenerAsignaciones();
  }, []);

  const desasignar = async (asignacion) => {
    const confirmacion = await Swal.fire({
      title: `¿Desasignar vehículo ${asignacion.Placa}?`,
      text: `El piloto ${asignacion.Piloto} quedará libre`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desasignar",
      cancelButtonText: "Cancelar"
    });

    if (confirmacion.isConfirmed) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/asignacion/${asignacion.ID_Asignacion}`, {
          method: "DELETE" 
        });

        if (res.ok) {
          Swal.fire("Desasignado", "El vehículo fue liberado correctamente", "success");
          obtenerAsignaciones();
        } else {
          Swal.fire("Error", "No se pudo desasignar el vehículo", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Error al intentar desasignar", "error");
      }
    }
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Desasignar Vehículo</h2>

        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>Vehículo</th>
              <th>Piloto</th>
              <th>Fecha de Asignación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignaciones.length > 0 ? (
              asignaciones.map((a) => (
                <tr key={a.ID_Asignacion}>
                  <td>{`${a.Placa} - ${a.Marca} ${a.Linea} ${a.Modelo}`}</td>
                  <td>{a.Piloto}</td>
                  <td>{new Date(a.Fecha_Asignacion).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => desasignar(a)}>
                      Desasignar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">No hay vehículos asignados actualmente</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SidebarLayout>
  );
}
