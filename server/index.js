// server/index.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// RUTA PARA EMPLEADOS
const empleadosRoutes = require("./routes/empleados");
app.use("/api/empleados", empleadosRoutes);

//RUTA PARA VEHÍCULOS
const vehiculosRoutes = require("./routes/vehiculos");
app.use("/api/vehiculos", vehiculosRoutes);

//RUTA PARA ASIGNACIÓN DE VEHÍCULOS
const asignacionRoutes = require("./routes/asignacion");
app.use("/api/asignacion", asignacionRoutes);

//RUTA PARA POLIZAS
const polizasRoutes = require("./routes/polizas");
app.use("/api/polizas", polizasRoutes);

//RUTA PARA RECORRIDOS
const recorridosRoutes = require("./routes/recorridos");
app.use("/api/recorridos", recorridosRoutes);

//RUTA PARA MANTENIMIENTOS
const mantenimientosRoutes = require("./routes/mantenimientos");
app.use("/api/mantenimientos", mantenimientosRoutes);

//RUTA PARA TALLERES
const talleresRoutes = require("./routes/talleres");
app.use("/api/talleres", talleresRoutes);


app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
