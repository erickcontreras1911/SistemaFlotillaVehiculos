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

//VEHÍCULOS ACTIVOS PARA MANTENIMIENTO
router.get("/activos", async (req, res) => {
  try {
    const [vehiculos] = await db.execute(`
      SELECT ID_Vehiculo, Placa, Marca, Linea, Modelo 
      FROM Vehiculos 
      WHERE Estatus = 'Activo'
    `);

    res.json(vehiculos);
  } catch (error) {
    console.error("Error al obtener vehículos activos:", error);
    res.status(500).json({ error: "Error al obtener vehículos activos" });
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
        CONCAT(e.Nombres, ' ', e.Apellidos) AS Piloto,
        (
          SELECT Kilometraje_Proximo_Servicio
          FROM Mantenimientos
          WHERE ID_Vehiculo = v.ID_Vehiculo AND Tipo_Mantenimiento = 'Servicio de Motor'
          ORDER BY Fecha DESC, ID_Mantenimiento DESC
          LIMIT 1
        ) AS Kilometraje_Proximo_Servicio
      FROM Vehiculos v
      LEFT JOIN Vehiculos_Asignados va ON v.ID_Vehiculo = va.ID_Vehiculo
      LEFT JOIN Empleados e ON va.ID_Empleado = e.ID_Empleado
      WHERE v.ID_Vehiculo = ?
      LIMIT 1;
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
  try {
    // 1) Validar/normalizar ID
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID inválido" });
    }

    // 2) Helpers para normalizar valores
    const NN = (v) => (v === undefined ? null : v);                     // string/fecha
    const NN_INT = (v) => (v === undefined || v === "" ? null : parseInt(v, 10));
    const NN_NUM = (v) => (v === undefined || v === "" ? null : Number(v));

    // 3) Tomar campos del body aceptando minúsculas/mayúsculas
    //    (el frontend que hicimos envía en minúscula con guiones bajos)
    let placa  = req.body.Placa  ?? req.body.placa;
    let tipos  = req.body.Tipos  ?? req.body.tipos;
    let marca  = req.body.Marca  ?? req.body.marca;
    let modelo = req.body.Modelo ?? req.body.modelo;
    let linea  = req.body.Linea  ?? req.body.linea;
    let chasis = req.body.Chasis ?? req.body.chasis;
    let color  = req.body.Color  ?? req.body.color;

    let asientos = req.body.Asientos ?? req.body.asientos;
    let motor    = req.body.Motor    ?? req.body.motor;

    let combustible = req.body.Combustible ?? req.body.combustible;
    let transmision = req.body.Transmision ?? req.body.transmision;

    // Estatus puede no venir desde la vista; si tu columna es NOT NULL, dejamos "Activo" por defecto
    let estatus = req.body.Estatus ?? req.body.estatus ?? "Activo";

    let impuesto_circulacion_anual = req.body.Impuesto_Circulacion_Anual ?? req.body.impuesto_circulacion_anual;
    let impuesto_anio_actual       = req.body.Impuesto_Anio_Actual       ?? req.body.impuesto_anio_actual;

    let kilometraje = req.body.Kilometraje ?? req.body.kilometraje;
    let impresion_tarjeta_circulacion =
      req.body.Impresion_Tarjeta_Circulacion ?? req.body.impresion_tarjeta_circulacion;

    // 4) Normalizaciones finales (evitar undefined, castear tipos, sanear strings)
    placa  = NN((placa || "").toString().toUpperCase().trim());
    tipos  = NN((tipos || "").toString().trim());
    marca  = NN((marca || "").toString().trim());
    modelo = NN_INT(modelo);
    linea  = NN((linea || "").toString().trim());
    chasis = NN((chasis || "").toString().toUpperCase().slice(0, 20));
    color  = NN((color || "").toString().trim());

    asientos = NN_INT(asientos);
    motor    = NN_INT(motor);

    combustible = NN((combustible || "").toString().trim());
    transmision = NN((transmision || "").toString().trim());
    estatus     = NN((estatus || "").toString().trim() || "Activo");

    impuesto_circulacion_anual = NN_NUM(impuesto_circulacion_anual);
    // "Pagado"/"Pendiente" o null
    impuesto_anio_actual = NN((impuesto_anio_actual || "").toString().trim() || null);

    kilometraje = NN_INT(kilometraje);

    // Acepta "YYYY-MM-DD" o null
    impresion_tarjeta_circulacion = NN(
      (impresion_tarjeta_circulacion || "").toString().trim() || null
    );

    // 5) Ejecutar UPDATE (sin undefined en los parámetros)
    const [result] = await db.execute(
      `UPDATE Vehiculos SET
         Placa = ?, Tipos = ?, Marca = ?, Modelo = ?, Linea = ?, Chasis = ?, Color = ?,
         Asientos = ?, Motor = ?, Combustible = ?, Transmision = ?, Estatus = ?,
         Impuesto_Circulacion_Anual = ?, Impuesto_Anio_Actual = ?,
         Kilometraje = ?, Impresion_Tarjeta_Circulacion = ?
       WHERE ID_Vehiculo = ?`,
      [
        placa, tipos, marca, modelo, linea, chasis, color,
        asientos, motor, combustible, transmision, estatus,
        impuesto_circulacion_anual, impuesto_anio_actual,
        kilometraje, impresion_tarjeta_circulacion,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    return res.json({ message: "Vehículo actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar vehículo:", error);
    return res.status(500).json({ error: "Error al actualizar vehículo" });
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

//KILOMETRAJES
router.post("/kilometraje", async (req, res) => {
  const { id_vehiculo, kilometraje_nuevo } = req.body;

  try {
    // Obtener el kilometraje actual
    const [[vehiculo]] = await db.execute(
      "SELECT Kilometraje FROM Vehiculos WHERE ID_Vehiculo = ?",
      [id_vehiculo]
    );

    if (!vehiculo) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    const kilometraje_anterior = vehiculo.Kilometraje;
    const recorrido = kilometraje_nuevo - kilometraje_anterior;
    const fecha_actual = new Date();

    // Registrar historial
    await db.execute(
      `INSERT INTO Historial_Kilometraje 
      (ID_Vehiculo, Kilometraje_Anterior, Kilometraje_Nuevo, Kilometraje_Recorrido, Fecha_Registro)
      VALUES (?, ?, ?, ?, ?)`,
      [id_vehiculo, kilometraje_anterior, kilometraje_nuevo, recorrido, fecha_actual]
    );

    // Actualizar vehículo
    await db.execute(
      "UPDATE Vehiculos SET Kilometraje = ? WHERE ID_Vehiculo = ?",
      [kilometraje_nuevo, id_vehiculo]
    );

    res.status(201).json({ message: "Kilometraje actualizado correctamente", recorrido, fecha_actual });
  } catch (error) {
    console.error("Error al actualizar kilometraje:", error);
    res.status(500).json({ error: "Error al actualizar kilometraje" });
  }
});



module.exports = router;
