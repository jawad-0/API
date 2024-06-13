const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
const port = 8000;

// Create MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "fyp",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

app.use(bodyParser.json());

// // ************************************************************************************ For DataCell Faculty ************************************************************************************ //

app.post("/login", (req, res) => {
  // To Login All Members
  const { username, password } = req.body;
  const query = "SELECT * FROM Faculty WHERE username = ? AND password = ?";
  connection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    if (results.length === 1) {
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

// To Add New Faculty Member
app.post("/addfaculty", (req, res) => {
  const { f_name, username, password } = req.body;
  const status = "enabled";
  const query =
    "INSERT INTO Faculty (f_name, username, password, status) VALUES (?, ?, ?, ?)";
  const values = [f_name, username, password, status];
  connection.query(query, values, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Faculty added successfully" });
  });
});

// To Get All of Faculty f_name and Username
app.get("/getfaculty", (req, res) => {
  // Fetch data from the MySQL table
  const query = "SELECT * FROM Faculty";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// To Update New Faculty Member
app.put("/editfaculty/:id", (req, res) => {
  const facultyId = req.params.id;
  const { f_name, username, password } = req.body;
  const query =
    "UPDATE Faculty SET f_name = ? , username = ? , password = ? WHERE f_id = ?";
  const values = [f_name, username, password, facultyId];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Faculty record not found" });
      return;
    }
    res.status(200).json({ message: "Faculty record updated successfully" });
  });
});

// To Enable/Disable Faculty Member
app.put("/enabledisablefaculty/:id", (req, res) => {
  const facultyId = req.params.id;
  const { status } = req.body;
  if (status !== "enable" && status !== "disable") {
    return res.status(400).json({
      error:
        'Invalid status value. Status must be either "enable" or "disable"',
    });
  }
  const query = "UPDATE Faculty SET status = ? WHERE f_id = ?";
  const values = [status, facultyId];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Faculty record not found" });
    }
    res.status(200).json({ message: "Faculty record updated successfully" });
  });
});

// To Delete Faculty Member
app.delete("/deletefaculty/:id", (req, res) => {
  const facultyId = req.params.id;
  const deleteQuery = "DELETE FROM Faculty WHERE f_id = ?";
  const updateQuery = "UPDATE Faculty SET f_id = f_id - 1 WHERE f_id > ?";
  connection.query(deleteQuery, [facultyId], (err, deleteResult) => {
    if (err) {
      console.error("Error executing the delete query:", err);
      connection.rollback(() => {
        res.status(500).json({ error: "Internal Server Error" });
      });
      return;
    }
    if (deleteResult.affectedRows === 0) {
      connection.rollback(() => {
        res.status(404).json({ error: "Faculty record not found" });
      });
      return;
    }
    connection.query(updateQuery, [facultyId], (err, updateResult) => {
      if (err) {
        console.error("Error executing the update query:", err);
        connection.rollback(() => {
          res.status(500).json({ error: "Internal Server Error" });
        });
        return;
      }
      res.status(200).json({ message: "Faculty record deleted successfully" });
    });
  });
});

// To Search Faculty Member
app.get("/searchfaculty", (req, res) => {
  const searchQuery = req.query.search;
  const query = "SELECT * FROM Faculty WHERE f_name LIKE ? OR username LIKE ?";
  const searchValue = `%${searchQuery}%`;
  connection.query(query, [searchValue, searchValue], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(result);
  });
});

// // ************************************************************************************ For DataCell Course ************************************************************************************ //

app.post("/addcourse", (req, res) => {
  const { c_code, c_title, cr_hours } = req.body;
  const query =
    "INSERT INTO Course (c_code, c_title, cr_hours) VALUES (?, ?, ?)";
  const values = [c_code, c_title, cr_hours];
  connection.query(query, values, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Course added successfully" });
  });
});

app.get("/getcourse", (req, res) => {
  // To Get All of Course
  // Fetch data from the MySQL table
  const query = "SELECT * FROM Course";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.json(results);
  });
});

app.put("/editcourse/:id", (req, res) => {
  // To Update Faculty Record on Basis of ID
  const courseId = req.params.id;

  const { c_code, c_title, cr_hours } = req.body;

  const query =
    "UPDATE Course SET c_code = ? , c_title = ? , cr_hours = ? WHERE c_id = ?";
  const values = [c_code, c_title, cr_hours, courseId];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Course record not found" });
      return;
    }
    res.status(200).json({ message: "Course record updated successfully" });
  });
});

app.put("/enabledisablecourse/:id", (req, res) => {
  // To Update Course Status on Basis of ID
  const courseId = req.params.id;
  const { status } = req.body; // Assuming status is passed in the request body

  // Ensure status is either 'enable' or 'disable'
  if (status !== "enable" && status !== "disable") {
    return res.status(400).json({
      error:
        'Invalid status value. Status must be either "enable" or "disable"',
    });
  }

  const query = "UPDATE Course SET status = ? WHERE c_id = ?";
  const values = [status, courseId];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Course record not found" });
    }
    res.status(200).json({ message: "Course record updated successfully" });
  });
});

app.delete("/deletecourse/:id", (req, res) => {
  // To Delete Course Record on Basis of ID // Use Only to test or if needed not a part of datacell module
  const courseId = req.params.id;

  const deleteQuery = "DELETE FROM Course WHERE c_id = ?";
  const updateQuery = "UPDATE Course SET c_id = c_id - 1 WHERE c_id > ?";

  connection.query(deleteQuery, [courseId], (err, deleteResult) => {
    if (err) {
      console.error("Error executing the delete query:", err);
      connection.rollback(() => {
        res.status(500).json({ error: "Internal Server Error" });
      });
      return;
    }

    if (deleteResult.affectedRows === 0) {
      connection.rollback(() => {
        res.status(404).json({ error: "Course record not found" });
      });
      return;
    }

    connection.query(updateQuery, [courseId], (err, updateResult) => {
      if (err) {
        console.error("Error executing the update query:", err);
        connection.rollback(() => {
          res.status(500).json({ error: "Internal Server Error" });
        });
        return;
      }

      res.status(200).json({ message: "Course record deleted successfully" });
    });
  });
});

app.get("/searchcourse", (req, res) => {
  // Search for Course on Basis of either c_code or c_title
  const searchQuery = req.query.q;

  const query = "SELECT * FROM Course WHERE c_code LIKE ? OR c_title LIKE ?";
  const searchValue = "%${searchQuery}%";

  connection.query(query, [searchValue, searchValue], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.status(200).json(result);
  });
});

// // ************************************************************************************ For DataCell Paper ************************************************************************************ //

app.get("/getprintedpapers", (req, res) => {
  // To Show Paper Who's Status is Printed
  const query = "SELECT * FROM Paper WHERE status = ?";
  const status = "Printed";

  connection.query(query, [status], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.status(200).json(result);
  });
});

app.put("/editapprovedpaperstatus/:id", (req, res) => {
  const paperId = req.params.id;

  const updateQuery = "UPDATE paper SET status = ? WHERE p_id = ?";
  const status = req.body.status === "Print" ? "Printed" : req.body.status;

  connection.query(updateQuery, [status, paperId], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Paper not found" });
      return;
    }

    res.status(200).json({ message: "Paper status updated successfully" });
  });
});

app.get("/getapprovedpapers", (req, res) => {
  // To Get All of Course
  // Fetch data from the MySQL table
  const query = "SELECT * FROM Paper";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Listening on Port Yah Yuu${port}`);
});
