const express = require("express");
const router = express.Router();
const db = require("../db");

// INSERTAR UN NUEVO EMPLEADO
router.post("/agregar", async (req, res) => {
  try {
    let {
      nombres,
      apellidos,
      dpi,
      telefono,
      direccion,
      email,
      fecha_nacimiento,
      fecha_contratacion,
      salario,
      id_rol,
    } = req.body;

    // Normalizaciones mínimas seguras:
    telefono = telefono ?? "";                // evita NULL si columna es NOT NULL
    direccion = direccion ?? "";
    email = email ?? "";
    salario = salario === "" || salario == null ? 0 : parseFloat(salario); // o un default válido
    id_rol = parseInt(id_rol, 10);            // asegura número

    const [result] = await db.execute(
      `INSERT INTO Empleados 
      (Nombres, Apellidos, DPI, Telefono, Direccion, Email, Fecha_Nacimiento, Fecha_Contratacion, Salario, ID_Rol) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombres,
        apellidos,
        dpi,
        telefono,
        direccion,
        email,
        fecha_nacimiento,       // "YYYY-MM-DD" funciona para DATE
        fecha_contratacion,     // idem
        salario,
        id_rol,
      ]
    );

    res.status(201).json({ message: "Empleado agregado correctamente", id: result.insertId });
  } catch (error) {
    console.error("Error al agregar empleado:", error);
    // Ayuda a detectar FK rota del rol
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "ID_Rol inválido (no existe en la tabla de roles)" });
    }
    res.status(500).json({ error: "Error al agregar el empleado" });
  }
});


//CONSULTA DE EMPLEADO
router.get("/", async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT 
          e.ID_Empleado,
          e.Nombres,
          e.Apellidos,
          e.DPI,
          e.Telefono,
          e.Direccion,
          e.Email,
          e.Fecha_Nacimiento,
          e.Fecha_Contratacion,
          e.Salario,
          e.Estatus,
          r.Nombre AS Rol
        FROM Empleados e
        LEFT JOIN Roles r ON e.ID_Rol = r.ID_Rol
        ORDER BY e.ID_Empleado DESC
      `);
      res.json(rows);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      res.status(500).json({ error: "Error al obtener empleados" });
    }
  });
  
  //CONSULTA EMPLEADO INDIVIDUAL - VER MAS DETALLES
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const [rows] = await db.execute(
        `SELECT 
          e.ID_Empleado,
          e.Nombres,
          e.Apellidos,
          e.DPI,
          e.Telefono,
          e.Direccion,
          e.Email,
          e.Fecha_Nacimiento,
          e.Fecha_Contratacion,
          e.Salario,
          e.Estatus,
          r.Nombre AS Rol
        FROM Empleados e
        LEFT JOIN Roles r ON e.ID_Rol = r.ID_Rol
        WHERE e.ID_Empleado = ?
        LIMIT 1`,
        [id]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
  
      res.json(rows[0]);
    } catch (error) {
      console.error("Error al obtener detalle del empleado:", error);
      res.status(500).json({ error: "Error al obtener detalle del empleado" });
    }
  });
  

//ACTUALIZAR EMPLEADO
router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nombres,
        apellidos,
        dpi,
        telefono,
        direccion,
        email,
        fecha_nacimiento,
        fecha_contratacion,
        salario,
        id_rol,
        estatus,
      } = req.body;
  
      const [result] = await db.execute(
        `UPDATE Empleados SET 
          Nombres = ?, 
          Apellidos = ?, 
          DPI = ?, 
          Telefono = ?, 
          Direccion = ?, 
          Email = ?, 
          Fecha_Nacimiento = ?, 
          Fecha_Contratacion = ?, 
          Salario = ?, 
          ID_Rol = ?, 
          Estatus = ?
        WHERE ID_Empleado = ?`,
        [
          nombres,
          apellidos,
          dpi,
          telefono || null,
          direccion || null,
          email || null,
          fecha_nacimiento || null,
          fecha_contratacion || null,
          salario || null,
          id_rol,
          estatus,
          id,
        ]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
  
      res.json({ message: "Empleado actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      res.status(500).json({ error: "Error al actualizar empleado" });
    }
  });

//ELIMINAR EMPLEADO
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const [result] = await db.execute(
        "DELETE FROM Empleados WHERE ID_Empleado = ?",
        [id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
  
      res.json({ message: "Empleado eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      res.status(500).json({ error: "Error al eliminar empleado" });
    }
  });

  module.exports = router;
  