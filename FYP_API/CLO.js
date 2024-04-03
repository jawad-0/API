const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");

const app = express();
const port = 8000;

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

// FOR HOD SIDE >>
// getCLO/:c_id
// addCLO
// editCLO/:clo_id
// setStatusApproved/:c_id
// setStatusDisapproved/:c_id
// deleteCLO/:id

const getQuery = "SELECT * FROM CLO WHERE c_id = @c_id";

const postQuery =
  "INSERT INTO CLO (clo_id, c_id, clo_text, status) VALUES (@clo_id, @c_id, @clo_text, @status)";

const editQuery = "UPDATE CLO SET clo_text = @clo_text WHERE clo_id = @clo_id";

const editStatusQuery =
  "UPDATE CLO SET status = @status WHERE c_id = @c_id";

const deleteQuery = "DELETE FROM CLO WHERE clo_id = @clo_id";

const pool = new sql.ConnectionPool(config);
app.use(express.json());

// GET endpoint
app.get("/getCLO/:c_id", async (req, res) => {
  try {
    const userId = req.params.c_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid Course ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("c_id", sql.Int, userId)
      .query(getQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Data not found for the given ID" });
    }
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get Request Error");
  } finally {
    pool.close();
  }
});

// POST endpoint
app.post("/addCLO", async (req, res) => {
  try {
    const { clo_id, c_id, clo_text } = req.body;
    const initialStatus = 'pending';
    await pool.connect();
    await pool
      .request()
      .input("clo_id", sql.Int, clo_id)
      .input("c_id", sql.Int, c_id)
      .input("clo_text", sql.NVarChar(255), clo_text)
      .input("status", sql.NVarChar(255), initialStatus)
      .query(postQuery);
    res.status(200).json({ message: "CLO inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Post Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT endpoint
app.put("/editCLO/:clo_id", async (req, res) => {
  try {
    const userId = req.params.clo_id;
    const { clo_text } = req.body;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid CLO ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("clo_id", sql.Int, userId)
      .input("clo_text", sql.NVarChar(255), clo_text)
      .query(editQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "CLO not found" });
    }
    res.status(200).json({ message: "CLO updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Edit Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT STATUS endpoint
app.put("/setStatusApproved/:c_id", async (req, res) => {
    try {
      const userId = req.params.c_id;
      if (!/^\d+$/.test(userId)) {
        return res.status(400).json({ error: "Invalid course ID" });
      }
      await pool.connect();
      const fetchResult = await pool
        .request()
        .input("c_id", sql.Int, userId)
        .query(getQuery);
      if (fetchResult.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Course not found" });
      }
      const currentStatus = fetchResult.recordset[0].status;
      let newStatus;
      if (currentStatus === "pending") {
        newStatus = "approved";
      } else if (currentStatus === "disapproved") {
        newStatus = "approved";
      }
      const updateResult = await pool
        .request()
        .input("c_id", sql.Int, userId)
        .input("status", sql.NVarChar(255), newStatus)
        .query(editStatusQuery);
      if (updateResult.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.status(200) .json({ message: "Course status updated successfully", newStatus });
    } catch (error) {
      console.error("Error updating course status:", error);
      res.status(500).json({ error: "Edit Status Request Error" });
    } finally {
      pool.close();
    }
  });

  // EDIT STATUS endpoint
app.put("/setStatusDisapproved/:c_id", async (req, res) => {
    try {
      const userId = req.params.c_id;
      if (!/^\d+$/.test(userId)) {
        return res.status(400).json({ error: "Invalid course ID" });
      }
      await pool.connect();
      const fetchResult = await pool
        .request()
        .input("c_id", sql.Int, userId)
        .query(getQuery);
      if (fetchResult.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Course not found" });
      }
      const currentStatus = fetchResult.recordset[0].status;
      let newStatus;
      if (currentStatus === "pending") {
        newStatus = "disapproved";
      } else if (currentStatus === "approved") {
        newStatus = "disapproved";
      }
      const updateResult = await pool
        .request()
        .input("c_id", sql.Int, userId)
        .input("status", sql.NVarChar(255), newStatus)
        .query(editStatusQuery);
      if (updateResult.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.status(200) .json({ message: "Course status updated successfully", newStatus });
    } catch (error) {
      console.error("Error updating course status:", error);
      res.status(500).json({ error: "Edit Status Request Error" });
    } finally {
      pool.close();
    }
  });

// DELETE endpoint
app.delete("/deleteCLO/:clo_id", async (req, res) => {
  try {
    const userId = req.params.clo_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("clo_id", sql.Int, userId)
      .query(deleteQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "CLO not found" });
    }
    res.status(200).json({ message: "CLO deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Delete Request Error" });
  } finally {
    pool.close();
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
