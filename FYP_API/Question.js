const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const multer = require("multer");

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
// getQuestion
// addQuestion
// editQuestion/:q_id
// deleteQuestion/:q_id
// editQuestionyStatus/:q_id

const getQuery = "SELECT * FROM Question WHERE p_id = @p_id";

const getSingleRecordQuery = "SELECT * FROM Question WHERE q_id = @q_id";

const postQuery =
  "INSERT INTO Question (q_id, q_text, q_image, q_marks, q_difficulty, q_status, t_id, p_id, f_id) VALUES (@q_id, @q_text, @q_image, @q_marks, @q_difficulty, @q_status, @t_id, @p_id, @f_id)";

const editQuery =
  "UPDATE Question SET q_text = @q_text, q_image = @q_image, q_marks = @q_marks, q_difficulty = @q_difficulty WHERE q_id = @q_id";

const deleteQuery = "DELETE FROM Question WHERE q_id = @q_id";

const editStatusQuery =
  "UPDATE Question SET q_status = @q_status WHERE q_id = @q_id";

const pool = new sql.ConnectionPool(config);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

// GET endpoint
app.get("/getQuestion/:p_id", async (req, res) => {
  try {
    const p_id = req.params.p_id;
    await pool.connect();
    const result = await pool
      .request()
      .input("p_id", sql.Int, p_id)
      .query(getQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get Request Error");
  } finally {
    pool.close();
  }
});

// POST endpoint
app.post("/addQuestion", upload.single("q_image"), async (req, res) => {
  try {
    const { q_id, q_text, q_marks, q_difficulty, t_id, p_id, f_id } = req.body;
    const q_image = req.file.originalname;
    const q_status = "accepted";
    await pool.connect();
    await pool
      .request()
      .input("q_id", sql.Int, q_id)
      .input("q_text", sql.NVarChar(255), q_text)
      .input("q_image", sql.NVarChar(sql.MAX), q_image)
      .input("q_marks", sql.Int, q_marks)
      .input("q_difficulty", sql.NVarChar(255), q_difficulty)
      .input("q_status", sql.NVarChar(255), q_status)
      .input("t_id", sql.Int, t_id)
      .input("p_id", sql.Int, p_id)
      .input("f_id", sql.Int, f_id)
      .query(postQuery);
    res.status(200).json({ message: "Question inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Post Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT endpoint
app.put("/editQuestion/:q_id", upload.single("q_image"), async (req, res) => {
  try {
    const q_id = req.params.q_id;
    const { q_text, q_marks, q_difficulty } = req.body;
    const q_image = req.file.originalname;
    if (!/^\d+$/.test(q_id)) {
      return res.status(400).json({ error: "Invalid question ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("q_id", sql.Int, q_id)
      .input("q_text", sql.NVarChar(255), q_text)
      .input("q_image", sql.NVarChar(sql.MAX), q_image)
      .input("q_marks", sql.Int, q_marks)
      .input("q_difficulty", sql.NVarChar(255), q_difficulty)
      .query(editQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json({ message: "Question updated successfully" });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ error: "Edit Request Error" });
  } finally {
    pool.close();
  }
});

// DELETE endpoint
app.delete("/deleteQuestion/:q_id", async (req, res) => {
  try {
    const userId = req.params.q_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid question ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("q_id", sql.Int, userId)
      .query(deleteQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Delete Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT STATUS endpoint
app.put("/editQuestionyStatus/:q_id", async (req, res) => {
  try {
    const userId = req.params.q_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid question ID" });
    }
    await pool.connect();
    const fetchResult = await pool
      .request()
      .input("q_id", sql.Int, userId)
      .query(getSingleRecordQuery);
    if (fetchResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    const currentStatus = fetchResult.recordset[0].q_status;
    let newStatus;
    if (currentStatus === "accepted") {
      newStatus = "rejected";
    } else if (currentStatus === "rejected") {
      newStatus = "accepted";
    }
    const updateResult = await pool
      .request()
      .input("q_id", sql.Int, userId)
      .input("q_status", sql.NVarChar(255), newStatus)
      .query(editStatusQuery);
    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    res
      .status(200)
      .json({ message: "Question status updated successfully", newStatus });
  } catch (error) {
    console.error("Error updating question status:", error);
    res.status(500).json({ error: "Edit Status Request Error" });
  } finally {
    pool.close();
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
