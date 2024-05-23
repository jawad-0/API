const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const gridviewRouter = express.Router();
const connection = require("./database");
gridviewRouter.use(bodyParser.json());

// To Add New Course
gridviewRouter.post("/addGridViewWeightage", (req, res) => {
  const { clo_id, header_id, weightage } = req.body;
  const query =
    "INSERT INTO Grid_View_Weightage (clo_id, header_id, weightage) VALUES (?, ?, ?)";
  const values = [clo_id, header_id, weightage];
  connection.query(query, values, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Course added successfully" });
  });
});

gridviewRouter.get("/getGridViewHeaders", (req, res) => {
  const getQuery = "SELECT * FROM Grid_View_Headers";

  connection.query(getQuery, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

module.exports = gridviewRouter;
