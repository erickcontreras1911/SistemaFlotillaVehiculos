import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../../layouts/SidebarLayout";
import Swal from "sweetalert2";
import Select from "react-select";

export default function EditarMantenimiento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [talleres, setTalleres] = useState([]);
  const [formData, setFormData] = useState({
    id_vehiculo: "",
    tipo_mantenimiento: "",
    fecha: "",
    kilometraje: "",
    titulo_mantenimiento: "",
    descripcion: "",
    id_taller: "",
    costo: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMant, resVehiculos, resTalleres] = await Promise.all([
          fetch(`http://localhost:3001/api/mantenimientos/${id}`),
          fetch("http://localhost:3001/api/vehiculos/activos"),
          fetch("http://localhost:3001/api/talleres")
        ]);

        const mantenimiento = await resMant.json();
        const vehiculosData = await resVehiculos.json();
        const talleresData = await resTalleres.json();

        setVehiculos(vehiculosData);
        setTalleres(talleresData);

        setFormData({
          id_vehiculo: String(mantenimiento.ID_Vehiculo),
          tipo_mantenimiento: mantenimiento.Tipo_Mantenimiento,
          fecha: mantenimiento.Fecha.slice(0, 10),
          kilometraje: mantenimiento.Kilometraje || "",
          titulo_mantenimiento: mantenimiento.Titulo_Mantenimiento,
          descripcion: mantenimiento.Descripcion || "",
          id_taller: mantenimiento.ID_Taller || "",
          costo: mantenimiento.Costo || ""
        });
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Swal.fire("Error", "No se pudieron cargar los datos", "error");
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/api/mantenimientos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        Swal.fire("Éxito", "Mantenimiento actualizado correctamente", "success");
        navigate("/mantenimientos/consultar");
      } else {
        Swal.fire("Error", "No se pudo actualizar el mantenimiento", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "Error de red", "error");
    }
  };

  const vehiculoOptions = vehiculos.map((v) => ({
    value: String(v.ID_Vehiculo),
    label: `${v.Placa} - ${v.Marca} ${v.Linea} ${v.Modelo}`
  }));

  const selectedVehiculo = vehiculoOptions.find(
    (opt) => opt.value === formData.id_vehiculo
  );

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Editar Mantenimiento</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Vehículo */}
            <div className="col-md-12 mb-3">
              <label className="form-label">Vehículo *</label>
              <Select
                options={vehiculoOptions}
                value={selectedVehiculo}
                onChange={(selected) =>
                  setFormData((prev) => ({ ...prev, id_vehiculo: selected.value }))
                }
                placeholder="Seleccione un vehículo"
                isSearchable
              />
            </div>

            {/* Tipo de mantenimiento */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Tipo de Mantenimiento *</label>
              <select
                name="tipo_mantenimiento"
                className="form-select"
                value={formData.tipo_mantenimiento}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione tipo</option>
                <option value="Correctivo">Correctivo</option>
                <option value="Preventivo">Preventivo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Fecha */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Fecha *</label>
              <input
                type="date"
                name="fecha"
                className="form-control"
                value={formData.fecha}
                onChange={handleChange}
                required
              />
            </div>

            {/* Kilometraje */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Kilometraje</label>
              <input
                type="number"
                name="kilometraje"
                className="form-control"
                value={formData.kilometraje}
                onChange={handleChange}
              />
            </div>

            {/* Costo */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Costo</label>
              <input
                type="number"
                step="0.01"
                name="costo"
                className="form-control"
                value={formData.costo}
                onChange={handleChange}
              />
            </div>

            {/* Título */}
            <div className="col-12 mb-3">
              <label className="form-label">Título del Mantenimiento *</label>
              <input
                type="text"
                name="titulo_mantenimiento"
                className="form-control"
                value={formData.titulo_mantenimiento}
                onChange={handleChange}
                required
              />
            </div>

            {/* Descripción */}
            <div className="col-12 mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                name="descripcion"
                className="form-control"
                rows="4"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </div>

            {/* Taller */}
            <div className="col-md-12 mb-4">
              <label className="form-label">Taller</label>
              <select
                name="id_taller"
                className="form-select"
                value={formData.id_taller}
                onChange={handleChange}
              >
                <option value="">Seleccione un taller</option>
                {talleres.map((t) => (
                  <option key={t.ID_Taller} value={t.ID_Taller}>
                    {t.Nombre_Taller}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                Guardar Cambios
              </button>
            </div>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}