const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const subtopicRouter = express.Router();
const connection = require("./database");
subtopicRouter.use(bodyParser.json());

subtopicRouter.get("/getsubtopic/:t_id", (req, res) => {
  const topicId = req.params.t_id;
  const query = "SELECT * FROM SubTopic WHERE t_id = ?";
  connection.query(query, [topicId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

subtopicRouter.get("/getsubtopictaught/:f_id", (req, res) => {
  const facultyId = req.params.f_id;
  const query = "SELECT * FROM Topic_Taught WHERE f_id = ?";

  connection.query(query, [facultyId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

subtopicRouter.get("/getcommonsubtopictaught/:c_id", (req, res) => {
  const courseId = req.params.c_id;
  const query =
    "SELECT st.* FROM SubTopic st WHERE NOT EXISTS (SELECT ac.f_id FROM Assigned_Course ac WHERE ac.c_id = ? AND ac.f_id NOT IN (SELECT DISTINCT tt.f_id FROM Topic_Taught tt WHERE tt.st_id = st.st_id))";
  connection.query(query, [courseId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});


// To Add New Topic Taught
subtopicRouter.post("/addsubtopictaught", (req, res) => {
  const { f_id, t_id, st_id } = req.body;
  const query = "INSERT INTO Topic_Taught (f_id, t_id, st_id) VALUES (?, ?, ?)";
  const values = [f_id, t_id, st_id];
  connection.query(query, values, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Course added successfully" });
  });
});

// To Delete Topic Taught
subtopicRouter.delete("/deletesubtopictaught", (req, res) => {
  const { st_id, f_id } = req.body;
  if (!/^\d+$/.test(st_id)) {
    return res.status(400).json({ error: "Invalid subtopic ID" });
  }
  if (!/^\d+$/.test(f_id)) {
    return res.status(400).json({ error: "Invalid faculty ID" });
  }
  const query = "DELETE FROM Topic_Taught WHERE st_id = ? AND f_id = ?";
  const values = [st_id, f_id];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Topic_Taught not found" });
      return;
    }
    res.status(200).json({ message: "Topic_Taught deleted successfully" });
  });
});

module.exports = subtopicRouter;
