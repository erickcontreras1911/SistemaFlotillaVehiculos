// server/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// ================== Rutas de API (igual que las tenías) ==================
app.use("/api/empleados", require("./routes/empleados"));
app.use("/api/vehiculos", require("./routes/vehiculos"));
app.use("/api/asignacion", require("./routes/asignacion"));
app.use("/api/polizas", require("./routes/polizas"));
app.use("/api/recorridos", require("./routes/recorridos"));
app.use("/api/mantenimientos", require("./routes/mantenimientos"));
app.use("/api/talleres", require("./routes/talleres"));

// Healthcheck simple
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development", time: new Date().toISOString() });
});

// ================== Servir React build (Vite o CRA) ==================
const distPath = path.resolve(__dirname, "..", "client", "dist");   // Vite
const buildPath = path.resolve(__dirname, "..", "client", "build"); // CRA
const staticDir = fs.existsSync(distPath) ? distPath : buildPath;

if (fs.existsSync(staticDir)) {
  // Sirve archivos estáticos del frontend
  app.use(express.static(staticDir));

  // Fallback para rutas del SPA (debe ir al final y después de las rutas /api)
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
} else {
  console.warn("⚠️ No se encontró carpeta de build del frontend (dist o build).");
  console.warn("   Ejecuta `npm run build` dentro de /client para generar el build.");
}

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
