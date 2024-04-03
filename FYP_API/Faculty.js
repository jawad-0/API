const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const saltRounds = 10;
const app = express();
const port = 1003;

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

// FOR HOD/DATACELL SIDE >>
// getFaculty
// getSingleFaculty/:f_id
// addFaculty
// editFaculty/:f_id
// deleteFaculty/:f_id
// editFacultyStatus/:f_id
// searchFaculty
// searchFacultyName
// getFacultyNames
// login

const getQuery = "SELECT * FROM Faculty";

const getSingleRecordQuery = "SELECT * FROM Faculty WHERE f_id = @f_id";

const postQuery =
  "INSERT INTO Faculty (f_name, username, password, status) VALUES (@f_name, @username, @password, @status)";

const editQuery =
  "UPDATE Faculty SET f_name = @f_name, username = @username, password = @password WHERE f_id = @f_id";

const editStatusQuery =
  "UPDATE Faculty SET status = @status WHERE f_id = @f_id";

const deleteQuery = "DELETE FROM Faculty WHERE f_id = @f_id";

const searchFacultyQuery =
  "SELECT * FROM Faculty WHERE f_name LIKE @searchQuery OR username LIKE @searchQuery";

const searchFacultyNameQuery =
  "SELECT * FROM Faculty WHERE f_name LIKE @searchQuery";

const getFacultyNamesQuery = "SELECT f_id, f_name FROM Faculty";

const pool = new sql.ConnectionPool(config);

app.use(express.json());

// GET endpoint
app.get("/getFaculty", async (req, res) => {
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
app.get("/getSingleFaculty/:f_id", async (req, res) => {
  try {
    const userId = req.params.f_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid faculty ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("f_id", sql.Int, userId)
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
app.post("/addFaculty", async (req, res) => {
  try {
    const { f_name, username, password } = req.body;
    const status = "enabled";
    console.log("Data received:", { f_name, username, password, status });

    // const hashedPassword = await bcrypt.hash(password, saltRounds);
    const hashedPassword = password;

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
app.put("/editFaculty/:f_id", async (req, res) => {
  try {
    const userId = req.params.f_id;
    const { f_name, username, password } = req.body;
    // const hashedPassword = await bcrypt.hash(password, saltRounds);
    const hashedPassword = password;
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
    pool.close();
  }
});

// DELETE endpoint
app.delete("/deleteFaculty/:f_id", async (req, res) => {
  try {
    const userId = req.params.f_id;
    console.log(userId);
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("f_id", sql.Int, userId)
      .query(deleteQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Faculty not found" });
    }
    res.status(200).json({ message: "Faculty deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Delete Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT STATUS endpoint
app.put("/editFacultyStatus/:f_id", async (req, res) => {
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
      .request()
      .input("f_id", sql.Int, userId)
      .input("status", sql.NVarChar(255), newStatus)
      .query(editStatusQuery);
    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Faculty not found" });
    }
    res
      .status(200)
      .json({ message: "Faculty status updated successfully", newStatus });
  } catch (error) {
    console.error("Error updating faculty status:", error);
    res.status(500).json({ error: "Edit Status Request Error" });
  } finally {
    pool.close();
  }
});

// SEARCH endpoint
app.get("/searchFaculty", async (req, res) => {
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
app.get("/searchFacultyName", async (req, res) => {
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
    pool.close();
  }
});

// GET endpoint
app.get("/getFacultyNames", async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.request().query(getFacultyNamesQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get Request Error");
  } finally {
    pool.close();
  }
});

// POST endpoint for login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Connect to the database
    await pool.connect();

    // Query to fetch user details based on the username
    const result = await pool
      .request()
      .input("username", sql.NVarChar(255), username)
      .query("SELECT * FROM Faculty WHERE username = @username");

    // Check if user with the provided username exists
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify password
    const user = result.recordset[0];
    if (user.password !== password) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Password matched, login successful
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    pool.close();
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
