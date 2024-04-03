const express = require("express");
const sql = require("mssql");
const bodyParser = require('body-parser');

const app = express();
const port = 8000;
app.use(bodyParser.json());

const config = {
  user: "sa",
  password: "admin123",
  server: "127.0.0.1",
  database: "WEB_API_TEST",
  options: {
    encrypt: false,
  },
};

// Example SQL query for GET
const getQuery = "SELECT * FROM techs";

// Example SQL query for POST
const postQuery = "INSERT INTO techs (id, name, code) VALUES (@id, @name, @code)";

app.use(express.json()); // Parse JSON bodies

// GET endpoint
app.get("/get", async (req, res) => {
  try {
    // Connect to the database
    await sql.connect(config);

    // Execute the GET query
    const result = await sql.query(getQuery);

    // Send the result as JSON
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get Request Error");
  } finally {
    sql.close();
  }
});

app.post('/post', async (req, res) => {
    try {
      await sql.connect(config);
      const result = await sql.query(postQuery, {
        id: sql.Int,
        name: sql.VarChar(255),
        code: sql.Int,
      });
      res.status(201).send('Data inserted successfully');
    } catch (err) {
      console.error(err);
      res.status(500).send('Post Request Error');
    } finally {
      sql.close();
    }
  });

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.post("/post", async (req, res) => {
    try {
      const { title, author, price, publisher } = req.body;
      await pool.connect();
      await pool
        .request()
        .input("title", sql.NVarChar(255), title)
        .input("author", sql.NVarChar(255), author)
        .input("price", sql.Int, price)
        .input("publisher", sql.NVarChar(255), publisher)
        .query(postQuery);
      res.status(200).json({ message: "Data inserted successfully" });
    } catch (error) {
      console.error("Error inserting data:", error);
      res.status(500).json({ error: "Post Request Error" });
    } finally {
      pool.close();
    }
  });
