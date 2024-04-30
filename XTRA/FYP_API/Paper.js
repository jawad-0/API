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

// FOR FACULTY SIDE >>
// getPaper
// addPaper
// editPaper/:p_id
// deletePaper/:p_id

const getQuery = "SELECT * FROM Paper";

const postQuery =
  "INSERT INTO Paper (p_id, p_name, duration, degree, t_marks, term, year, exam_date, semester, status, c_id) VALUES (@p_id, @p_name, @duration, @degree, @t_marks, @term, @year, @exam_date, @semester, @status, @c_id)";

const editQuery =
  "UPDATE Paper SET duration = @duration, degree = @degree, t_marks = @t_marks, term = @term, year = @year, exam_date = @exam_date, semester = @semester WHERE p_id = @p_id";

const deleteQuery = "DELETE FROM Paper WHERE p_id = @p_id";

const pool = new sql.ConnectionPool(config);

app.use(express.json());

// GET endpoint
app.get("/getPaper", async (req, res) => {
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

// POST endpoint
app.post("/addPaper", async (req, res) => {
  try {
    const { p_id, p_name, duration, degree, t_marks, term, year, exam_date, semester, status, c_id } = req.body;
    console.log("Data received:", { p_id, p_name, duration, degree, t_marks, term, year, exam_date, semester, status, c_id });
    await pool.connect();
    await pool
      .request()
      .input("p_id", sql.Int, p_id)
      .input("p_name", sql.NVarChar(255), p_name)
      .input("duration", sql.Int, duration)
      .input("degree", sql.NVarChar(255), degree)
      .input("t_marks", sql.Int, t_marks)
      .input("term", sql.NVarChar(255), term)
      .input("year", sql.Int, year)
      .input("exam_date", sql.NVarChar(255), exam_date)
      .input("semester", sql.NVarChar(255), semester)
      .input("status", sql.NVarChar(255), status)
      .input("c_id", sql.Int, c_id)
      .query(postQuery);
    res.status(200).json({ message: "Paper inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Post Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT endpoint
app.put("/editPaper/:p_id", async (req, res) => {
  try {
    const userId = req.params.p_id;
    const { duration, degree, t_marks, term, year, exam_date, semester } = req.body;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid paper ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("p_id", sql.Int, userId)
      .input("duration", sql.Int, duration)
      .input("degree", sql.NVarChar(255), degree)
      .input("t_marks", sql.Int, t_marks)
      .input("term", sql.NVarChar(255), term)
      .input("year", sql.Int, year)
      .input("exam_date", sql.NVarChar(255), exam_date)
      .input("semester", sql.NVarChar(255), semester)
      .query(editQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Paper not found" });
    }
    res.status(200).json({ message: "Paper updated successfully" });
  } catch (error) {
    console.error("Error updating paper:", error);
    res.status(500).json({ error: "Edit Request Error" });
  } finally {
    pool.close();
  }
});

// DELETE endpoint
app.delete("/deletePaper/:p_id", async (req, res) => {
  try {
    const userId = req.params.p_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid paper ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("p_id", sql.Int, userId)
      .query(deleteQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Paper not found" });
    }
    res.status(200).json({ message: "Paper deleted successfully" });
  } catch (error) {
    console.error("Error deleting paper:", error);
    res.status(500).json({ error: "Delete Request Error" });
  } finally {
    pool.close();
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
