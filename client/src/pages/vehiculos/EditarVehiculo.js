import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";

export default function EditarVehiculo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const obtenerVehiculo = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/vehiculos/${id}`);
        const data = await res.json();
        setFormData(data);
      } catch (error) {
        console.error("Error al obtener vehículo:", error);
        Swal.fire("Error", "No se pudo cargar la información del vehículo", "error");
      }
    };
    obtenerVehiculo();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/api/vehiculos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        Swal.fire("Vehículo actualizado", "Los datos fueron guardados correctamente", "success");
        navigate("/vehiculos/consultar");
      } else {
        Swal.fire("Error", "No se pudo actualizar el vehículo", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Hubo un error de red", "error");
    }
  };

  if (!formData) return <SidebarLayout><div className="container">Cargando...</div></SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Editar Vehículo</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-2 mb-3">
              <label className="form-label">ID Vehículo</label>
              <input type="text" className="form-control" value={formData.ID_Vehiculo} readOnly />
            </div>

            <div className="col-md-2 mb-3">
              <label className="form-label">Placa *</label>
              <input type="text" className="form-control" name="Placa" value={formData.Placa} onChange={handleChange} required />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Tipo *</label>
              <select className="form-select" name="Tipos" value={formData.Tipos} onChange={handleChange} required>
                <option value="">Seleccione tipo</option>
                <option value="Camion">Camion</option>
                <option value="Panel">Panel</option>
                <option value="Pickup">Pickup</option>
                <option value="Sedan">Sedan</option>
                <option value="Motocicleta">Motocicleta</option>
              </select>
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Marca</label>
              <input type="text" className="form-control" name="Marca" value={formData.Marca} onChange={handleChange} />
            </div>

            <div className="col-md-2 mb-3">
              <label className="form-label">Modelo</label>
              <input type="number" className="form-control" name="Modelo" value={formData.Modelo} onChange={handleChange} />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Línea</label>
              <input type="text" className="form-control" name="Linea" value={formData.Linea} onChange={handleChange} />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Chasis</label>
              <input type="text" className="form-control" name="Chasis" value={formData.Chasis} onChange={handleChange} />
            </div>

            <div className="col-md-2 mb-3">
              <label className="form-label">Color</label>
              <input type="text" className="form-control" name="Color" value={formData.Color} onChange={handleChange} />
            </div>

            <div className="col-md-2 mb-3">
              <label className="form-label">Asientos</label>
              <input type="number" className="form-control" name="Asientos" value={formData.Asientos} onChange={handleChange} />
            </div>

            <div className="col-md-2 mb-3">
              <label className="form-label">Motor</label>
              <input type="text" className="form-control" name="Motor" value={formData.Motor} onChange={handleChange} />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Combustible</label>
              <select className="form-select" name="Combustible" value={formData.Combustible} onChange={handleChange}>
                <option value="">Seleccione</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Diesel">Diesel</option>
              </select>
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Transmisión</label>
              <select className="form-select" name="Transmision" value={formData.Transmision} onChange={handleChange}>
                <option value="">Seleccione</option>
                <option value="Automática">Automática</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Estatus</label>
              <input type="text" className="form-control" name="Estatus" value={formData.Estatus} onChange={handleChange} />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">Impuesto Anual</label>
              <input type="number" className="form-control" name="Impuesto_Circulacion_Anual" value={formData.Impuesto_Circulacion_Anual} onChange={handleChange} />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Impuesto Año Actual</label>
              <select className="form-select" name="Impuesto_Anio_Actual" value={formData.Impuesto_Anio_Actual} onChange={handleChange}>
                <option value="">Seleccione</option>
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Kilometraje Actual</label>
              <input type="number" className="form-control" name="Kilometraje" value={formData.Kilometraje} onChange={handleChange} />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Fecha Impresión Tarjeta</label>
              <input type="date" className="form-control" name="Impresion_Tarjeta_Circulacion" value={formData.Impresion_Tarjeta_Circulacion?.split("T")[0]} onChange={handleChange} />
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
