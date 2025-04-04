//CREDENCIALES BASE DE DATOS
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "crud-empleados.ch22cmyeq634.us-east-2.rds.amazonaws.com",
  user: "adminaws",
  password: "Adm!nAnalisis4",
  database: "flotillas",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise();
