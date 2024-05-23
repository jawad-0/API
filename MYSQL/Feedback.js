const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const feedbackRouter = express.Router();
const connection = require("./database");
feedbackRouter.use(bodyParser.json());

// To Add New Course
feedbackRouter.post("/addcourse", (req, res) => {
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

// GET endpoint
feedbackRouter.get("/getFeedback/:f_id", (req, res) => {
  try {
    const userId = req.params.f_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid faculty ID" });
    }
    const getQuery =
      "SELECT c.c_code, c.c_title, f.* FROM Feedback f JOIN Paper p ON f.p_id = p.p_id JOIN Course c ON f.c_id = c.c_id JOIN Assigned_Course ac ON c.c_id = ac.c_id WHERE ac.f_id = ?";

    connection.query(getQuery, [userId], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      if (result.length === 0) {
        return res
          .status(404)
          .json({ error: "Data not found for the given ID" });
      }
      res.json(result);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Get Request Error" });
  }
});

// To Add New Course
feedbackRouter.post("/addfeedback", (req, res) => {
  const { feedback, p_id, c_id, q_id } = req.body;
  if (p_id === null || c_id === null) {
    res.status(400).json({ error: "p_id and c_id cannot be null" });
    return;
  }
  const query =
    "INSERT INTO Feedback (feedback_details, p_id, c_id, q_id) VALUES (?, ?, ?, ?)";
  const values = [feedback, p_id, c_id, q_id];
  connection.query(query, values, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Feedback added successfully" });
  });
});

module.exports = feedbackRouter;
