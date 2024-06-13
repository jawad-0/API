const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const assignedCoursesRouter = express.Router();
const connection = require("./database");
assignedCoursesRouter.use(bodyParser.json());

// Routes >>>
// GET  -> getAssignedCourses/:f_id
// GET  -> getUnassignedCourses/:f_id
// GET  -> getAssignedTo/:c_id
// GET  -> getPaperStatus/:f_id
// POST -> assignCourse/:c_id/:f_id
// DEL  -> deleteAssignedCourse/:ac_id
// PUT  -> editRole/:c_id/:f_id

// GET endpoint
assignedCoursesRouter.get("/getAssignedCourses/:f_id", async (req, res) => {
  try {
    const userId = req.params.f_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid faculty ID" });
    }
    const sessionQuery = "SELECT s_id FROM Session WHERE flag = 'active'";
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
      // const getAssignedCoursesQuery =
      //   "SELECT ac.ac_id, f.f_name AS 'TeacherName', c.c_title AS 'CourseTitle', c.c_code AS 'CourseCode' FROM faculty f JOIN Assigned_Course ac ON f.f_id = ac.f_id JOIN course c ON ac.c_id = c.c_id WHERE f.f_id = ?";
      const getAssignedCoursesQuery =
        "SELECT ac.*, f.f_name, c.c_title, c.c_code FROM faculty f JOIN assigned_course ac ON f.f_id = ac.f_id JOIN course c ON ac.c_id = c.c_id WHERE f.f_id = ? AND s_id = ?";

      connection.query(
        getAssignedCoursesQuery,
        [userId, s_id],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Query error" });
          }
          if (result.length === 0) {
            return res
              .status(404)
              .json({ error: "Data not found for the given ID" });
          }
          res.json(result);
        }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Get Request Error" });
  }
});

// GET endpoint
assignedCoursesRouter.get("/getUnassignedCourses/:f_id", async (req, res) => {
  try {
    const userId = req.params.f_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid faculty ID" });
    }
    const sessionQuery = "SELECT s_id FROM Session WHERE flag = 'active'";
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
      const getUnassignedCoursesQuery =
        "SELECT c.* FROM course c LEFT JOIN assigned_course ac ON c.c_id = ac.c_id AND ac.f_id = ? AND ac.s_id = ? WHERE ac.ac_id IS NULL";

      connection.query(
        getUnassignedCoursesQuery,
        [userId, s_id],
        (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Query error" });
          }
          if (result.length === 0) {
            return res
              .status(404)
              .json({ error: "Data not found for the given ID" });
          }
          res.json(result);
        }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Get Request Error" });
  }
});

// GET endpoint
assignedCoursesRouter.get("/getAssignedTo/:c_id", async (req, res) => {
  try {
    const userId = req.params.c_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }
    const sessionQuery = "SELECT s_id FROM Session WHERE flag = 'active'";
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
      const getAssignedToQuery =
        "SELECT ac.*, f.f_name, c.c_title, c.c_code FROM faculty f JOIN assigned_course ac ON f.f_id = ac.f_id JOIN course c ON ac.c_id = c.c_id WHERE c.c_id = ? AND ac.s_id = ?";

      connection.query(getAssignedToQuery, [userId, s_id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Query error" });
        }
        if (result.length === 0) {
          return res
            .status(404)
            .json({ error: "Data not found for the given ID" });
        }
        res.json(result);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Get Request Error" });
  }
});

// GET endpoint
assignedCoursesRouter.get("/getPaperStatus/:f_id", async (req, res) => {
  try {
    const userId = req.params.f_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid faculty ID" });
    }
    const sessionQuery = "SELECT s_id FROM Session WHERE flag = 'active'";
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
      const getPaperStatusQuery =
        "SELECT c.c_title , p.status FROM faculty f JOIN assigned_course ac ON f.f_id = ac.f_id JOIN course c ON ac.c_id = c.c_id LEFT JOIN Paper p ON c.c_id = p.c_id AND p.s_id = ac.s_id WHERE f.f_id = ? AND ac.s_id = ?";

      connection.query(getPaperStatusQuery, [userId, s_id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Query error" });
        }
        if (result.length === 0) {
          return res
            .status(404)
            .json({ error: "Data not found for the given ID" });
        }
        res.json(result);
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Get Request Error" });
  }
});

// POST endpoint
assignedCoursesRouter.post("/assignCourse/:c_id/:f_id", (req, res) => {
  const c_id = req.params.c_id;
  if (!/^\d+$/.test(c_id)) {
    return res.status(400).json({ error: "Invalid course ID" });
  }
  const f_id = req.params.f_id;
  if (!/^\d+$/.test(f_id)) {
    return res.status(400).json({ error: "Invalid faculty ID" });
  }
  const sessionQuery = "SELECT s_id FROM Session WHERE flag = 'active'";
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
    const role = "junior";
    const query =
      "INSERT INTO Assigned_Course (c_id, f_id, role, s_id) VALUES (?, ?, ?, ?)";
    const values = [c_id, f_id, role, s_id];
    connection.query(query, values, (err) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json({ message: "Course assigned successfully" });
    });
  });
});

// DELETE endpoint
assignedCoursesRouter.delete("/deleteAssignedCourse/:ac_id", (req, res) => {
  const ac_id = req.params.ac_id;
  if (!/^\d+$/.test(ac_id)) {
    return res.status(400).json({ error: "Invalid assigned_course ID" });
  }
  const query = "DELETE FROM Assigned_Course WHERE ac_id = ?";
  const values = [ac_id];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Assignment not found" });
      return;
    }
    res.status(200).json({ message: "Assignment deleted successfully" });
  });
});

// PUT endpoint
assignedCoursesRouter.put("/editRole/:c_id/:f_id", async (req, res) => {
  try {
    const c_id = req.params.c_id;
    const f_id = req.params.f_id;
    if (!/^\d+$/.test(c_id)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }
    if (!/^\d+$/.test(f_id)) {
      return res.status(400).json({ error: "Invalid faculty ID" });
    }
    const sessionQuery = "SELECT s_id FROM Session WHERE flag = 'active'";
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
      const editStatusQuery =
        "UPDATE Assigned_Course SET role = CASE WHEN f_id = ? THEN 'senior' ELSE 'junior' END WHERE c_id = ? AND s_id = ?";

      connection.query(editStatusQuery, [f_id, c_id, s_id], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Query error" });
        }
        res.json({ message: "Role updated successfully" });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Get Request Error" });
  }
});

module.exports = assignedCoursesRouter;
