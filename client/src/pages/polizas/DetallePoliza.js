import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import { FaArrowLeft } from "react-icons/fa";
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";
const BACKEND_URL = "http://localhost:3001";

export default function DetallePoliza() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poliza, setPoliza] = useState(null);

  useEffect(() => {
    const obtenerPoliza = async () => {
      try { 
        const res = await fetch(`${BACKEND_URL}/api/polizas/${id}`);
        const data = await res.json();
        setPoliza(data);
      } catch (error) {
        console.error("Error al obtener póliza:", error);
      }
    };

    obtenerPoliza();
  }, [id]);

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return "";
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString();
  };

  const calcularAlertaVencimiento = (fechaVencimiento) => {
    if (!fechaVencimiento) return null;
  
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferenciaMs = vencimiento - hoy;
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    const meses = diferenciaMs / (1000 * 60 * 60 * 24 * 30.44); // Aprox
  
    if (dias === 0) {
      return {
        tipo: "danger",
        mensaje: "¡Atención! La póliza vence hoy.",
        icono: <FaTimesCircle className="me-2" />
      };
    }
  
    if (dias < 0) {
      return {
        tipo: "danger",
        mensaje: `¡Atención! La póliza ya venció hace ${Math.abs(dias)} días.`,
        icono: <FaTimesCircle className="me-2" />
      };
    }
  
    if (meses > 4) {
      return {
        tipo: "success",
        mensaje: `Faltan ${dias} días para que venza la póliza.`,
        icono: <FaCheckCircle className="me-2" />
      };
    } else if (meses >= 2) {
      return {
        tipo: "warning",
        mensaje: `La póliza vence pronto: faltan ${dias} días.`,
        icono: <FaExclamationTriangle className="me-2" />
      };
    } else {
      return {
        tipo: "danger",
        mensaje: `¡Atención! La póliza vence en ${dias} días.`,
        icono: <FaTimesCircle className="me-2" />
      };
    }
  };
  
  

  if (!poliza) return <SidebarLayout><div className="container">Cargando...</div></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Detalle de la Póliza</h2>
        <button className="btn btn-secondary mb-4" onClick={() => navigate("/polizas/consultar")}> <FaArrowLeft className="me-2" /> Volver </button>

        <form>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Número de Póliza</label>
              <input type="text" className="form-control" value={poliza.Numero_Poliza} readOnly />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Aseguradora</label>
              <input type="text" className="form-control" value={poliza.Aseguradora} readOnly />
            </div>

            <div className="col-4 mb-3">
              <label className="form-label">Vehículo Asignado</label>
              <input
                type="text"
                className="form-control"
                value={`${poliza.Placa} - ${poliza.Marca} ${poliza.Linea} ${poliza.Modelo}`}
                readOnly
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Monto</label>
              <input type="text" className="form-control" value={`Q${parseFloat(poliza.Monto || 0).toFixed(2)}`} readOnly />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Fecha de Emisión</label>
              <input type="text" className="form-control" value={formatearFecha(poliza.Fecha_Emision)} readOnly />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Fecha de Vencimiento</label>
              <input type="text" className="form-control" value={formatearFecha(poliza.Fecha_Vencimiento)} readOnly />
            </div>

            
          </div>
        </form>

        {poliza.Fecha_Vencimiento && (
        (() => {
            const alerta = calcularAlertaVencimiento(poliza.Fecha_Vencimiento);
            return (
            <div className={`alert alert-${alerta.tipo} d-flex align-items-center`}>
                {alerta.icono}
                <div>{alerta.mensaje}</div>
            </div>
            );
        })()
        )}

      </div>
    </SidebarLayout>
  );
}