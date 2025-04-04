const express = require("express");
const router = express.Router();
const db = require("../db");

//AGREGA VEHICULO
router.post("/agregar", async (req, res) => {
  try {
    const {
      placa,
      tipos,
      marca,
      modelo,
      linea,
      chasis,
      color,
      asientos,
      motor,
      combustible,
      transmision,
      impuesto_circulacion_anual,
      impuesto_anio_actual,
      kilometraje,
      impresion_tarjeta_circulacion
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO Vehiculos (
        Placa, Tipos, Marca, Modelo, Linea, Chasis, Color, Asientos,
        Motor, Combustible, Transmision, 
        Impuesto_Circulacion_Anual, Impuesto_Anio_Actual,
        Kilometraje, Impresion_Tarjeta_Circulacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        placa,
        tipos,
        marca,
        modelo,
        linea,
        chasis,
        color,
        asientos,
        motor,
        combustible,
        transmision,
        impuesto_circulacion_anual,
        impuesto_anio_actual,
        kilometraje,
        impresion_tarjeta_circulacion
      ]
    );

    res.status(201).json({ message: "Vehículo registrado correctamente", id: result.insertId });
  } catch (error) {
    console.error("Error al insertar vehículo:", error);
    res.status(500).json({ error: "Error al registrar vehículo" });
  }
});

//CONSULTA VEHICULOS
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        v.ID_Vehiculo,
        v.Placa,
        v.Tipos,
        v.Marca,
        v.Linea,
        v.Modelo,
        v.Estatus,
        CONCAT(e.Nombres, ' ', e.Apellidos) AS Piloto
      FROM Vehiculos v
      LEFT JOIN Vehiculos_Asignados va ON v.ID_Vehiculo = va.ID_Vehiculo
      LEFT JOIN Empleados e ON va.ID_Empleado = e.ID_Empleado
      ORDER BY v.ID_Vehiculo DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    res.status(500).json({ error: "Error al obtener vehículos" });
  }
});

//DETALLE DE VEHÍCULOS
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute(`
      SELECT 
        v.ID_Vehiculo,
        v.Placa,
        v.Tipos,
        v.Marca,
        v.Linea,
        v.Modelo,
        v.Chasis,
        v.Color,
        v.Asientos,
        v.Motor,
        v.Combustible,
        v.Transmision,
        v.Estatus,
        v.Impuesto_Circulacion_Anual,
        v.Impuesto_Anio_Actual,
        v.Kilometraje,
        v.Impresion_Tarjeta_Circulacion,
        CONCAT(e.Nombres, ' ', e.Apellidos) AS Piloto
      FROM Vehiculos v
      LEFT JOIN Vehiculos_Asignados va ON v.ID_Vehiculo = va.ID_Vehiculo
      LEFT JOIN Empleados e ON va.ID_Empleado = e.ID_Empleado
      WHERE v.ID_Vehiculo = ?
      LIMIT 1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener detalle del vehículo:", error);
    res.status(500).json({ error: "Error al obtener detalle del vehículo" });
  }
});

// EDITAR VEHÍCULOS
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    Placa,
    Tipos,
    Marca,
    Modelo,
    Linea,
    Chasis,
    Color,
    Asientos,
    Motor,
    Combustible,
    Transmision,
    Estatus,
    Impuesto_Circulacion_Anual,
    Impuesto_Anio_Actual,
    Kilometraje,
    Impresion_Tarjeta_Circulacion
  } = req.body;

  try {
    const [result] = await db.execute(`
      UPDATE Vehiculos SET
        Placa = ?,
        Tipos = ?,
        Marca = ?,
        Modelo = ?,
        Linea = ?,
        Chasis = ?,
        Color = ?,
        Asientos = ?,
        Motor = ?,
        Combustible = ?,
        Transmision = ?,
        Estatus = ?,
        Impuesto_Circulacion_Anual = ?,
        Impuesto_Anio_Actual = ?,
        Kilometraje = ?,
        Impresion_Tarjeta_Circulacion = ?
      WHERE ID_Vehiculo = ?
    `, [
      Placa,
      Tipos,
      Marca,
      Modelo,
      Linea,
      Chasis,
      Color,
      Asientos,
      Motor,
      Combustible,
      Transmision,
      Estatus,
      Impuesto_Circulacion_Anual,
      Impuesto_Anio_Actual,
      Kilometraje,
      Impresion_Tarjeta_Circulacion,
      id
    ]);

    res.json({ message: "Vehículo actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar vehículo:", error);
    res.status(500).json({ error: "Error al actualizar vehículo" });
  }
});


//ELIMINAR VEHÍCULOS
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Verificar si el vehículo está asignado a un piloto
    const [[asignado]] = await db.execute(`
      SELECT CONCAT(e.Nombres, ' ', e.Apellidos) AS Piloto
      FROM Vehiculos_Asignados va
      INNER JOIN Empleados e ON va.ID_Empleado = e.ID_Empleado
      WHERE va.ID_Vehiculo = ?
      LIMIT 1
    `, [id]);

    if (asignado) {
      return res.status(400).json({
        error: `Este vehículo está asignado a ${asignado.Piloto}. Debe desasignarlo antes de eliminarlo.`
      });
    }

    // 2. Eliminar el vehículo si no está asignado
    const [result] = await db.execute(
      "DELETE FROM Vehiculos WHERE ID_Vehiculo = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json({ message: "Vehículo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    res.status(500).json({ error: "Error al eliminar vehículo" });
  }
});



module.exports = router;
