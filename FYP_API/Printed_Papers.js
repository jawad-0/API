const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");

const app = express();
const port = 1001;

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
// getPrintedPapers
// searchPrintedPapers

const getQuery = "SELECT p_name FROM Paper WHERE status = 'printed'";

const searchPrintedPapersQuery = "SELECT p_name FROM Paper WHERE p_name LIKE @searchQuery AND status = 'printed'";

const pool = new sql.ConnectionPool(config);

app.use(express.json());

// GET endpoint
app.get("/getPrintedPapers", async (req, res) => {
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
app.get("/searchPrintedPapers", async (req, res) => {
  try {
    const searchQuery = req.query.search;
    if (!searchQuery) {
      return res.status(400).json({ error: "Missing search query parameter" });
    }
    await pool.connect();
    const searchResult = await pool
      .request()
      .input("searchQuery", sql.NVarChar(255), `%${searchQuery}%`)
      .query(searchPrintedPapersQuery);
    res.json(searchResult.recordset);
  } catch (error) {
    console.error("Error searching faculty:", error);
    res.status(500).json({ error: "Search Request Error" });
  } finally {
    pool.close();
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
