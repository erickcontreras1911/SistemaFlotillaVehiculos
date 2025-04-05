import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ConsultarMantenimiento() {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [filtros, setFiltros] = useState({
    placa: "",
    tipo: "",
    taller: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerMantenimientos = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/mantenimientos");
        const data = await res.json();
        setMantenimientos(data);
      } catch (error) {
        console.error("Error al cargar mantenimientos:", error);
        Swal.fire("Error", "No se pudo obtener la lista de mantenimientos", "error");
      }
    };

    obtenerMantenimientos();
  }, []);

  const handleChangeFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value.toLowerCase() }));
  };

  const filtrarMantenimientos = () => {
    return mantenimientos.filter((m) =>
      (filtros.placa === "" || m.Vehiculo.toLowerCase().includes(filtros.placa)) &&
      (filtros.tipo === "" || m.Tipo_Mantenimiento.toLowerCase() === filtros.tipo) &&
      (filtros.taller === "" || m.Nombre_Taller.toLowerCase().includes(filtros.taller))
    );
  };
  

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Consultar Mantenimientos</h2>

        {/* Filtros */}
        <div className="row mb-4">
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              name="placa"
              placeholder="Buscar por placa..."
              value={filtros.placa}
              onChange={handleChangeFiltro}
            />
          </div>
          <div className="col-md-4 mb-2">
            <select
              className="form-select"
              name="tipo"
              value={filtros.tipo}
              onChange={handleChangeFiltro}
            >
              <option value="">Todos los tipos</option>
              <option value="Correctivo">Correctivo</option>
              <option value="Preventivo">Preventivo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              name="taller"
              placeholder="Buscar por taller..."
              value={filtros.taller}
              onChange={handleChangeFiltro}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Vehículo</th>
                <th>Tipo</th>
                <th>Título</th>
                <th>Taller</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrarMantenimientos().map((m) => (
                <tr key={m.ID_Mantenimiento}>
                  <td>{m.ID_Mantenimiento}</td>
                  <td>{m.Vehiculo}</td>
                  <td>{m.Tipo_Mantenimiento}</td>
                  <td>{m.Titulo_Mantenimiento}</td>
                  <td>{m.Nombre_Taller}</td>
                  <td>{new Date(m.Fecha).toLocaleDateString("es-GT")}</td>
                  <td className="text-center">
                    <div className="d-flex w-100 gap-2">
                        <button
                        className="btn btn-sm btn-primary flex-fill"
                        onClick={() => navigate(`/mantenimientos/detallar/${m.ID_Mantenimiento}`)}
                        >
                        <FaEye ClassName="me-1" />
                         Ver mas
                        </button>
                        <button
                        className="btn btn-sm btn-success flex-fill"
                        onClick={() => navigate(`/mantenimientos/modificar/${m.ID_Mantenimiento}`)}
                        >
                        <FaEdit ClassName="me-1" />
                         Editar
                        </button>
                        <button
                        className="btn btn-sm btn-danger flex-fill"
                        onClick={() => {
                            Swal.fire({
                            title: "¿Está seguro?",
                            text: "Esta acción eliminará el mantenimiento.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Sí, eliminar",
                            cancelButtonText: "Cancelar"
                            }).then(async (result) => {
                            if (result.isConfirmed) {
                                try {
                                const res = await fetch(`http://localhost:3001/api/mantenimientos/${m.ID_Mantenimiento}`, {
                                    method: "DELETE"
                                });
                                if (res.ok) {
                                    Swal.fire("Eliminado", "Mantenimiento eliminado", "success");
                                    setMantenimientos(prev =>
                                    prev.filter(mant => mant.ID_Mantenimiento !== m.ID_Mantenimiento)
                                    );
                                } else {
                                    Swal.fire("Error", "No se pudo eliminar", "error");
                                }
                                } catch (error) {
                                Swal.fire("Error", "Error al eliminar", "error");
                                }
                            }
                            });
                        }}
                        >
                        <FaTrash ClassName="me-1"/>
                         Eliminar
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrarMantenimientos().length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">No se encontraron resultados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
}
