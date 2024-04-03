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
  database: "WEB_API_TEST",
  options: {
    encrypt: false,
  },
};

const getQuery = "SELECT * FROM Album";

const postQuery = "INSERT INTO Album (u_id, photos) VALUES (@u_id, @photos)";

const deleteQuery = "DELETE FROM Album WHERE u_id = @u_id";

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

// // POST endpoint
// app.post("/post", async (req, res) => {
//   try {
//     const { id, image } = req.body;
//     console.log("Data received:", { id, image });
//     await pool.connect();
//     await pool
//       .request()
//       .input("u_id", sql.Int, id)
//       .input("photos", sql.NVarChar(255), image)
//       .query(postQuery);
//     res.status(200).json({ message: "UserData inserted successfully" });
//   } catch (error) {
//     console.error("Error inserting data:", error);
//     res.status(500).json({ error: "Post Request Error" });
//   } finally {
//     pool.close();
//   }
// });

// POST endpoint
app.post("/post", async (req, res) => {
  try {
    const userData = req.body;
    if (!Array.isArray(userData)) {
      return res.status(400).json({ error: "Invalid request payload" });
    }
    for (const { id, images } of userData) {
      console.log("Data received:", { id, images });
      if (!Array.isArray(images)) {
        return res.status(400).json({ error: "Invalid images array" });
      }
      await pool.connect();
      const imagesString = JSON.stringify(images);
      await pool
        .request()
        .input("u_id", sql.Int, id)
        .input("photos", sql.NVarChar(sql.MAX), imagesString)
        .query(postQuery);
    }
    res.status(200).json({ message: "UserData inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Post Request Error" });
  } finally {
    pool.close();
  }
});

// DELETE endpoint
app.delete("/delete/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid UserData ID" });
    }
    await pool.connect();

    const result = await pool
      .request()
      .input("c_id", sql.Int, userId)
      .query(deleteQuery);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "UserData not found" });
    }
    res.status(200).json({ message: "UserData deleted successfully" });
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
