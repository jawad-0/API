const express = require("express");
const { sql, pool } = require("./database");

const AssignedCoursesRouter = express.Router();
// FOR HOD SIDE >>
// getAssignedCourses/:f_id
// getAssignedTo/:c_id
// addAssignedCourse
// deleteAssignedCourse/:c_id/:f_id
// editRole/:c_id/:f_id

const getAssignedCoursesQuery =
  "SELECT ac.ac_id, f.f_name AS 'TeacherName', c.c_title AS 'CourseTitle', c.c_code AS 'CourseCode' FROM faculty f JOIN Assigned_Course ac ON f.f_id = ac.f_id JOIN course c ON ac.c_id = c.c_id WHERE f.f_id = @f_id";

const getAssignedToQuery =
  "SELECT ac.ac_id, f.f_name AS 'TeacherName', c.c_title AS 'CourseTitle', c.c_code AS 'CourseCode' FROM faculty f JOIN Assigned_Course ac ON f.f_id = ac.f_id JOIN course c ON ac.c_id = c.c_id WHERE c.c_id = @c_id";

const postQuery =
  "INSERT INTO Assigned_Course (ac_id, c_id, f_id, role) VALUES (@ac_id, @c_id, @f_id, @role)";

// const editQuery =
//   "UPDATE Assigned_Course SET c_id = @c_id, f_id = @f_id, role = @role WHERE ac_id = @ac_id";

const editStatusQuery =
  "UPDATE Assigned_Course SET role = CASE WHEN f_id = @f_id THEN 'Senior' ELSE 'Normal' END WHERE c_id = @c_id";

const deleteAssignedCourseQuery =
  "DELETE FROM Assigned_Course WHERE ac_id = @ac_id";



// GET endpoint
AssignedCoursesRouter.get("/getAssignedCourses/:f_id", async (req, res) => {
  try {
    const userId = req.params.f_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("f_id", sql.Int, userId)
      .query(getAssignedCoursesQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Data not found for the given ID" });
    }
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Get Request Error" });
  } finally {
    pool.close();
  }
});

// GET endpoint
AssignedCoursesRouter.get("/getAssignedTo/:c_id", async (req, res) => {
  try {
    const userId = req.params.c_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("c_id", sql.Int, userId)
      .query(getAssignedToQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Data not found for the given ID" });
    }
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Get Request Error" });
  } finally {
    pool.close();
  }
});

// POST endpoint
AssignedCoursesRouter.post("/addAssignedCourse", async (req, res) => {
  try {
    const { ac_id, c_id, f_id } = req.body;
    const role = "Normal";
    console.log("Data received:", { ac_id, c_id, f_id, role });
    await pool.connect();
    await pool
      .request()
      .input("ac_id", sql.Int, ac_id)
      .input("c_id", sql.Int, c_id)
      .input("f_id", sql.Int, f_id)
      .input("role", sql.NVarChar(20), role)
      .query(postQuery);
    res.status(200).json({ message: "Assigned_Course inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Post Request Error" });
  } finally {
    pool.close();
  }
});

// // EDIT endpoint
// app.put("/edit/:id", async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { c_id, f_id, role } = req.body;

//     if (!/^\d+$/.test(userId)) {
//       return res.status(400).json({ error: "Invalid Assigned_Course ID" });
//     }
//     await pool.connect();

//     const result = await pool
//       .request()
//       .input("ac_id", sql.Int, userId)
//       .input("c_id", sql.Int, c_id)
//       .input("f_id", sql.Int, f_id)
//       .input("role", sql.NVarChar(20), role)
//       .query(editQuery);

//     if (result.rowsAffected[0] === 0) {
//       return res.status(404).json({ error: "Assigned_Course not found" });
//     }

//     res.status(200).json({ message: "Assigned_Course updated successfully" });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({ error: "Edit Request Error" });
//   } finally {
//     pool.close();
//   }
// });

// DELETE endpoint
AssignedCoursesRouter.delete("/deleteAssignedCourse/:ac_id", async (req, res) => {
  try {
    const ac_id = req.params.ac_id;
    if (!/^\d+$/.test(ac_id)) {
      return res.status(400).json({ error: "Invalid assigned_course ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("ac_id", sql.Int, ac_id)
      .query(deleteAssignedCourseQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Assigned_Course not found" });
    }
    res.status(200).json({ message: "Assigned_Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Delete Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT STATUS endpoint
AssignedCoursesRouter.put("/editRole/:c_id/:f_id", async (req, res) => {
  try {
    const c_id = req.params.c_id;
    const f_id = req.params.f_id;
    if (!/^\d+$/.test(c_id)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }
    await pool.connect();
    const updateResult = await pool
      .request()
      .input("c_id", sql.Int, c_id)
      .input("f_id", sql.Int, f_id)
      .query(editStatusQuery);
    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Assigned Course not found" });
    }
    res.status(200).json({ success: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating Role:", error);
    res.status(500).json({ error: "Edit Role Request Error" });
  } finally {
    pool.close();
  }
});

module.exports = AssignedCoursesRouter;