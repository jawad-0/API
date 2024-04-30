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
// getGridViewHeaders
// addGridViewHeaders
// editGridViewHeader/:header_id
// deleteGridViewHeader/:header_id

const getQuery = "SELECT * FROM Grid_View_Headers";

const postQuery =
  "INSERT INTO Grid_View_Headers (header_id, name) VALUES (@header_id, @name)";

const editQuery =
  "UPDATE Grid_View_Headers SET name = @name WHERE header_id = @header_id";

const deleteQuery = "DELETE FROM Grid_View_Headers WHERE header_id = @header_id";

const pool = new sql.ConnectionPool(config);

app.use(express.json());

// GET endpoint
app.get("/getGridViewHeaders", async (req, res) => {
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
app.post("/addGridViewHeaders", async (req, res) => {
  try {
    const { header_id, name } = req.body;
    console.log("Data received:", { header_id, name });
    await pool.connect();
    await pool
      .request()
      .input("header_id", sql.Int, header_id)
      .input("name", sql.NVarChar(255), name)
      .query(postQuery);
    res.status(200).json({ message: "Grid_View_Headers inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Post Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT endpoint
app.put("/editGridViewHeader/:header_id", async (req, res) => {
  try {
    const userId = req.params.header_id;
    const { name } = req.body;

    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid Grid_View_Headers ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("header_id", sql.Int, userId)
      .input("name", sql.NVarChar(255), name)
      .query(editQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Grid_View_Headers not found" });
    }
    res.status(200).json({ message: "Grid_View_Headers updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Edit Request Error" });
  } finally {
    pool.close();
  }
});

// DELETE endpoint
app.delete("/deleteGridViewHeader/:header_id", async (req, res) => {
  try {
    const userId = req.params.header_id;

    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    await pool.connect();

    const result = await pool
      .request()
      .input("header_id", sql.Int, userId)
      .query(deleteQuery);

      if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Grid_View_Headers not found" });
    }
    res.status(200).json({ message: "Grid_View_Headers deleted successfully" });
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
