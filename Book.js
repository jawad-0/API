const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
const port = 2000;

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

const getQuery = "SELECT * FROM Book";

const postQuery =
  "INSERT INTO Book (title, author, price, publisher, images) VALUES (@title, @author, @price, @publisher, @images)";

const pool = new sql.ConnectionPool(config);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use("/uploads", express.static("uploads"));

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

app.post("/post", upload.array("images", 5), async (req, res) => {
  try {
    const { title, author, price, publisher } = req.body;

    let images = null;
    let imageNames = null;

    if (req.files && req.files.length > 0) {
      const fileData = req.files.map(file => ({
        data: file.buffer.toString("base64"),
        name: file.originalname,
      }));

      images = fileData.map(file => file.data).join(",");
      imageNames = fileData.map(file => file.name).join(",");
    }

    await pool.connect();
    const result = await pool.request()
      .input("title", sql.VarChar(255), title)
      .input("author", sql.VarChar(255), author)
      .input("price", sql.Int, price)
      .input("publisher", sql.VarChar(255), publisher)
      .input("images", sql.VarChar(sql.MAX), imageNames)
      .query(postQuery);

    res.status(201).send("Data inserted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Post Request Error");
  } finally {
    pool.close();
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
