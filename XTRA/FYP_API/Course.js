const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");

const app = express();
const port = 1002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const config = {
  user: "sa",
  password: "admin123",
  server: "127.0.0.1",
  database: "FYP",
  options: {
    encrypt: false,
  },
};

// FOR DATACELL SIDE >>
// getCourse
// addCourse
// editCourse/:c_id
// deleteCourse/:c_id
// seacrhCourse

const getQuery = "SELECT * FROM Course";

const getSingleRecordQuery = "SELECT * FROM Course WHERE c_id = @c_id";

const postQuery =
  "INSERT INTO Course (c_code, c_title, cr_hours, status) VALUES (@c_code, @c_title, @cr_hours, @status)";

const editQuery =
  "UPDATE Course SET c_code = @c_code, c_title = @c_title, cr_hours = @cr_hours WHERE c_id = @c_id";

const editStatusQuery = "UPDATE Course SET status = @status WHERE c_id = @c_id";

const deleteQuery = "DELETE FROM Course WHERE c_id = @c_id";

const searchCourseQuery =
  "SELECT * FROM Course WHERE c_code LIKE @searchQuery OR c_title LIKE @searchQuery";

const searchCourseNameQuery =
  "SELECT * FROM Course WHERE c_title LIKE @searchQuery";

const pool = new sql.ConnectionPool(config);

app.use(express.json());

// GET endpoint
app.get("/getCourse", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query(getQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get Request Error");
  } finally {
    pool.close();
  }
});

// GET endpoint
app.get("/getSingleCourse/:c_id", async (req, res) => {
  try {
    const userId = req.params.c_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("c_id", sql.Int, userId)
      .query(getSingleRecordQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get Request Error");
  } finally {
    pool.close();
  }
});

// POST endpoint
app.post("/addCourse", async (req, res) => {
  try {
    const { c_code, c_title, cr_hours } = req.body;
    const status = "enabled";
    console.log("Data received:", { c_code, c_title, cr_hours, status });
    await pool.connect();
    await pool
      .request()
      .input("c_code", sql.NVarChar(255), c_code)
      .input("c_title", sql.NVarChar(255), c_title)
      .input("cr_hours", sql.Int, cr_hours)
      .input("status", sql.NVarChar(255), status)
      .query(postQuery);
    res.status(200).json({ message: "Course inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Post Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT endpoint
app.put("/editCourse/:c_id", async (req, res) => {
  try {
    const userId = req.params.c_id;
    const { c_code, c_title, cr_hours } = req.body;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("c_id", sql.Int, userId)
      .input("c_code", sql.NVarChar(255), c_code)
      .input("c_title", sql.NVarChar(255), c_title)
      .input("cr_hours", sql.Int, cr_hours)
      .query(editQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ message: "Course updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Edit Request Error" });
  } finally {
    pool.close();
  }
});

// DELETE endpoint
app.delete("/deleteCourse/:c_id", async (req, res) => {
  try {
    const userId = req.params.c_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("c_id", sql.Int, userId)
      .query(deleteQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Delete Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT STATUS endpoint
app.put("/editCourseStatus/:c_id", async (req, res) => {
  try {
    const userId = req.params.c_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }
    await pool.connect();
    const fetchResult = await pool
      .request()
      .input("c_id", sql.Int, userId)
      .query(getSingleRecordQuery);
    if (fetchResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    const currentStatus = fetchResult.recordset[0].status;
    let newStatus;
    if (currentStatus === "enabled") {
      newStatus = "disabled";
    } else if (currentStatus === "disabled") {
      newStatus = "enabled";
    }
    const updateResult = await pool
      .request()
      .input("c_id", sql.Int, userId)
      .input("status", sql.NVarChar(255), newStatus)
      .query(editStatusQuery);
    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res
      .status(200)
      .json({ message: "Course status updated successfully", newStatus });
  } catch (error) {
    console.error("Error updating course status:", error);
    res.status(500).json({ error: "Edit Status Request Error" });
  } finally {
    pool.close();
  }
});

// SEARCH endpoint
app.get("/searchCourse", async (req, res) => {
  try {
    const searchQuery = req.query.search;
    if (!searchQuery) {
      return res.status(400).json({ error: "Missing search query parameter" });
    }
    await pool.connect();
    const searchResult = await pool
      .request()
      .input("searchQuery", sql.NVarChar(255), `%${searchQuery}%`)
      .query(searchCourseQuery);
    res.json(searchResult.recordset);
  } catch (error) {
    console.error("Error searching course:", error);
    res.status(500).json({ error: "Search Request Error" });
  } finally {
    pool.close();
  }
});

// SEARCH endpoint
app.get("/searchCourseName", async (req, res) => {
    try {
      const searchQuery = req.query.search;
      if (!searchQuery) {
        return res.status(400).json({ error: "Missing search query parameter" });
      }
      await pool.connect();
      const searchResult = await pool
        .request()
        .input("searchQuery", sql.NVarChar(255), `%${searchQuery}%`)
        .query(searchCourseNameQuery);
      res.json(searchResult.recordset);
    } catch (error) {
      console.error("Error searching course:", error);
      res.status(500).json({ error: "Search Request Error" });
    } finally {
      pool.close();
    }
  });

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
