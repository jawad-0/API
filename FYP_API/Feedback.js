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

// FOR FACULTY/DIRECTOR SIDE >>
// getFeedback/:f_id
// addFeedback

const getQuery =
  "SELECT c.c_code, c.c_title, f.feedback_details FROM Course c JOIN Feedback f ON c.c_id = f.c_id WHERE f_id = @f_id";

const postQuery =
  "INSERT INTO Feedback (feedback_id, feedback_details, f_id, p_id, c_id) VALUES (@feedback_id, @feedback_details, @f_id, @p_id, @c_id)";

const pool = new sql.ConnectionPool(config);

app.use(express.json());

// GET endpoint
app.get("/getFeedback/:f_id", async (req, res) => {
  try {
    const userId = req.params.f_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid faculty ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("f_id", sql.Int, userId)
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
app.post("/addFeedback", async (req, res) => {
  try {
    const { feedback_id, feedback_details, f_id, p_id, c_id } = req.body;
    console.log("Data received:", {
      feedback_id,
      feedback_details,
      f_id,
      p_id,
      c_id,
    });
    await pool.connect();
    await pool
      .request()
      .input("feedback_id", sql.Int, feedback_id)
      .input("feedback_details", sql.NVarChar(255), feedback_details)
      .input("f_id", sql.Int, f_id)
      .input("p_id", sql.Int, p_id)
      .input("c_id", sql.Int, c_id)
      .query(postQuery);
    res.status(200).json({ message: "Feedback inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Post Request Error" });
  } finally {
    pool.close();
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
