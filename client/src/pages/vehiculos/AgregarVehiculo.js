import { useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import {useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function AgregarVehiculo() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    placa: "",
    tipos: "",
    marca: "",
    modelo: "",
    linea: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/api/vehiculos/agregar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        Swal.fire("Vehículo agregado", "El registro fue exitoso", "success");
        setFormData({
          placa: "",
          tipos: "",
          marca: "",
          modelo: "",
          linea: "",
          chasis: "",
          color: "",
          asientos: "",
          motor: "",
          combustible: "",
          transmision: "",
          impuesto_circulacion_anual: "",
          impuesto_anio_actual: "",
          poliza_seguro: "",
          kilometraje: "",
          impresion_tarjeta_circulacion: ""
        });
        navigate("/vehiculos/consultar");
      } else {
        Swal.fire("Error", "No se pudo registrar el vehículo", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Hubo un problema de red", "error");
    }
  };

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Agregar Vehículo</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label">Placa *</label>
              <input type="text" className="form-control" name="placa" value={formData.placa} onChange={handleChange} required />
            </div>
            <div className="col-md-3 mb-3">
                <label className="form-label">Tipo *</label>
                <select
                    className="form-select"
                    name="tipos"
                    value={formData.tipos}
                    onChange={handleChange}
                    required
                >
                    <option value="">Seleccione tipo</option>
                    <option value="Camion">Camion</option>
                    <option value="Panel">Panel</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Motocicleta">Motocicleta</option>
                </select>
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Marca *</label>
              <input type="text" className="form-control" name="marca" value={formData.marca} onChange={handleChange} required />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Línea *</label>
              <input type="text" className="form-control" name="linea" value={formData.linea} onChange={handleChange} required/>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Modelo *</label>
              <input type="number" className="form-control" name="modelo" value={formData.modelo} onChange={handleChange} required />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Chasis</label>
              <input type="text" className="form-control" name="chasis" value={formData.chasis} onChange={handleChange} />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Color</label>
              <input type="text" className="form-control" name="color" value={formData.color} onChange={handleChange} />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Asientos</label>
              <input type="number" className="form-control" name="asientos" value={formData.asientos} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Motor *</label>
              <input type="text" className="form-control" name="motor" value={formData.motor} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
                <label className="form-label">Combustible</label>
                <select
                    className="form-select"
                    name="combustible"
                    value={formData.combustible}
                    onChange={handleChange}
                >
                    <option value="">Seleccione tipo</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                </select>
            </div>

            <div className="col-md-4 mb-3">
                <label className="form-label">Transmisión</label>
                <select
                    className="form-select"
                    name="transmision"
                    value={formData.transmision}
                    onChange={handleChange}
                >
                    <option value="">Seleccione tipo</option>
                    <option value="Automática">Automática</option>
                    <option value="Manual">Manual</option>
                </select>
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Impuesto Anual *</label>
              <input type="number" step="0.01" className="form-control" name="impuesto_circulacion_anual" value={formData.impuesto_circulacion_anual} onChange={handleChange} required/>
            </div>
            <div className="col-md-3 mb-3">
                <label className="form-label">Impuesto Año Actual *</label>
                <select
                    className="form-select"
                    name="impuesto_anio_actual"
                    value={formData.impuesto_anio_actual}
                    onChange={handleChange} required
                >
                    <option value="">Seleccione estado</option>
                    <option value="Pagado">Pagado</option>
                    <option value="Pendiente">Pendiente</option>
                </select>
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Kilometraje *</label>
              <input type="number" className="form-control" name="kilometraje" value={formData.kilometraje} onChange={handleChange} required />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Fecha Impresión Tarjeta *</label>
              <input type="date" className="form-control" name="impresion_tarjeta_circulacion" value={formData.impresion_tarjeta_circulacion} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar Vehículo
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}