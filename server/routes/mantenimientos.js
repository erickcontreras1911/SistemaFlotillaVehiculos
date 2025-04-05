const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/mantenimientos
router.post("/", async (req, res) => {
  const {
    id_vehiculo,
    tipo_mantenimiento,
    fecha,
    kilometraje,
    titulo_mantenimiento,
    descripcion,
    id_taller,
    costo
  } = req.body;

  try {
    const [result] = await db.execute(`
      INSERT INTO Mantenimientos (
        ID_Vehiculo,
        Tipo_Mantenimiento,
        Fecha,
        Kilometraje,
        Titulo_Mantenimiento,
        Descripcion,
        ID_Taller,
        Costo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id_vehiculo,
      tipo_mantenimiento,
      fecha,
      kilometraje,
      titulo_mantenimiento,
      descripcion,
      id_taller,
      costo
    ]);

    res.status(201).json({ message: "Mantenimiento registrado exitosamente", id: result.insertId });
  } catch (error) {
    console.error("Error al registrar mantenimiento:", error);
    res.status(500).json({ error: "Error al registrar mantenimiento" });
  }
});

// CONSULTAR MANTENIMIENTOS CON DETALLE DE VEHÍCULO Y TALLER
router.get("/", async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          m.ID_Mantenimiento,
          CONCAT(v.Placa, ' - ', v.Marca, ' ', v.Linea, ' ', v.Modelo) AS Vehiculo,
          m.Tipo_Mantenimiento,
          m.Titulo_Mantenimiento,
          t.Nombre_Taller,
          m.Fecha
        FROM Mantenimientos m
        INNER JOIN Vehiculos v ON m.ID_Vehiculo = v.ID_Vehiculo
        LEFT JOIN Talleres t ON m.ID_Taller = t.ID_Taller
        ORDER BY m.Fecha DESC
      `);
  
      res.json(rows);
    } catch (error) {
      console.error("Error al obtener mantenimientos:", error);
      res.status(500).json({ error: "Error al obtener mantenimientos" });
    }
  });

  //DETALLE MANTENIMIENTO
router.get("/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const [rows] = await db.execute(`
        SELECT 
          m.ID_Mantenimiento,
          CONCAT(v.Placa, ' - ', v.Marca, ' ', v.Linea, ' ', v.Modelo) AS Vehiculo,
          m.Tipo_Mantenimiento,
          m.Fecha,
          m.Kilometraje,
          m.Costo,
          m.Titulo_Mantenimiento,
          m.Descripcion,
          t.Nombre_Taller
        FROM Mantenimientos m
        INNER JOIN Vehiculos v ON m.ID_Vehiculo = v.ID_Vehiculo
        LEFT JOIN Talleres t ON m.ID_Taller = t.ID_Taller
        WHERE m.ID_Mantenimiento = ?
        LIMIT 1
      `, [id]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: "Mantenimiento no encontrado" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.error("Error al obtener detalle del mantenimiento:", error);
      res.status(500).json({ error: "Error al obtener el mantenimiento" });
    }
  });
  
// ACTUALIZAR MANTENIMIENTO
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
      id_vehiculo,
      tipo_mantenimiento,
      fecha,
      kilometraje,
      titulo_mantenimiento,
      descripcion,
      id_taller,
      costo
    } = req.body;
  
    try {
      const [result] = await db.execute(
        `UPDATE Mantenimientos SET 
          ID_Vehiculo = ?,
          Tipo_Mantenimiento = ?,
          Fecha = ?,
          Kilometraje = ?,
          Titulo_Mantenimiento = ?,
          Descripcion = ?,
          ID_Taller = ?,
          Costo = ?
        WHERE ID_Mantenimiento = ?`,
        [
          id_vehiculo ?? null,
          tipo_mantenimiento ?? null,
          fecha ?? null,
          kilometraje ?? null,
          titulo_mantenimiento ?? null,
          descripcion ?? null,
          id_taller ?? null,
          costo ?? null,
          id
        ]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Mantenimiento no encontrado" });
      }
  
      res.json({ message: "Mantenimiento actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar mantenimiento:", error);
      res.status(500).json({ error: "Error al actualizar el mantenimiento" });
    }
  });
  
  // ELIMINAR MANTENIMIENTO
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const [result] = await db.execute(
        "DELETE FROM Mantenimientos WHERE ID_Mantenimiento = ?",
        [id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Mantenimiento no encontrado" });
      }
  
      res.json({ message: "Mantenimiento eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar mantenimiento:", error);
      res.status(500).json({ error: "Error al eliminar el mantenimiento" });
    }
  });
  

module.exports = router;
