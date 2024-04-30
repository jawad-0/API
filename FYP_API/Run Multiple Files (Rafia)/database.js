const sql = require("mssql");

const config = {
  user: "sa",
  password: "rafia123",
  server: "127.0.0.1",
  database: "DPS",
  options: {
    encrypt: false,
  },
};

const pool = new sql.ConnectionPool(config);

module.exports = { sql, pool };