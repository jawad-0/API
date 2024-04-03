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
// getGridViewWeightage
// addGridViewWeightage
// editGridViewWeighatage/:clo_id/:header_id
// deleteGridViewWeightage/:clo_id/:header_id

const getQuery = "SELECT * FROM Grid_View_Weightage";

const postQuery =
  "INSERT INTO Grid_View_Weightage (clo_id, header_id, weightage) VALUES (@clo_id, @header_id, @weightage)";

const editQuery =
  "UPDATE Grid_View_Weightage SET weightage = @weightage WHERE clo_id = @clo_id AND header_id = @header_id";

const deleteQuery = "DELETE FROM Grid_View_Weightage WHERE clo_id = @clo_id AND header_id = @header_id";

const pool = new sql.ConnectionPool(config);

app.use(express.json());

// GET endpoint
app.get("/getGridViewWeightage", async (req, res) => {
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
app.post("/addGridViewWeightage", async (req, res) => {
  try {
    const { clo_id, header_id, weightage } = req.body;
    console.log("Data received:", { clo_id, header_id, weightage });
    await pool.connect();
    await pool
      .request()
      .input("clo_id", sql.Int, clo_id)
      .input("header_id", sql.Int, header_id)
      .input("weightage", sql.Int, weightage)
      .query(postQuery);
    res.status(200).json({ message: "Grid_View_Weightage inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Post Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT endpoint
app.put("/editGridViewWeightage/:clo_id/:header_id", async (req, res) => {
  try {
    const clo_id = req.params.clo_id;
    const header_id = req.params.header_id;
    const { weightage } = req.body;
    if (!/^\d+$/.test(clo_id)) {
      return res.status(400).json({ error: "Invalid Grid_View_Weightage ID" });
    }
    await pool.connect();
    const result = await pool
      .request()
      .input("clo_id", sql.Int, clo_id)
      .input("header_id", sql.Int, header_id)
      .input("weightage", sql.Int, weightage)
      .query(editQuery);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Grid_View_Weightage not found" });
    }
    res.status(200).json({ message: "Grid_View_Weightage updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Edit Request Error" });
  } finally {
    pool.close();
  }
});

// DELETE endpoint
app.delete("/deleteGridViewWeightage/:clo_id/:header_id", async (req, res) => {
  try {
    const clo_id = req.params.clo_id;
    const header_id = req.params.header_id;

    if (!/^\d+$/.test(clo_id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    await pool.connect();

    const result = await pool
      .request()
      .input("clo_id", sql.Int, clo_id)
      .input("header_id", sql.Int, header_id)
      .query(deleteQuery);

      if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Grid_View_Weightage not found" });
    }
    res.status(200).json({ message: "Grid_View_Weightage deleted successfully" });
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
