const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const topicRouter = express.Router();
const connection = require("./database");
topicRouter.use(bodyParser.json());

topicRouter.get("/gettopic/:c_id", (req, res) => {
  const courseId = req.params.c_id;
  const query = "SELECT * FROM Topic WHERE c_id = ?";
  connection.query(query, [courseId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

topicRouter.get("/getsingletopic/:t_id", (req, res) => {
  const topicId = req.params.t_id;
  const query =
    "SELECT t.t_id, t.t_name, t.c_id, t.status, GROUP_CONCAT(tc.clo_id) AS clo_ids FROM Topic t LEFT JOIN topic_map_clo tc ON t.t_id = tc.t_id WHERE t.t_id = ? GROUP BY t.t_id, t.t_name, t.c_id, t.status";
  connection.query(query, [topicId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Format the clo_ids to an array
    const formattedResults = results.map((row) => ({
      ...row,
      clo_ids: row.clo_ids ? row.clo_ids.split(",").map(Number) : []
    }));
    res.json(formattedResults);
  });
});

topicRouter.get("/searchtopic/:c_id", (req, res) => {
  const courseId = req.params.c_id;
  const search = req.query.search || "";
  const query = "SELECT * FROM Topic WHERE c_id = ? AND t_name LIKE ?";
  const values = [courseId, `%${search}%`];
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// topicRouter.post("/addtopic", (req, res) => {
//     const { c_id, t_name } = req.body;
//     const status = "enabled";
//     const query =
//       "INSERT INTO Topic (c_id, t_name, status) VALUES (?, ?, ?)";
//     const values = [c_id, t_name, status];
//     connection.query(query, values, (err) => {
//       if (err) {
//         console.error("Error executing the query:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//         return;
//       }
//       res.status(200).json({ message: "Topic added successfully" });
//     });
//   });

topicRouter.post("/addtopic", (req, res) => {
  const { c_id, t_name, clo_ids } = req.body; // Expect clo_ids to be an array
  const status = "enabled";
  const insertTopicQuery =
    "INSERT INTO Topic (c_id, t_name, status) VALUES (?, ?, ?)";
  const insertTopicValues = [c_id, t_name, status];

  // Insert the topic
  connection.query(insertTopicQuery, insertTopicValues, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const t_id = result.insertId; // Get the inserted topic ID

    // Insert into Topic_Map_CLO
    if (clo_ids && clo_ids.length > 0) {
      const insertMappingQuery =
        "INSERT INTO Topic_Map_CLO (clo_id, t_id) VALUES ?";
      const insertMappingValues = clo_ids.map((clo_id) => [clo_id, t_id]);

      connection.query(insertMappingQuery, [insertMappingValues], (err) => {
        if (err) {
          console.error("Error executing the mapping query:", err);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }

        res
          .status(200)
          .json({ message: "Topic and mappings added successfully" });
      });
    } else {
      res.status(200).json({
        message: "Topic added successfully, but no CLO mappings were provided"
      });
    }
  });
});

topicRouter.put("/edittopic", (req, res) => {
  const { t_id, t_name, add_clo_ids, remove_clo_ids } = req.body;

  const updateTopicQuery = "UPDATE Topic SET t_name = ? WHERE t_id = ?";
  const updateTopicValues = [t_name, t_id];

  connection.query(updateTopicQuery, updateTopicValues, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Add new CLO mappings
    if (add_clo_ids && add_clo_ids.length > 0) {
      const addMappingsQuery =
        "INSERT INTO Topic_Map_CLO (clo_id, t_id) VALUES ?";
      const addMappingsValues = add_clo_ids.map((clo_id) => [clo_id, t_id]);

      connection.query(addMappingsQuery, [addMappingsValues], (err) => {
        if (err) {
          console.error("Error executing the query:", err);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
      });
    }

    // Remove CLO mappings
    if (remove_clo_ids && remove_clo_ids.length > 0) {
      const removeMappingsQuery =
        "DELETE FROM Topic_Map_CLO WHERE t_id = ? AND clo_id IN (?)";
      const removeMappingsValues = [t_id, remove_clo_ids];

      connection.query(removeMappingsQuery, removeMappingsValues, (err) => {
        if (err) {
          console.error("Error executing the query:", err);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
      });
    }

    res
      .status(200)
      .json({ message: "Topic and mappings updated successfully" });
  });
});

topicRouter.put("/enabledisabletopic/:t_id", (req, res) => {
  const topicId = req.params.t_id;
  let { status } = req.body;
  if (status !== "enabled" && status !== "disabled") {
    return res.status(400).json({
      error: 'Invalid status value. Status must be either "enable" or "disable"'
    });
  }
  if (status === "enabled") {
    status = "disabled";
  } else if (status === "disabled") {
    status = "enabled";
  }
  const query = "UPDATE Topic SET status = ? WHERE t_id = ?";
  const values = [status, topicId];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Topic record not found" });
    }
    res.status(200).json({ message: "Topic record updated successfully" });
  });
});

topicRouter.get("/gettopictaught/:f_id", (req, res) => {
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

topicRouter.get("/getcommontopictaught/:c_id", (req, res) => {
  const courseId = req.params.c_id;
  const query =
    "SELECT t.* FROM Topic t WHERE NOT EXISTS (SELECT ac.f_id FROM Assigned_Course ac WHERE ac.c_id = ? AND ac.f_id NOT IN (SELECT DISTINCT tt.f_id FROM Topic_Taught tt WHERE tt.t_id = t.t_id))";
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
topicRouter.delete("/deletetopictaught", (req, res) => {
  const { t_id, f_id } = req.body;
  if (!/^\d+$/.test(t_id)) {
    return res.status(400).json({ error: "Invalid topic ID" });
  }
  if (!/^\d+$/.test(f_id)) {
    return res.status(400).json({ error: "Invalid faculty ID" });
  }
  const query = "DELETE FROM Topic_Taught WHERE t_id = ? AND f_id = ?";
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
