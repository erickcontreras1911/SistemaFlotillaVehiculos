const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/asignacion/disponibles
router.get("/disponibles", async (req, res) => {
  try {
    // Pilotos sin asignación
    const [pilotos] = await db.execute(`
      SELECT e.ID_Empleado, e.Nombres, e.Apellidos
      FROM Empleados e
      WHERE e.ID_Rol = (
        SELECT ID_Rol FROM Roles WHERE Nombre = 'Piloto' LIMIT 1
      )
      AND e.ID_Empleado NOT IN (
        SELECT ID_Empleado FROM Vehiculos_Asignados
      )
    `);

    // Vehículos sin asignación
    const [vehiculos] = await db.execute(`
      SELECT v.ID_Vehiculo, v.Placa, v.Marca, v.Modelo
      FROM Vehiculos v
      WHERE v.ID_Vehiculo NOT IN (
        SELECT ID_Vehiculo FROM Vehiculos_Asignados
      )
    `);

    res.json({ pilotos, vehiculos });
  } catch (error) {
    console.error("Error al obtener disponibles:", error);
    res.status(500).json({ error: "Error al obtener disponibles" });
  }
});

// POST /api/asignacion
router.post("/", async (req, res) => {
    try {
      const { id_empleado, id_vehiculo, observaciones } = req.body;
  
      // Verificar que el empleado y vehículo no tengan asignación activa
      const [[existe]] = await db.execute(`
        SELECT 1
        FROM Vehiculos_Asignados
        WHERE ID_Empleado = ? OR ID_Vehiculo = ?
        LIMIT 1
      `, [id_empleado, id_vehiculo]);
  
      if (existe) {
        return res.status(400).json({ error: "Ya existe una asignación activa para el piloto o vehículo" });
      }
  
      const moment = require("moment-timezone");

        const fechaGuatemala = moment().tz("America/Guatemala").format("YYYY-MM-DD HH:mm:ss");

        await db.execute(
        `INSERT INTO Vehiculos_Asignados (ID_Empleado, ID_Vehiculo, Fecha_Asignacion, Observaciones)
        VALUES (?, ?, ?, ?)`,
        [id_empleado, id_vehiculo, fechaGuatemala, observaciones || null]
        );
  
      res.json({ message: "Vehículo asignado correctamente" });
    } catch (error) {
      console.error("Error al asignar vehículo:", error);
      res.status(500).json({ error: "Error al asignar vehículo" });
    }
  });

//CONSULTA ASIGNACIONES ACTUALES
router.get("/asignados", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        va.ID_Asignacion,
        v.Placa,
        v.Marca,
        v.Linea,
        v.Modelo,
        CONCAT(e.Nombres, ' ', e.Apellidos) AS Piloto,
        va.Fecha_Asignacion
      FROM Vehiculos_Asignados va
      INNER JOIN Vehiculos v ON va.ID_Vehiculo = v.ID_Vehiculo
      INNER JOIN Empleados e ON va.ID_Empleado = e.ID_Empleado
      ORDER BY va.Fecha_Asignacion DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener asignaciones activas:", error);
    res.status(500).json({ error: "Error al obtener asignaciones activas" });
  }
});

// ELIMINA LA ASIGNACIÓN - DESASIGNACIONES
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(`
      DELETE FROM Vehiculos_Asignados WHERE ID_Asignacion = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Asignación no encontrada" });
    }

    res.json({ message: "Asignación eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar asignación:", error);
    res.status(500).json({ error: "Error al eliminar asignación" });
  }
});

  
  module.exports = router;