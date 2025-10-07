import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";

//ESTAS SON LAS IMPORTACIONES PARA LAS RUTAS NECESARIAS
//EMPLEADOS
import AgregarEmpleado from "./pages/empleados/AgregarEmpleado";
import ConsultarEmpleado from "./pages/empleados/ConsultarEmpleado";
import DetalleEmpleado from "./pages/empleados/DetalleEmpleado";
import EditarEmpleado from "./pages/empleados/EditarEmpleado";

//VEHÍCULOS
import AgregarVehiculo from "./pages/vehiculos/AgregarVehiculo";
import AsignarVehiculo from "./pages/vehiculos/AsignarVehiculo";
import DesasignarVehiculo from "./pages/vehiculos/DesasignarVehiculo";
import ConsultarVehiculo from "./pages/vehiculos/ConsultarVehiculo";
import DetalleVehiculo from "./pages/vehiculos/DetalleVehiculo";
import EditarVehiculo from "./pages/vehiculos/EditarVehiculo";
import RegistrarKilometraje from "./pages/vehiculos/RegistrarKilometraje";

//POLIZAS
import AgregarPoliza from "./pages/polizas/AgregarPoliza";
import ConsultarPoliza from "./pages/polizas/ConsultarPoliza";
import DetallePoliza from "./pages/polizas/DetallePoliza";
import EditarPoliza from "./pages/polizas/EditarPoliza";

//RECORRIDOS
import AgregarRecorrido from "./pages/recorridos/AgregarRecorrido";
import DetalleAgregarRecorrido from "./pages/recorridos/DetalleAgregarRecorrido";
import ConsultarRecorrido from "./pages/recorridos/ConsultarRecorrido";
import DetalleRecorrido from "./pages/recorridos/DetalleRecorrido";
import EditarRecorrido from "./pages/recorridos/EditarRecorrido";
import ReporteriaRecorridos from "./pages/recorridos/ReporteriaRecorridos";

//MANTENIMIENTOS
import AgregarMantenimiento from "./pages/mantenimientos/AgregarMantenimiento";
import ConsultarMantenimiento from "./pages/mantenimientos/ConsultarMantenimiento";
import DetalleMantenimiento from "./pages/mantenimientos/DetalleMantenimiento";
import EditarMantenimiento from "./pages/mantenimientos/EditarMantenimiento";



import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/empleados/agregar" element={<AgregarEmpleado />} />
        <Route path="/empleados/consultar" element={<ConsultarEmpleado />} />
        <Route path="/empleados/detalle/:id" element={<DetalleEmpleado />} />
        <Route path="/empleados/modificar/:id" element={<EditarEmpleado />} />

        <Route path="/vehiculos/agregar" element={<AgregarVehiculo />} />
        <Route path="/vehiculos/asignar" element={<AsignarVehiculo />} />
        <Route path="/vehiculos/desasignar" element={<DesasignarVehiculo />} />
        <Route path="/vehiculos/consultar" element={<ConsultarVehiculo />} />
        <Route path="/vehiculos/detalle/:id" element={<DetalleVehiculo />} />
        <Route path="/vehiculos/modificar/:id" element={<EditarVehiculo />} />
        <Route path="/vehiculos/kilometraje/:id" element={<RegistrarKilometraje />} />


        <Route path="/polizas/agregar" element={<AgregarPoliza />} />
        <Route path="/polizas/consultar" element={<ConsultarPoliza />} />
        <Route path="/polizas/detalle/:id" element={<DetallePoliza />} />
        <Route path="/polizas/modificar/:id" element={<EditarPoliza />} />

        <Route path="/recorridos/agregar" element={<AgregarRecorrido />} />
        <Route path="/recorridos/detalle/:idAsignacion" element={<DetalleAgregarRecorrido />} />
        <Route path="/recorridos/consultar" element={<ConsultarRecorrido />} />
        <Route path="/recorridos/detallar/:id" element={<DetalleRecorrido />} />
        <Route path="/recorridos/modificar/:id" element={<EditarRecorrido />} />
        <Route path="/recorridos/reporteria" element={<ReporteriaRecorridos />} />

        <Route path="/mantenimientos/agregar" element={<AgregarMantenimiento />} />
        <Route path="/mantenimientos/consultar" element={<ConsultarMantenimiento />} />
        <Route path="/mantenimientos/detallar/:id" element={<DetalleMantenimiento />} />
        <Route path="/mantenimientos/modificar/:id" element={<EditarMantenimiento />} />

        
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;

