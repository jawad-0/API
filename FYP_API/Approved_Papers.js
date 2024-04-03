const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");

const app = express();
const port = 1000;

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

// FOR DATACELL SIDE >>
// getApprovedPapers
// searchApprovedPapers
// editApprovedPapersStatus/:p_id

const getQuery = "SELECT p_id, p_name FROM Paper WHERE status = 'approved'";

const searchApprovedPapersQuery =
  "SELECT p_name FROM Paper WHERE p_name LIKE @searchQuery AND status = 'approved'";

const editStatusQuery = "UPDATE Paper SET status = @status WHERE p_id = @p_id";

const pool = new sql.ConnectionPool(config);

app.use(express.json());

// GET endpoint
app.get("/getApprovedPapers", async (req, res) => {
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

// SEARCH endpoint
app.get("/searchApprovedPapers", async (req, res) => {
  try {
    const searchQuery = req.query.search;
    if (!searchQuery) {
      return res.status(400).json({ error: "Missing search query parameter" });
    }
    await pool.connect();
    const searchResult = await pool
      .request()
      .input("searchQuery", sql.NVarChar(255), `%${searchQuery}%`)
      .query(searchApprovedPapersQuery);
    res.json(searchResult.recordset);
  } catch (error) {
    console.error("Error searching faculty:", error);
    res.status(500).json({ error: "Search Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT STATUS endpoint
app.put("/editApprovedPapersStatus/:p_id", async (req, res) => {
  try {
    const userId = req.params.p_id;
    const newStatus = "printed";
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid paper ID" });
    }
    await pool.connect();
    const updateResult = await pool
      .request()
      .input("p_id", sql.Int, userId)
      .input("status", sql.NVarChar(255), newStatus)
      .query(editStatusQuery);
    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Paper not found" });
    }
    res
      .status(200)
      .json({ message: "Paper status updated successfully", newStatus });
  } catch (error) {
    console.error("Error updating paper status:", error);
    res.status(500).json({ error: "Edit Status Request Error" });
  } finally {
    pool.close();
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
