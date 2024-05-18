const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const topicRouter = express.Router();
const connection = require("./database");
topicRouter.use(bodyParser.json());

topicRouter.get("/gettopic/:c_id", (req, res) => {
  const paperId = req.params.c_id;
  const query = "SELECT * FROM Topic WHERE c_id = ?";

  connection.query(query, [paperId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

topicRouter.get("/gettopictaught/:f_id", (req, res) => {
  const facultyId = req.params.f_id;
  const query = "SELECT * FROM TopicTaught WHERE f_id = ?";

  connection.query(query, [facultyId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// To Add New Topic Taught
topicRouter.post("/addtopictaught", (req, res) => {
  const { f_id, t_id, st_id } = req.body;
  const query = "INSERT INTO TopicTaught (f_id, t_id, st_id) VALUES (?, ?, ?)";
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
topicRouter.delete("/deletetopictaught/:tt_id", (req, res) => {
  const tt_id = req.params.tt_id;
  if (!/^\d+$/.test(tt_id)) {
    return res.status(400).json({ error: "Invalid topic_taught ID" });
  }
  const query = "DELETE FROM TopicTaught WHERE tt_id = ?";
  const values = [tt_id];
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

module.exports = topicRouter;
