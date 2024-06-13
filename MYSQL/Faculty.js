const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const facultyRouter = express.Router();
const connection = require("./database");
facultyRouter.use(bodyParser.json());

// Routes >>>
// POST -> login
// GET  -> getfaculty
// POST -> addfaculty
// PUT  -> editfaculty/:f_id
// PUT  -> enabledisablefaculty/:f_id
// GET  -> searchfaculty

// POST endpoint
facultyRouter.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM Faculty WHERE username = ? AND password = ?";
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    if (results.length === 1) {
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

// GET endpoint
facultyRouter.get("/getfaculty", (req, res) => {
  const query = "SELECT * FROM Faculty";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// POST endpoint
facultyRouter.post("/addfaculty", (req, res) => {
  const { f_name, username, password } = req.body;
  const status = "enabled";
  const query =
    "INSERT INTO Faculty (f_name, username, password, status) VALUES (?, ?, ?, ?)";
  const values = [f_name, username, password, status];
  connection.query(query, values, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Faculty added successfully" });
  });
});

// PUT endpoint
facultyRouter.put("/editfaculty/:f_id", (req, res) => {
  const facultyId = req.params.f_id;
  const { f_name, username, password } = req.body;
  const query =
    "UPDATE Faculty SET f_name = ? , username = ? , password = ? WHERE f_id = ?";
  const values = [f_name, username, password, facultyId];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Faculty record not found" });
      return;
    }
    res.status(200).json({ message: "Faculty record updated successfully" });
  });
});

// PUT endpoint
facultyRouter.put("/enabledisablefaculty/:f_id", (req, res) => {
  const facultyId = req.params.f_id;
  let { status } = req.body;
  if (status !== "enabled" && status !== "disabled") {
    return res.status(400).json({
      error:
        'Invalid status value. Status must be either "enabled" or "disabled"'
    });
  }
  if (status === "enabled") {
    status = "disabled";
  } else if (status === "disabled") {
    status = "enabled";
  }
  const query = "UPDATE Faculty SET status = ? WHERE f_id = ?";
  const values = [status, facultyId];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Faculty record not found" });
    }
    res.status(200).json({ message: "Faculty record updated successfully" });
  });
});

// GET endpoint
facultyRouter.get("/searchfaculty", (req, res) => {
  const searchQuery = req.query.search;
  const query = "SELECT * FROM Faculty WHERE f_name LIKE ? OR username LIKE ?";
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

// To Delete Faculty Members
// app.delete("/deletefaculty/:id", (req, res) => {
//   const facultyId = req.params.id;
//   const deleteQuery = "DELETE FROM Faculty WHERE f_id = ?";
//   const updateQuery = "UPDATE Faculty SET f_id = f_id - 1 WHERE f_id > ?";
//   connection.query(deleteQuery, [facultyId], (err, deleteResult) => {
//     if (err) {
//       console.error("Error executing the delete query:", err);
//       connection.rollback(() => {
//         res.status(500).json({ error: "Internal Server Error" });
//       });
//       return;
//     }
//     if (deleteResult.affectedRows === 0) {
//       connection.rollback(() => {
//         res.status(404).json({ error: "Faculty record not found" });
//       });
//       return;
//     }
//     connection.query(updateQuery, [facultyId], (err, updateResult) => {
//       if (err) {
//         console.error("Error executing the update query:", err);
//         connection.rollback(() => {
//           res.status(500).json({ error: "Internal Server Error" });
//         });
//         return;
//       }
//       res.status(200).json({ message: "Faculty record deleted successfully" });
//     });
//   });
// });

module.exports = facultyRouter;
