const express = require("express");
const router = express.Router();
const db = require("../db");

//VEHÍCULOS DISPONIBLES PARA ASIGNAR POLIZA
router.get("/vehiculos-disponibles", async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT v.ID_Vehiculo, v.Placa, v.Tipos, v.Marca, v.Linea, v.Modelo, v.Estatus
        FROM Vehiculos v
        WHERE v.ID_Vehiculo NOT IN (
          SELECT ID_Vehiculo FROM Polizas
        )
        AND v.Estatus = 'Activo'
      `);
  
      res.json(rows);
    } catch (error) {
      console.error("Error al obtener vehículos disponibles:", error);
      res.status(500).json({ error: "Error al obtener vehículos disponibles" });
    }
  });

  
//AGREGAR POLIZA
router.post("/", async (req, res) => {
    const {
      id_vehiculo,
      numero_poliza,
      aseguradora,
      monto,
      fecha_emision,
      fecha_vencimiento
    } = req.body;
  
    try {
      const [existe] = await db.execute(
        `SELECT 1 FROM Polizas WHERE ID_Vehiculo = ? LIMIT 1`,
        [id_vehiculo]
      );
  
      if (existe.length > 0) {
        return res.status(400).json({ error: "Este vehículo ya tiene una póliza asignada." });
      }
  
      await db.execute(
        `INSERT INTO Polizas (
          ID_Vehiculo,
          Numero_Poliza,
          Aseguradora,
          Monto,
          Fecha_Emision,
          Fecha_Vencimiento
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id_vehiculo,
          numero_poliza,
          aseguradora || null,
          monto || null,
          fecha_emision || null,
          fecha_vencimiento || null
        ]
      );
  
      res.status(201).json({ message: "Póliza registrada correctamente" });
    } catch (error) {
      console.error("Error al registrar póliza:", error);
      res.status(500).json({ error: "Error al registrar póliza" });
    }
  });

//CONSULTAR POLIZAS
router.get("/", async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          p.ID_Poliza,
          p.Numero_Poliza,
          p.Aseguradora,
          p.Fecha_Vencimiento,
          v.Placa,
          v.Marca,
          v.Linea,
          v.Modelo
        FROM Polizas p
        INNER JOIN Vehiculos v ON p.ID_Vehiculo = v.ID_Vehiculo
        ORDER BY p.Fecha_Vencimiento ASC
      `);
  
      res.json(rows);
    } catch (error) {
      console.error("Error al obtener pólizas:", error);
      res.status(500).json({ error: "Error al obtener pólizas" });
    }
  });

  //DETALLE POLIZAS
router.get("/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const [rows] = await db.execute(`
        SELECT 
          p.ID_Poliza,
          p.Numero_Poliza,
          p.Aseguradora,
          p.Monto,
          p.Fecha_Emision,
          p.Fecha_Vencimiento,
          v.Placa,
          v.Marca,
          v.Linea,
          v.Modelo
        FROM Polizas p
        INNER JOIN Vehiculos v ON p.ID_Vehiculo = v.ID_Vehiculo
        WHERE p.ID_Poliza = ?
        LIMIT 1
      `, [id]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: "Póliza no encontrada" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.error("Error al obtener detalle de póliza:", error);
      res.status(500).json({ error: "Error al obtener detalle de póliza" });
    }
  });
  
  //EDITAR POLIZAS
  // PUT /api/polizas/:id
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
      numero_poliza,
      aseguradora,
      monto,
      fecha_emision,
      fecha_vencimiento
    } = req.body;
  
    try {
      const [result] = await db.execute(
        `UPDATE Polizas SET
          Numero_Poliza = ?,
          Aseguradora = ?,
          Monto = ?,
          Fecha_Emision = ?,
          Fecha_Vencimiento = ?
        WHERE ID_Poliza = ?`,
        [
          numero_poliza,
          aseguradora || null,
          monto || null,
          fecha_emision || null,
          fecha_vencimiento || null,
          id
        ]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Póliza no encontrada" });
      }
  
      res.json({ message: "Póliza actualizada correctamente" });
    } catch (error) {
      console.error("Error al actualizar póliza:", error);
      res.status(500).json({ error: "Error al actualizar la póliza" });
    }
  });

  //ELIMINAR POLIZAS
  // DELETE /api/polizas/:id
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      // Obtener la póliza antes de eliminar
      const [rows] = await db.execute(
        `SELECT Fecha_Vencimiento FROM Polizas WHERE ID_Poliza = ? LIMIT 1`,
        [id]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ error: "Póliza no encontrada" });
      }
  
      // Eliminar la póliza
      const [result] = await db.execute(
        `DELETE FROM Polizas WHERE ID_Poliza = ?`,
        [id]
      );
  
      res.json({ message: "Póliza eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar póliza:", error);
      res.status(500).json({ error: "Error al eliminar póliza" });
    }
  });
  
  const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

// GENERAR REPORTE DE PÓLIZAS EN CSV
router.get('/reporte', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        p.ID_Poliza,
        p.Numero_Poliza,
        p.Aseguradora,
        p.Monto,
        p.Fecha_Emision,
        p.Fecha_Vencimiento,
        v.Placa,
        v.Marca,
        v.Linea,
        v.Modelo
      FROM Polizas p
      INNER JOIN Vehiculos v ON p.ID_Vehiculo = v.ID_Vehiculo
      ORDER BY p.Fecha_Vencimiento ASC
    `);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No hay pólizas para el reporte" });
    }

    // Convertir resultados a CSV
    const fields = [
      'ID_Poliza', 'Numero_Poliza', 'Aseguradora', 'Monto',
      'Fecha_Emision', 'Fecha_Vencimiento', 'Placa', 'Marca', 'Linea', 'Modelo'
    ];
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(rows);

    // Nombre del archivo temporal
    const fileName = `reporte_polizas_${Date.now()}.csv`;
    const filePath = path.join(__dirname, '..', 'temp', fileName);

    // Crear carpeta temporal si no existe
    fs.mkdirSync(path.join(__dirname, '..', 'temp'), { recursive: true });

    // Guardar archivo temporal
    fs.writeFileSync(filePath, csv);

    // Enviar el archivo como descarga
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error al descargar el archivo:", err);
        res.status(500).json({ error: "Error al generar el reporte" });
      }
      // Eliminar el archivo después de enviar
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error("Error al generar reporte:", error);
    res.status(500).json({ error: "Error al generar reporte" });
  }
});
  

  module.exports = router;
  