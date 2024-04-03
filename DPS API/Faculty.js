const express = require("express");
const bcrypt = require("bcrypt");
const { sql, pool } = require("./database");

const saltRounds = 10;
const facultyRouter = express.Router();

// Your queries
const getQuery = "SELECT * FROM Faculty";
const getQueryWithEnabledStatus = "SELECT * FROM Faculty where status='enabled'";
const getSingleRecordQuery = "SELECT * FROM Faculty WHERE f_id = @f_id";
const postQuery = "INSERT INTO Faculty (f_name, username, password, status) VALUES (@f_name, @username, @password, @status)";
const editQuery = "UPDATE Faculty SET f_name = @f_name, username = @username, password = @password WHERE f_id = @f_id";
const editStatusQuery = "UPDATE Faculty SET status = @status WHERE f_id = @f_id";

const searchFacultyQuery = "SELECT * FROM Faculty WHERE f_name LIKE @searchQuery OR username LIKE @searchQuery";
const searchFacultyNameQuery = "SELECT * FROM Faculty WHERE f_name LIKE @searchQuery";
const getFacultyNamesQuery = "SELECT f_id, f_name FROM Faculty";

// GET endpoint
facultyRouter.get("/getFaculty",async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query(getQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get Request Error");
  } finally {
    // Move pool.close() inside the try block
    if (pool) {
      pool.close();
    }
  }
});
facultyRouter.get("/getFacultyWithEnabledStatus",async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query(getQueryWithEnabledStatus);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get Request Error");
  } finally {
    // Move pool.close() inside the try block
    if (pool) {
      pool.close();
    }
  }
});

// POST endpoint
facultyRouter.post("/addFaculty", async (req, res) => {
  try {

    const { f_name, username, password } = req.body;
    const status = "enabled";
    console.log("Data received:", { f_name, username, password, status });

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.connect();
    await pool
      .request()
      .input("f_name", sql.NVarChar(255), f_name)
      .input("username", sql.NVarChar(255), username)
      .input("password", sql.NVarChar(255), hashedPassword)
      .input("status", sql.NVarChar(255), status)
      .query(postQuery);
    res.status(200).json({ message: "Faculty inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Post Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT endpoint
facultyRouter.put("/editFaculty/:f_id", async (req, res) => {
  try {
    const userId = req.params.f_id;
    const { f_name, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid faculty ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("f_id", sql.Int, userId)
      .input("f_name", sql.NVarChar(255), f_name)
      .input("username", sql.NVarChar(255), username)
      .input("password", sql.NVarChar(255), hashedPassword)
      .query(editQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Faculty not found" });
    }
    res.status(200).json({ message: "Faculty updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Edit Request Error" });
  } finally {
    await pool.close();
  }
});


// EDIT STATUS endpoint
facultyRouter.put("/editFacultyStatus/:f_id", async (req, res) => {
  try {
    const userId = req.params.f_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid faculty ID" });
    }
    await pool.connect();
    const fetchResult = await pool
      .request()
      .input("f_id", sql.Int, userId)
      .query(getSingleRecordQuery);
    if (fetchResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Faculty not found" });
    }
    const currentStatus = fetchResult.recordset[0].status;
    let newStatus;
    if (currentStatus === "enabled") {
      newStatus = "disabled";
    } else if (currentStatus === "disabled") {
      newStatus = "enabled";
    }
    const updateResult = await pool
      .request().input("f_id", sql.Int, userId).input("status", sql.NVarChar(255), newStatus).query(editStatusQuery);
    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Faculty not found" });
    }
    res.status(200).json({ message: "Faculty status updated successfully", newStatus });
  } catch (error) {
    console.error("Error updating faculty status:", error);
    res.status(500).json({ error: "Edit Status Request Error" });
  } finally {
    if (pool) {
      await pool.close();
  }
}});

// SEARCH endpoint
facultyRouter.get("/searchFaculty", async (req, res) => {
  try {
    const searchQuery = req.query.search;
    if (!searchQuery) {
      return res.status(400).json({ error: "Missing search query parameter" });
    }
    await pool.connect();
    const searchResult = await pool
      .request()
      .input("searchQuery", sql.NVarChar(255), `%${searchQuery}%`)
      .query(searchFacultyQuery);
    res.json(searchResult.recordset);
  } catch (error) {
    console.error("Error searching faculty:", error);
    res.status(500).json({ error: "Search Request Error" });
  } finally {
    pool.close();
  }
});

// SEARCH endpoint
facultyRouter.get("/searchFacultyName", async (req, res) => {
  try {
    const searchQuery = req.query.search;
    if (!searchQuery) {
      return res.status(400).json({ error: "Missing search query parameter" });
    }
    await pool.connect();
    const searchResult = await pool
      .request()
      .input("searchQuery", sql.NVarChar(255), `%${searchQuery}%`)
      .query(searchFacultyNameQuery);
    res.json(searchResult.recordset);
  } catch (error) {
    console.error("Error searching faculty:", error);
    res.status(500).json({ error: "Search Request Error" });
  } finally {
    await pool.close();
  }
});

// GET endpoint
facultyRouter.get("/getFacultyNames", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query(getFacultyNamesQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get Request Error");
  } finally {
   await pool.close();
  }
});

module.exports = facultyRouter;
