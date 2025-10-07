import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import SidebarLayout from "../../layouts/SidebarLayout";

// Constante por vista
const BACKEND_URL = "https://sistemaflotillavehiculos.onrender.com".replace(/\/$/, "");

export default function RegistrarKilometraje() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [nuevoKm, setNuevoKm] = useState("");
  const [recorrido, setRecorrido] = useState(0);

  const fmt = (n) => Number(n ?? 0).toLocaleString("es-GT");

  useEffect(() => {
    const fetchVehiculo = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/vehiculos/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el vehículo");
        const data = await res.json();
        setVehiculo(data);
      } catch (error) {
        Swal.fire("Error", "No se pudo cargar el vehículo", "error");
      }
    };
    fetchVehiculo();
  }, [id]);

  const handleNuevoKmChange = (e) => {
    if (!vehiculo) return;

    // Permitir borrar y reescribir: solo filtramos a dígitos
    const digits = e.target.value.replace(/\D/g, "");
    setNuevoKm(digits);

    const actual = Number(vehiculo.Kilometraje || 0);
    if (digits === "") {
      setRecorrido(0);
    } else {
      const num = parseInt(digits, 10);
      // El recorrido nunca se muestra negativo
      setRecorrido(Math.max(0, num - actual));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehiculo) return;

    const actual = Number(vehiculo.Kilometraje || 0);
    const kmNuevoNum = parseInt(nuevoKm, 10);

    if (
      Number.isNaN(kmNuevoNum) ||
      kmNuevoNum <= actual ||
      kmNuevoNum < 0
    ) {
      return Swal.fire(
        "Error",
        `El nuevo kilometraje debe ser un número válido y mayor a ${fmt(actual)}.`,
        "error"
      );
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/vehiculos/kilometraje`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_vehiculo: vehiculo.ID_Vehiculo,
          kilometraje_nuevo: kmNuevoNum
        })
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire(
          "Éxito",
          `Kilometraje actualizado correctamente.<br>Recorrido: <b>${fmt(data.recorrido)} km</b>`,
          "success"
        ).then(() => navigate("/vehiculos/consultar"));
      } else {
        Swal.fire("Error", data.error || "No se pudo registrar", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error de red", "error");
    }
  };

  if (!vehiculo) {
    return (
      <SidebarLayout>
        <div className="container">Cargando...</div>
      </SidebarLayout>
    );
  }

  const actualKm = Number(vehiculo.Kilometraje || 0);
  const esInvalido =
    nuevoKm !== "" && (!/^\d+$/.test(nuevoKm) || parseInt(nuevoKm, 10) <= actualKm);

  return (
    <SidebarLayout>
      <div className="container">
        <h2 className="mb-4">Registrar Nuevo Kilometraje</h2>

        {/* Bloque llamativo del kilometraje actual */}
        <div className="alert alert-primary d-flex justify-content-between align-items-center" role="alert">
          <div>
            <div className="fw-semibold mb-1">Kilometraje actual</div>
            <div className="display-6 mb-0">
              {fmt(actualKm)} <span className="fs-5 text-muted">km</span>
            </div>
          </div>
          <span className="badge bg-primary-subtle text-primary-emphasis fs-6 p-2 px-3 border border-primary">
            Placa: <b>{vehiculo.Placa}</b>
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <h5 className="mb-3 text-muted">
            Vehículo: {vehiculo.Placa} — {vehiculo.Marca} {vehiculo.Linea} {vehiculo.Modelo}
          </h5>

          <div className="mb-3">
            <label className="form-label">
              Nuevo Kilometraje <span className="text-danger">*</span>
            </label>
            {/* type="text" + inputMode="numeric" para permitir borrar y reescribir libremente */}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={`form-control ${esInvalido ? "is-invalid" : ""}`}
              value={nuevoKm}
              onChange={handleNuevoKmChange}
              placeholder={`Debe ser mayor a ${fmt(actualKm)}`}
              required
            />
            {esInvalido && (
              <div className="invalid-feedback">
                Debe ingresar un número mayor a {fmt(actualKm)}.
              </div>
            )}
            <div className="form-text">Solo números enteros.</div>
          </div>

          <div className="mb-4">
            <label className="form-label">Kilometraje Recorrido</label>
            <input
              type="text"
              className="form-control"
              value={`${fmt(recorrido)} km`}
              readOnly
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={nuevoKm === "" || esInvalido}>
            Guardar
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}
