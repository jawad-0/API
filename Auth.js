const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");

const app = express();
const port = 8000;

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

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
const getFaculty = "SELECT * FROM Users";
const getCourse = "SELECT * FROM Course";
// Example SQL query for POST
const postQuery =
  "INSERT INTO Users (name, username, password) VALUES (@name, @username, @password)";

// Example SQL query for EDIT
const editQuery =
  "UPDATE Users SET name = @name, username = @username, password = @password WHERE id = @id";

// Example SQL query for DELETE
const deleteQuery = "DELETE FROM Users WHERE id = @id";

// Use a connection pool
const pool = new sql.ConnectionPool(config);

app.use(express.json()); // Parse JSON bodies

// GET endpoint
app.get("/getFaculty", async (req, res) => {
  try {
    // Connect to the database using the pool
    await pool.connect();

    // Execute the GET query
    const result = await pool.request().query(getFaculty);

    // Send the result as JSON
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Get Request Error");
  } finally {
    // Release the connection back to the pool
    pool.close();
  }
});

app.post("/postFaculty", async (req, res) => {
  try {
    const { name, username, password } = req.body;
    console.log({name, username, password});
    await pool.connect();
    await pool
      .request()
      .input("name", sql.NVarChar(255), name)
      .input("username", sql.NVarChar(255), username)
      .input("password", sql.NVarChar(255), password)
      .query(postQuery);
    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Post Request Error" });
  } finally {
    pool.close();
  }
});

// EDIT endpoint
app.put("/editFaculty/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, username, password } = req.body;

    // Validate that userId is a positive integer
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    await pool.connect();

    // Execute the EDIT query
    const result = await pool
      .request()
      .input("id", sql.Int, userId)
      .input("name", sql.NVarChar(255), name)
      .input("username", sql.NVarChar(255), username)
      .input("password", sql.NVarChar(255), password)
      .query(editQuery);

    // Check if any rows were affected
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Edit Request Error" });
  } finally {
    pool.close();
  }
});

// DELETE endpoint
app.delete("/deleteFacukty/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    // Validate that userId is a positive integer
    if (!/^\d+$/.test(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    await pool.connect();
    // Execute the DELETE query
    const result = await pool
      .request()
      .input("id", sql.Int, userId)
      .query(deleteQuery);
    // Check if any rows were affected
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Delete Request Error" });
  } finally {
    pool.close();
  }
});

// GET endpoint
app.get("/getCourse", async (req, res) => {
    try {
      // Connect to the database using the pool
      await pool.connect();

      // Execute the GET query
      const result = await pool.request().query(getCourse);

      // Send the result as JSON
      res.json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).send("Get Request Error");
    } finally {
      // Release the connection back to the pool
      pool.close();
    }
  });

  app.post("/postCourse", async (req, res) => {
    try {
      const { name, username, password } = req.body;
      console.log({name, username, password});
      await pool.connect();
      await pool
        .request()
        .input("name", sql.NVarChar(255), name)
        .input("username", sql.NVarChar(255), username)
        .input("password", sql.NVarChar(255), password)
        .query(postQuery);
      res.status(200).json({ message: "Data inserted successfully" });
    } catch (error) {
      console.error("Error inserting data:", error);
      res.status(500).json({ error: "Post Request Error" });
    } finally {
      pool.close();
    }
  });

  // EDIT endpoint
  app.put("/editCourse/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const { name, username, password } = req.body;

      // Validate that userId is a positive integer
      if (!/^\d+$/.test(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      await pool.connect();

      // Execute the EDIT query
      const result = await pool
        .request()
        .input("id", sql.Int, userId)
        .input("name", sql.NVarChar(255), name)
        .input("username", sql.NVarChar(255), username)
        .input("password", sql.NVarChar(255), password)
        .query(editQuery);

      // Check if any rows were affected
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Edit Request Error" });
    } finally {
      pool.close();
    }
  });

  // DELETE endpoint
  app.delete("/deleteCourse/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      // Validate that userId is a positive integer
      if (!/^\d+$/.test(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      await pool.connect();
      // Execute the DELETE query
      const result = await pool
        .request()
        .input("id", sql.Int, userId)
        .query(deleteQuery);
      // Check if any rows were affected
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
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
