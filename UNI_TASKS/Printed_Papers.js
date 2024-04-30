const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
const port = 1001;

// Create MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dps",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  // console.log("Connected to MySQL");
});

app.use(bodyParser.json());

app.get("/getprintedpapers", (req, res) => {
  const query = "SELECT Paper.*, Course.c_title FROM Paper INNER JOIN Course ON Paper.c_id = Course.c_id WHERE Paper.status = ?";
  const status = "printed";
  connection.query(query, [status], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(result);
  });
});

app.get("/searchprintedpapers", (req, res) => {
  const searchQuery = req.query.search;
  const query =     "SELECT Paper.*, Course.c_title FROM Paper INNER JOIN Course ON Paper.c_id = Course.c_id WHERE Course.c_title LIKE ? AND Paper.status = 'printed'";
  const searchValue = `%${searchQuery}%`;
  connection.query(query, [searchValue, searchValue], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(result);
  });
});

app.listen(port, () => {
  console.log(`Listening on Port ${port} Printed_Paper`);
});
