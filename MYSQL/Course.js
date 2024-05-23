const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const courseRouter = express.Router();
const connection = require("./database");
courseRouter.use(bodyParser.json());

// To Add New Course
courseRouter.post("/addcourse", (req, res) => {
  const { c_code, c_title, cr_hours } = req.body;
  const status = "enabled";
  const query =
    "INSERT INTO Course (c_code, c_title, cr_hours, status) VALUES (?, ?, ?, ?)";
  const values = [c_code, c_title, cr_hours, status];
  connection.query(query, values, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Course added successfully" });
  });
});

courseRouter.get("/getcourse", (req, res) => {
  const query = "SELECT * FROM Course";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

courseRouter.put("/editcourse/:id", (req, res) => {
  const courseId = req.params.id;
  const { c_code, c_title, cr_hours } = req.body;
  const query =
    "UPDATE Course SET c_code = ? , c_title = ? , cr_hours = ? WHERE c_id = ?";
  const values = [c_code, c_title, cr_hours, courseId];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Course record not found" });
      return;
    }
    res.status(200).json({ message: "Course record updated successfully" });
  });
});

courseRouter.put("/enabledisablecourse/:id", (req, res) => {
  const courseId = req.params.id;
  let { status } = req.body;
  if (status !== "enabled" && status !== "disabled") {
    return res.status(400).json({
      error:
        'Invalid status value. Status must be either "enable" or "disable"',
    });
  }
  if (status === "enabled") {
    status = "disabled";
  } else if (status === "disabled") {
    status = "enabled";
  }
  const query = "UPDATE Course SET status = ? WHERE c_id = ?";
  const values = [status, courseId];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Course record not found" });
    }
    res.status(200).json({ message: "Course record updated successfully" });
  });
});

courseRouter.delete("/deletecourse/:id", (req, res) => {
  const courseId = req.params.id;
  const deleteQuery = "DELETE FROM Course WHERE c_id = ?";
  const updateQuery = "UPDATE Course SET c_id = c_id - 1 WHERE c_id > ?";
  connection.query(deleteQuery, [courseId], (err, deleteResult) => {
    if (err) {
      console.error("Error executing the delete query:", err);
      connection.rollback(() => {
        res.status(500).json({ error: "Internal Server Error" });
      });
      return;
    }
    if (deleteResult.affectedRows === 0) {
      connection.rollback(() => {
        res.status(404).json({ error: "Course record not found" });
      });
      return;
    }
    connection.query(updateQuery, [courseId], (err, updateResult) => {
      if (err) {
        console.error("Error executing the update query:", err);
        connection.rollback(() => {
          res.status(500).json({ error: "Internal Server Error" });
        });
        return;
      }
      res.status(200).json({ message: "Course record deleted successfully" });
    });
  });
});

courseRouter.get("/searchcourse", (req, res) => {
  const searchQuery = req.query.search;
  const query = "SELECT * FROM Course WHERE c_code LIKE ? OR c_title LIKE ?";
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

module.exports = courseRouter;
