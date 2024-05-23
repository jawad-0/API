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

topicRouter.get("/getcommontopictaught/:c_id", (req, res) => {
  const courseId = req.params.c_id;
  const query =
    "SELECT t.* FROM Topic t WHERE NOT EXISTS (SELECT f_id FROM Assigned_Course ac WHERE ac.c_id = ? AND ac.f_id NOT IN (SELECT DISTINCT tt.f_id FROM TopicTaught tt WHERE tt.t_id = t.t_id))";
  connection.query(query, [courseId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// topicRouter.get("/getcommontopictaught2/:c_id", (req, res) => {
//   const courseId = req.params.c_id;
//   // const query = "SELECT t.t_id, COUNT(DISTINCT tt.f_id) AS taught_count, (SELECT COUNT(DISTINCT f.f_id) FROM Faculty f JOIN Assigned_Course ac ON f.f_id = ac.f_id WHERE ac.c_id = 1) AS total_teachers FROM Topic JOIN TopicTaught tt ON t.t_id = tt.t_id WHERE t.c_id = 1 GROUP BY t.t_id HAVING taught_count = (SELECT COUNT(DISTINCT f.f_id) FROM Faculty f JOIN Assigned_Course ac ON f.f_id = ac.f_id WHERE ac.c_id = 1)";
//   const query =
//     "SELECT t.t_id, COUNT(DISTINCT tt.f_id) AS taught_count, (SELECT COUNT(DISTINCT f.f_id) FROM Faculty f JOIN Assigned_Course ac ON f.f_id = ac.f_id WHERE ac.c_id = ?) AS total_teachers FROM Topic t JOIN TopicTaught tt ON t.t_id = tt.t_id WHERE t.c_id = ? GROUP BY t.t_id HAVING taught_count = (SELECT COUNT(DISTINCT f.f_id) FROM Faculty f JOIN Assigned_Course ac ON f.f_id = ac.f_id WHERE ac.c_id = ?)";
//   //   const values = { courseId, courseId, courseId };
//   connection.query(query, [courseId, courseId, courseId], (err, results) => {
//     //   connection.query(query, [values], (err, results) => {
//     if (err) {
//       console.error("Error executing the query:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }
//     res.json(results);
//   });
// });

// topicRouter.get("/getcommontopictaught3/:c_id/:t_id", (req, res) => {
//   const courseId = req.params.c_id;
//   const topicId = req.params.t_id;
//   const query =
//     "SELECT CASE WHEN COUNT(DISTINCT tt.f_id) = (SELECT COUNT(DISTINCT f.f_id) FROM Faculty f JOIN Assigned_Course ac ON f.f_id = ac.f_id WHERE ac.c_id = ?) THEN TRUE ELSE FALSE END AS is_taught_by_all FROM TopicTaught tt WHERE tt.t_id = ?";
//   connection.query(query, [courseId, topicId], (err, results) => {
//     if (err) {
//       console.error("Error executing the query:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }
//     res.json(results);
//   });
// });

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
topicRouter.delete("/deletetopictaught", (req, res) => {
  const { t_id, f_id } = req.body;
  if (!/^\d+$/.test(t_id)) {
    return res.status(400).json({ error: "Invalid topic ID" });
  }
  if (!/^\d+$/.test(f_id)) {
    return res.status(400).json({ error: "Invalid faculty ID" });
  }
  const query = "DELETE FROM TopicTaught WHERE t_id = ? AND f_id = ?";
  const values = [t_id, f_id];
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
