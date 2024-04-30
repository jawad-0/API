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
// getTopic
// addTopic
// editTopic/:t_id
// deleteTopic/:t_id

const getQuery = "SELECT * FROM Topic WHERE c_id = @c_id";

const postQuery =
  "INSERT INTO Topic (t_id, t_name, c_id) VALUES (@t_id, @t_name, @c_id)";

const editQuery = "UPDATE Topic SET t_name = @t_name WHERE t_id = @t_id";

const deleteQuery = "DELETE FROM Topic WHERE t_id = @t_id";

const pool = new sql.ConnectionPool(config);

app.use(express.json());

// GET endpoint
app.get("/getTopic/:c_id", async (req, res) => {
  try {
    const c_id = req.params.c_id;
    await pool.connect();
    const result = await pool
    .request()
    .input("c_id", sql.Int, c_id)
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
app.post("/addTopic", async (req, res) => {
  try {
    const { t_id, t_name, c_id } = req.body;
    console.log("Data received:", { t_id, t_name, c_id });
    await pool.connect();
    await pool
      .request()
      .input("t_id", sql.Int, t_id)
      .input("t_name", sql.NVarChar(255), t_name)
      .input("c_id", sql.Int, c_id)
      .query(postQuery);
    res.status(200).json({ message: "Topic inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Post Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT endpoint
app.put("/editTopic/:t_id", async (req, res) => {
  try {
    const t_id = req.params.t_id;
    const { t_name } = req.body;
    if (!/^\d+$/.test(t_id)) {
      return res.status(400).json({ error: "Invalid topic ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("t_id", sql.Int, t_id)
      .input("t_name", sql.NVarChar(255), t_name)
      .query(editQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Topic not found" });
    }
    res.status(200).json({ message: "Topic updated successfully" });
  } catch (error) {
    console.error("Error updating topic:", error);
    res.status(500).json({ error: "Edit Request Error" });
  } finally {
    pool.close();
  }
});

// DELETE endpoint
app.delete("/deleteTopic/:t_id", async (req, res) => {
  try {
    const userId = req.params.t_id;
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid topic ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("t_id", sql.Int, userId)
      .query(deleteQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Topic not found" });
    }
    res.status(200).json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).json({ error: "Delete Request Error" });
  } finally {
    pool.close();
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
