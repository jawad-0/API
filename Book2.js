const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");

const app = express();
const port = 8000;

app.use(bodyParser.json());

const config = {
  user: "sa",
  password: "admin123",
  server: "127.0.0.1",
  database: "BookDB",
  options: {
    encrypt: false,
  },
};

const getQuery = "SELECT * FROM Book";

const postQuery =
  "INSERT INTO Book (title, author, price, publisher) VALUES (@title, @author, @price, @publisher)";

const pool = new sql.ConnectionPool(config);

app.use(express.json());

app.get("/getbook", async (req, res) => {
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

app.post('/post', async (req, res) => {
    try {
    //   const { title, author, price, publisher } = req.body;
      const { title, author, price, publisher } = req.query;
      await pool.connect();
      const result = await pool.request()
        .input('title', sql.VarChar(255), title)
        .input('author', sql.VarChar(255), author)
        .input('price', sql.Int, price)
        .input('publisher', sql.VarChar(255), publisher)
        .query(postQuery);
      res.status(201).send('Data inserted successfully');
    } catch (err) {
      console.error(err);
      res.status(500).send('Post Request Error');
    } finally {
      pool.close();
    }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
