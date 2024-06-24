const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const subtopicRouter = express.Router();
const connection = require("./database");
subtopicRouter.use(bodyParser.json());

// Routes >>>
// GET  -> getsubtopic/:t_id
// GET  -> searchsubtopic/:t_id
// POST -> addsubtopic
// PUT  -> editsubtopic
// GET  -> getsubtopictaught/:f_id
// GET  -> getcommonsubtopictaught/:c_id
// POST -> addsubtopictaught
// DEL  -> deletesubtopictaught

// GET endpoint
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

// GET endpoint
subtopicRouter.get("/searchsubtopic/:t_id", (req, res) => {
  const topicId = req.params.t_id;
  const search = req.query.search || "";
  const query = "SELECT * FROM SubTopic WHERE t_id = ? AND st_name LIKE ?";
  const values = [topicId, `%${search}%`];
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// POST endpoint
subtopicRouter.post("/addsubtopic", (req, res) => {
  const { t_id, st_name } = req.body;
  const query = "INSERT INTO SubTopic (t_id, st_name) VALUES (?, ?)";
  const values = [t_id, st_name];
  connection.query(query, values, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "SubTopic added successfully" });
  });
});

// PUT endpoint
subtopicRouter.put("/editsubtopic", (req, res) => {
  const { st_id, st_name } = req.body;
  const query = "UPDATE SubTopic SET st_name = ? WHERE st_id = ?";
  const values = [st_name, st_id];

  connection.query(query, values, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "SubTopic updated successfully" });
  });
});

// GET endpoint
subtopicRouter.get("/getsubtopictaught/:f_id", (req, res) => {
  const facultyId = req.params.f_id;
  const sessionQuery =
    "SELECT s_id, s_name, year FROM Session WHERE flag = 'active'";
  connection.query(sessionQuery, (err, sessionResult) => {
    if (err) {
      console.error("Error executing the session query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (sessionResult.length === 0) {
      res.status(404).json({ error: "No active session found" });
      return;
    }
    const { s_id } = sessionResult[0];
    const query = "SELECT * FROM Topic_Taught WHERE f_id = ? AND s_id = ?";
    connection.query(query, [facultyId, s_id], (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.json(results);
    });
  });
});

// GET endpoint
subtopicRouter.get("/getcommonsubtopictaught/:c_id", (req, res) => {
  const courseId = req.params.c_id;
  const sessionQuery =
    "SELECT s_id, s_name, year FROM Session WHERE flag = 'active'";
  connection.query(sessionQuery, (err, sessionResult) => {
    if (err) {
      console.error("Error executing the session query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (sessionResult.length === 0) {
      res.status(404).json({ error: "No active session found" });
      return;
    }
    const { s_id } = sessionResult[0];
    const query =
      "SELECT st.* FROM SubTopic st WHERE NOT EXISTS (SELECT ac.f_id FROM Assigned_Course ac WHERE ac.c_id = ? AND ac.s_id = ? AND ac.f_id NOT IN (SELECT DISTINCT tt.f_id FROM Topic_Taught tt WHERE tt.st_id = st.st_id AND tt.s_id = ?))";
    connection.query(query, [courseId, s_id, s_id], (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.json(results);
    });
  });
});

// POST endpoint
subtopicRouter.post("/addsubtopictaught", (req, res) => {
  const { f_id, t_id, st_id } = req.body;
  const sessionQuery =
    "SELECT s_id, s_name, year FROM Session WHERE flag = 'active'";
  connection.query(sessionQuery, (err, sessionResult) => {
    if (err) {
      console.error("Error executing the session query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (sessionResult.length === 0) {
      res.status(404).json({ error: "No active session found" });
      return;
    }
    const { s_id } = sessionResult[0];
    const query =
      "INSERT INTO Topic_Taught (f_id, t_id, st_id, s_id) VALUES (?, ?, ?, ?)";
    const values = [f_id, t_id, st_id, s_id];
    connection.query(query, values, (err) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json({ message: "Course added successfully" });
    });
  });
});

// DELETE endpoint
subtopicRouter.delete("/deletesubtopictaught", (req, res) => {
  const { st_id, f_id } = req.body;
  if (!/^\d+$/.test(st_id)) {
    return res.status(400).json({ error: "Invalid subtopic ID" });
  }
  if (!/^\d+$/.test(f_id)) {
    return res.status(400).json({ error: "Invalid faculty ID" });
  }
  const sessionQuery =
    "SELECT s_id, s_name, year FROM Session WHERE flag = 'active'";
  connection.query(sessionQuery, (err, sessionResult) => {
    if (err) {
      console.error("Error executing the session query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (sessionResult.length === 0) {
      res.status(404).json({ error: "No active session found" });
      return;
    }
    const { s_id } = sessionResult[0];
    const query =
      "DELETE FROM Topic_Taught WHERE st_id = ? AND f_id = ? AND s_id = ?";
    const values = [st_id, f_id, s_id];
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
});

module.exports = subtopicRouter;
