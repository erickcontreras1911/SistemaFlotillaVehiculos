const express = require("express");
const router = express.Router();
const db = require("../db");

// AGREGAR RECORRIDOS
router.post("/", async (req, res) => {
  const {
    id_vehiculo,
    id_piloto,
    punto_a,
    punto_b,
    distancia,
    tiempo_aproximado
  } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO Recorridos 
        (ID_Vehiculo, ID_Piloto, Punto_A, Punto_B, Distancia, Tiempo_Aproximado)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id_vehiculo,
        id_piloto,
        punto_a,
        punto_b,
        distancia,
        tiempo_aproximado
      ]
    );

    res.status(201).json({ message: "Recorrido guardado correctamente", id: result.insertId });
  } catch (error) {
    console.error("Error al guardar recorrido:", error);
    res.status(500).json({ error: "Error al guardar recorrido" });
  }
});

//CONSULTAR RECORRIDOS
// Obtener todos los recorridos con piloto y vehículo
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        r.ID_Recorrido,
        CONCAT(e.Nombres, ' ', e.Apellidos) AS Piloto,
        CONCAT(v.Placa, ' - ', v.Marca, ' ', v.Linea, ' ', v.Modelo) AS Vehiculo,
        r.Punto_A,
        r.Punto_B
      FROM Recorridos r
      INNER JOIN Empleados e ON r.ID_Piloto = e.ID_Empleado
      INNER JOIN Vehiculos v ON r.ID_Vehiculo = v.ID_Vehiculo
      ORDER BY r.ID_Recorrido DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener recorridos:", error);
    res.status(500).json({ error: "Error al obtener recorridos" });
  }
});


//DETALLE RECORRIDOS
router.get("/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const [rows] = await db.execute(`
        SELECT 
          r.ID_Recorrido,
          r.Punto_A,
          r.Punto_B,
          r.Distancia,
          r.Tiempo_Aproximado,
          CONCAT(e.Nombres, ' ', e.Apellidos) AS Piloto,
          CONCAT(v.Placa, ' - ', v.Marca, ' ', v.Linea, ' ', v.Modelo) AS Vehiculo
        FROM Recorridos r
        INNER JOIN Empleados e ON r.ID_Piloto = e.ID_Empleado
        INNER JOIN Vehiculos v ON r.ID_Vehiculo = v.ID_Vehiculo
        WHERE r.ID_Recorrido = ?
        LIMIT 1
      `, [id]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: "Recorrido no encontrado" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.error("Error al obtener detalle del recorrido:", error);
      res.status(500).json({ error: "Error al obtener el detalle del recorrido" });
    }
  });
  
  
  // EDITAR RECORRIDO
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
      punto_a,
      punto_b,
      distancia,
      tiempo_aproximado
    } = req.body;
  
    try {
      const [result] = await db.execute(
        `UPDATE Recorridos
         SET Punto_A = ?, Punto_B = ?, Distancia = ?, Tiempo_Aproximado = ?
         WHERE ID_Recorrido = ?`,
        [punto_a, punto_b, distancia, tiempo_aproximado, id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Recorrido no encontrado" });
      }
  
      res.json({ message: "Recorrido actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar recorrido:", error);
      res.status(500).json({ error: "Error al actualizar recorrido" });
    }
  });

  // ELIMINAR RECORRIDO
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const [result] = await db.execute(
        `DELETE FROM Recorridos WHERE ID_Recorrido = ?`,
        [id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Recorrido no encontrado" });
      }
  
      res.json({ message: "Recorrido eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar recorrido:", error);
      res.status(500).json({ error: "Error al eliminar recorrido" });
    }
  });
  
  

module.exports = router;

