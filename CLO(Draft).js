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

const getQuery = "SELECT * FROM CLO";

const postQuery =
  "INSERT INTO CLO (clo_id, clo_1, clo_2, clo_3, clo_4, c_id) VALUES (@clo_id, @clo_1, @clo_2, @clo_3, @clo_4, @c_id)";

const editQuery =
  "UPDATE CLO SET clo_1 = @clo_1, clo_2 = @clo_2, clo_3 = @clo_3, clo_4 = @clo_4 WHERE clo_id = @clo_id";

const deleteQuery = "DELETE FROM CLO WHERE clo_id = @clo_id";

const pool = new sql.ConnectionPool(config);

app.use(express.json());

// GET endpoint
app.get("/get", async (req, res) => {
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
app.post("/post", async (req, res) => {
  try {
    const { clo_id, clo_1, clo_2, clo_3, clo_4, c_id } = req.body;
    console.log("Data received:", { clo_id, clo_1, clo_2, clo_3, clo_4, c_id });
    await pool.connect();
    await pool
      .request()
      .input("clo_id", sql.Int, clo_id)
      .input("clo_1", sql.NVarChar(255), clo_1)
      .input("clo_2", sql.NVarChar(255), clo_2)
      .input("clo_3", sql.NVarChar(255), clo_3)
      .input("clo_4", sql.NVarChar(255), clo_4)
      .input("c_id", sql.Int, c_id)
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
app.put("/edit/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { clo_1, clo_2, clo_3, clo_4, c_id } = req.body;

    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid CLO ID" });
    }
    await pool.connect();

    const result = await pool
      .request()
      .input("clo_id", sql.Int, userId)
      .input("clo_1", sql.NVarChar(255), clo_1)
      .input("clo_2", sql.NVarChar(255), clo_2)
      .input("clo_3", sql.NVarChar(255), clo_3)
      .input("clo_4", sql.NVarChar(255), clo_4)
      .input("c_id", sql.Int, c_id)
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

// DELETE endpoint
app.delete("/delete/:id", async (req, res) => {
  try {
    const userId = req.params.id;

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
