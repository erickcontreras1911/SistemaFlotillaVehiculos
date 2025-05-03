import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

//import Swal from "sweetalert2";
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaEye, FaEdit, FaTrash } from "react-icons/fa";

export default function ConsultarPolizas() {
  const [polizasVigentes, setPolizasVigentes] = useState([]);
  const [polizasVencidas, setPolizasVencidas] = useState([]);
    
  const [vehiculosSinPoliza, setVehiculosSinPoliza] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerPolizas();
    obtenerVehiculosSinPoliza();
  }, []);

  const obtenerPolizas = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/polizas");
      const data = await res.json();
  
      const hoy = new Date();
  
      const vigentes = data.filter((p) => new Date(p.Fecha_Vencimiento) >= hoy);
      const vencidas = data.filter((p) => new Date(p.Fecha_Vencimiento) < hoy);
  
      setPolizasVigentes(vigentes);
      setPolizasVencidas(vencidas);
    } catch (error) {
      console.error("Error al cargar pólizas:", error);
    }
  };
  
  const eliminarPoliza = async (poliza) => {
    const hoy = new Date();
    const vencimiento = new Date(poliza.Fecha_Vencimiento);
  
    let mensajeConfirmacion = "¿Está seguro que desea eliminar esta póliza?";
    if (vencimiento >= hoy) {
      mensajeConfirmacion = "La póliza aún está vigente. ¿Está seguro que desea eliminarla?";
    }
  
    const confirmacion = await Swal.fire({
      title: "Eliminar Póliza",
      text: mensajeConfirmacion,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });
  
    if (confirmacion.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:3001/api/polizas/${poliza.ID_Poliza}`, {
          method: "DELETE"
        });
  
        if (res.ok) {
          Swal.fire("Eliminada", "La póliza fue eliminada exitosamente", "success");
          obtenerPolizas(); // Refrescar la lista
          obtenerVehiculosSinPoliza(); // Refrescar disponibles
        } else {
          Swal.fire("Error", "No se pudo eliminar la póliza", "error");
        }
      } catch (error) {
        console.error("Error:", error);
        Swal.fire("Error", "Error al eliminar la póliza", "error");
      }
    }
  };
  

  const obtenerVehiculosSinPoliza = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/polizas/vehiculos-disponibles");
      const data = await res.json();
      setVehiculosSinPoliza(data);
    } catch (error) {
      console.error("Error al cargar vehículos sin póliza:", error);
    }
  };

  const calcularColor = (fechaVencimiento) => {
    if (!fechaVencimiento) return { color: "secondary", icon: null };

    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const mesesRestantes = (vencimiento.getFullYear() - hoy.getFullYear()) * 12 + vencimiento.getMonth() - hoy.getMonth();

    if (mesesRestantes > 4) return { color: "success", icon: <FaCheckCircle /> };
    if (mesesRestantes >= 2) return { color: "warning", icon: <FaExclamationTriangle /> };
    return { color: "danger", icon: <FaExclamationTriangle /> };
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4 text-success">Pólizas Vigentes</h2>

        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Número de Póliza</th>
              <th>Vehículo</th>
              <th>Aseguradora</th>
              <th>Vencimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {polizasVigentes.map((p) => {
              const { color, icon } = calcularColor(p.Fecha_Vencimiento);
              return (
                <tr key={p.ID_Poliza}>
                  <td>{p.ID_Poliza}</td>
                  <td>{p.Numero_Poliza}</td>
                  <td>{`${p.Placa} - ${p.Marca} ${p.Linea} ${p.Modelo}`}</td>
                  <td>{p.Aseguradora}</td>
                  <td className={`text-${color} fw-bold`}>
                    {new Date(p.Fecha_Vencimiento).toLocaleDateString()} {icon}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary btn-sm flex-fill"
                        onClick={() => navigate(`/polizas/detalle/${p.ID_Poliza}`)}
                        >
                        <FaEye className="me-1" /> Ver más
                    </button>
                      <button className="btn btn-success btn-sm flex-fill" 
                      onClick={() => navigate(`/polizas/modificar/${p.ID_Poliza}`)}
                      >
                        <FaEdit className="me-1" /> Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm flex-fill"
                        onClick={() => eliminarPoliza(p)}
                        >
                        <FaTrash className="me-1" /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>


        {polizasVencidas.length > 0 && (
        <>
            <h2 className="mt-5 text-danger">Pólizas Vencidas</h2>
            <table className="table table-hover">
            <thead className="table-dark">
                <tr>
                <th>ID</th>
                <th>Número de Póliza</th>
                <th>Vehículo</th>
                <th>Aseguradora</th>
                <th>Vencimiento</th>
                <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {polizasVencidas.map((p) => (
                <tr key={p.ID_Poliza} className="table-danger">
                    <td>{p.ID_Poliza}</td>
                    <td>{p.Numero_Poliza}</td>
                    <td>{`${p.Placa} - ${p.Marca} ${p.Linea} ${p.Modelo}`}</td>
                    <td>{p.Aseguradora}</td>
                    <td className="text-danger fw-bold">
                    {new Date(p.Fecha_Vencimiento).toLocaleDateString()}
                    <FaTimesCircle className="ms-2" />
                    </td>
                    <td>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-primary btn-sm flex-fill"
                            onClick={() => navigate(`/polizas/detalle/${p.ID_Poliza}`)}
                            >
                            <FaEye className="me-1" /> Ver más
                        </button>
                        <button 
                            className="btn btn-success btn-sm flex-fill"
                            onClick={() => navigate(`/polizas/modificar/${p.ID_Poliza}`)}
                            >
                            <FaEdit className="me-1" /> Editar
                        </button>
                        <button
                            className="btn btn-danger btn-sm flex-fill"
                            onClick={() => eliminarPoliza(p)}
                            >
                            <FaTrash className="me-1" /> Eliminar
                        </button>

                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </>
        )}


        {vehiculosSinPoliza.length > 0 && (
          <>
            <h3 className="mt-5 text-warning">Vehículos Sin Póliza</h3>
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Placa</th>
                  <th>Tipo</th>
                  <th>Marca</th>
                  <th>Línea</th>
                  <th>Modelo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {vehiculosSinPoliza.map((v) => (
                  <tr key={v.ID_Vehiculo}  className="table-warning">
                    <td>{v.ID_Vehiculo}</td>
                    <td>{v.Placa}</td>
                    <td>{v.Tipos}</td>
                    <td>{v.Marca}</td>
                    <td>{v.Linea}</td>
                    <td>{v.Modelo}</td>
                    <td>{v.Estatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
