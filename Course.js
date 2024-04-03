const express = require("express");
const { sql, pool } = require("./database");

const courseRouter = express.Router();


const getQuery = "SELECT * FROM Course";
const getSingleRecordQuery = "SELECT * FROM Course WHERE c_id = @c_id";
const postQuery = "INSERT INTO Course (c_code, c_title, cr_hours,status) VALUES ( @c_code, @c_title, @cr_hours,@status)";
const editQuery = "UPDATE Course SET c_code = @c_code, c_title = @c_title, cr_hours = @cr_hours WHERE c_id = @c_id";
const editStatusQuery = "UPDATE Course SET status = @status WHERE c_id = @c_id";
const searchCourseQuery = "SELECT * FROM Course WHERE c_code LIKE @searchQuery OR c_title LIKE @searchQuery";
const getQueryWithEnabledStatus = "SELECT * FROM Course where status='enabled'";

// GET endpoint
courseRouter.get("/getCourse",async (req, res) => {
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


courseRouter.get("/getCourseWithEnabledStatus",async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query(getQueryWithEnabledStatus);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get Request Error");
  } finally {
    pool.close();
  }
});

// POST endpoint
courseRouter.post("/addCourse", async (req, res) => {
  try {
    const { c_id, c_code, c_title, cr_hours } = req.body;
    const status = "enabled";
    console.log("Data received:", { c_id, c_code, c_title, cr_hours });
    await pool.connect();
    await pool
      .request()
      .input("c_code", sql.NVarChar(255), c_code)
      .input("c_title", sql.NVarChar(255), c_title)
      .input("cr_hours", sql.Int, cr_hours)
      .input("status",sql.NVarChar(255),status)
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
courseRouter.put("/editCourse/:c_id", async (req, res) => {
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

// EDIT STATUS endpoint
courseRouter.put("/editCourseStatus/:c_id", async (req, res) => {
  try {
    const cId = req.params.c_id;
    if (!/^\d+$/.test(cId)) {
      return res.status(400).json({ error: "Invalid Course ID" });
    }
    await pool.connect();
    const fetchResult = await pool
      .request()
      .input("c_id", sql.Int, cId)
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
      .request().input("c_id", sql.Int, cId).input("status", sql.NVarChar(255), newStatus).query(editStatusQuery);
    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ message: "Course status updated successfully", newStatus });
  } catch (error) {
    console.error("Error updating Course status:", error);
    res.status(500).json({ error: "Edit Status Request Error" });
  } finally {
    if (pool) {
      await pool.close();
  }
}});


// SEARCH endpoint
courseRouter.get("/searchCourse", async (req, res) => {
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
    if(pool){
    await pool.close();
    }
  }
});

module.exports = courseRouter;
