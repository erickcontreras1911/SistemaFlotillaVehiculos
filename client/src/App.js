import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

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

//POLIZAS
import AgregarPoliza from "./pages/polizas/AgregarPoliza";
import ConsultarPoliza from "./pages/polizas/ConsultarPoliza";
import DetallePoliza from "./pages/polizas/DetallePoliza";
import EditarPoliza from "./pages/polizas/EditarPoliza";



import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
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

        <Route path="/polizas/agregar" element={<AgregarPoliza />} />
        <Route path="/polizas/consultar" element={<ConsultarPoliza />} />
        <Route path="/polizas/detalle/:id" element={<DetallePoliza />} />
        <Route path="/polizas/modificar/:id" element={<EditarPoliza />} />


      </Routes>
    </Router>
  );
}

export default App;

