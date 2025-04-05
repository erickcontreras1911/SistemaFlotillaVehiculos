const express = require("express");
const router = express.Router();
const db = require("../db");

//CONSULTA TALLERES ACTIVOS
router.get("/", async (req, res) => {
    try {
      const [talleres] = await db.execute(`
        SELECT ID_Taller, Nombre_Taller 
        FROM Talleres
        WHERE Estado = 'Activo'
      `);
  
      res.json(talleres);
    } catch (error) {
      console.error("Error al obtener talleres:", error);
      res.status(500).json({ error: "Error al obtener talleres" });
    }
  });
  

  
  module.exports = router;
  