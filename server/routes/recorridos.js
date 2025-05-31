const express = require("express");
const router = express.Router();
const db = require("../db");
const PDFDocument = require("pdfkit");  
const ExcelJS   = require("exceljs"); 

// ——————————————————————————————————————————————————————————————————
// DASHBOARD: resumen con 4 consultas
// ——————————————————————————————————————————————————————————————————
router.get("/dashboard/summary", async (req, res) => {
  try {
    // 1) Top 5 vehículos por número de recorridos
    const [topVehicles] = await db.execute(`
      SELECT CONCAT(v.Placa,' - ',v.Marca,' ',v.Linea) AS label,
             COUNT(*) AS value
      FROM Recorridos r
      JOIN Vehiculos v ON r.ID_Vehiculo = v.ID_Vehiculo
      GROUP BY r.ID_Vehiculo
      ORDER BY value DESC
      LIMIT 5
    `);

    // 2) Top 5 pilotos por número de recorridos
    const [topPilots] = await db.execute(`
      SELECT CONCAT(e.Nombres,' ',e.Apellidos) AS label,
             COUNT(*) AS value
      FROM Recorridos r
      JOIN Empleados e ON r.ID_Piloto = e.ID_Empleado
      GROUP BY r.ID_Piloto
      ORDER BY value DESC
      LIMIT 5
    `);

    // 3) Top 5 rutas origen→destino (los pares más frecuentes)
    const [popularRoutes] = await db.execute(`
      SELECT CONCAT(r.Punto_A,' → ',r.Punto_B) AS label,
             COUNT(*) AS value
      FROM Recorridos r
      GROUP BY r.Punto_A, r.Punto_B
      ORDER BY value DESC
      LIMIT 5
    `);

    // 4) Rendimiento promedio (km/h) por vehículo
    const [performance] = await db.execute(`
      SELECT CONCAT(v.Placa,' - ',v.Marca,' ',v.Linea) AS label,
             ROUND(
               SUM(CAST(r.Distancia AS DECIMAL(10,2))) 
               / NULLIF(SUM(CAST(r.Tiempo_Aproximado AS DECIMAL(10,2))),0)
             ,2) AS value
      FROM Recorridos r
      JOIN Vehiculos v ON r.ID_Vehiculo = v.ID_Vehiculo
      GROUP BY r.ID_Vehiculo
      ORDER BY value DESC
      LIMIT 5
    `);

    res.json({ topVehicles, topPilots, popularRoutes, performance });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al generar datos de dashboard" });
  }
});

// ——————————————————————————————————————————————————————————————————
// EXPORTAR TODO A EXCEL (4 hojas)
// ——————————————————————————————————————————————————————————————————
router.get("/dashboard/reporte-excel", async (req, res) => {
  try {
    // 1) Top Vehículos
    const [[topVehiclesRows], [topPilotsRows], [popularRoutesRows], [performanceRows]] =
      await Promise.all([
        db.execute(`
          SELECT CONCAT(v.Placa,' - ',v.Marca,' ',v.Linea) AS label,
                 COUNT(*) AS value
          FROM Recorridos r
          JOIN Vehiculos v ON r.ID_Vehiculo = v.ID_Vehiculo
          GROUP BY r.ID_Vehiculo
          ORDER BY value DESC
          LIMIT 5
        `),
        db.execute(`
          SELECT CONCAT(e.Nombres,' ',e.Apellidos) AS label,
                 COUNT(*) AS value
          FROM Recorridos r
          JOIN Empleados e ON r.ID_Piloto = e.ID_Empleado
          GROUP BY r.ID_Piloto
          ORDER BY value DESC
          LIMIT 5
        `),
        db.execute(`
          SELECT CONCAT(r.Punto_A,' → ',r.Punto_B) AS label,
                 COUNT(*) AS value
          FROM Recorridos r
          GROUP BY r.Punto_A, r.Punto_B
          ORDER BY value DESC
          LIMIT 5
        `),
        db.execute(`
          SELECT CONCAT(v.Placa,' - ',v.Marca,' ',v.Linea) AS label,
                 ROUND(
                   SUM(CAST(r.Distancia AS DECIMAL(10,2)))
                   / NULLIF(SUM(CAST(r.Tiempo_Aproximado AS DECIMAL(10,2))),0)
                 ,2) AS value
          FROM Recorridos r
          JOIN Vehiculos v ON r.ID_Vehiculo = v.ID_Vehiculo
          GROUP BY r.ID_Vehiculo
          ORDER BY value DESC
          LIMIT 5
        `)
      ]);

    const workbook = new ExcelJS.Workbook();

    // Helper para crear una hoja
    function addSheet(name, rows) {
      const ws = workbook.addWorksheet(name);
      ws.columns = [
        { header: "Etiqueta", key: "label", width: 30 },
        { header: "Valor",    key: "value", width: 15 }
      ];
      rows.forEach(r => ws.addRow(r));
    }

    addSheet("Top Vehículos",      topVehiclesRows);
    addSheet("Top Pilotos",        topPilotsRows);
    addSheet("Rutas Frecuentes",   popularRoutesRows);
    addSheet("Rendimiento (Km x Hr)", performanceRows);

    // Preparo el response para streaming
    res
      .status(200)
      .set({
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="Reporte_Dashboard_Recorridos.xlsx"'
      });

    // Escribo directamente al stream de la response
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("Error al generar Excel:", err);
    res.status(500).json({ error: "Error al generar Excel" });
  }
});


// 📄 Exportar todos los recorridos a Excel
router.get("/all-excel", async (req, res) => {
  try {
    // 1) Obtener TODOS los recorridos con sus datos completos
    const [rows] = await db.execute(`
      SELECT 
        r.ID_Recorrido,
        CONCAT(e.Nombres,' ',e.Apellidos) AS Piloto,
        CONCAT(v.Placa,' - ',v.Marca,' ',v.Linea,' ',v.Modelo) AS Vehiculo,
        r.Punto_A,
        r.Punto_B,
        r.Distancia,
        r.Tiempo_Aproximado
      FROM Recorridos r
      JOIN Empleados e ON r.ID_Piloto = e.ID_Empleado
      JOIN Vehiculos v ON r.ID_Vehiculo = v.ID_Vehiculo
      ORDER BY r.ID_Recorrido
    `);

    // 2) Generar Excel
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Todos los Recorridos");
    ws.columns = [
      { header: "ID",            key: "ID_Recorrido",      width: 8 },
      { header: "Piloto",        key: "Piloto",            width: 25 },
      { header: "Vehículo",      key: "Vehiculo",          width: 25 },
      { header: "Origen",        key: "Punto_A",           width: 30 },
      { header: "Destino",       key: "Punto_B",           width: 30 },
      { header: "Distancia (km)",key: "Distancia",         width: 12 },
      { header: "Tiempo (hrs)",  key: "Tiempo_Aproximado",  width: 12 },
    ];
    rows.forEach(r => ws.addRow(r));

    const buffer = await wb.xlsx.writeBuffer();
    res
      .status(200)
      .set({
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="Todos_Recorridos.xlsx"'
      })
      .send(buffer);

  } catch (err) {
    console.error("Error al generar Excel completo:", err);
    res.status(500).json({ error: "No se pudo generar el Excel completo" });
  }
});

// 📄 Exportar todos los recorridos a PDF
router.get("/all-pdf", async (req, res) => {
  try {
    // 1) Traer mismos datos que en Excel
    const [rows] = await db.execute(`
      SELECT 
        r.ID_Recorrido,
        CONCAT(e.Nombres,' ',e.Apellidos) AS Piloto,
        CONCAT(v.Placa,' - ',v.Marca,' ',v.Linea,' ',v.Modelo) AS Vehiculo,
        r.Punto_A,
        r.Punto_B,
        r.Distancia,
        r.Tiempo_Aproximado
      FROM Recorridos r
      JOIN Empleados e ON r.ID_Piloto = e.ID_Empleado
      JOIN Vehiculos v ON r.ID_Vehiculo = v.ID_Vehiculo
      ORDER BY r.ID_Recorrido
    `);

    // 2) Crear documento PDF en memoria
    const doc = new PDFDocument({ size: "LEGAL", layout: "landscape", margin: 40 });
    // Le decimos al response que viene PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Todos_Recorridos.pdf"'
    );
    // Pipe del PDF al response
    doc.pipe(res);

    // 3) Cabecera
    doc.fontSize(18).text("Listado de Todos los Recorridos", { align: "center" });
    doc.moveDown();

    // 4) Tabla básica
    const tableTop = 100;
    const rowHeight = 20;
    const colX = [40, 80, 200, 330, 460, 580, 650];
    // encabezados
    ["ID","Piloto","Vehículo","Origen","Destino","Distancia","Tiempo"]
      .forEach((h, i) => doc.fontSize(10).text(h, colX[i], tableTop));
    // filas
    rows.forEach((r, idx) => {
      const y = tableTop + rowHeight * (idx + 1);
      doc
        .fontSize(8)
        .text(r.ID_Recorrido,      colX[0], y)
        .text(r.Piloto,            colX[1], y)
        .text(r.Vehiculo,          colX[2], y, { width: 120 })
        .text(r.Punto_A,           colX[3], y, { width: 120 })
        .text(r.Punto_B,           colX[4], y, { width: 120 })
        .text(r.Distancia,         colX[5], y)
        .text(r.Tiempo_Aproximado, colX[6], y);
    });

    // 5) Finalizar PDF
    doc.end();

  } catch (err) {
    console.error("Error al generar PDF completo:", err);
    res.status(500).json({ error: "No se pudo generar el PDF completo" });
  }
});


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

