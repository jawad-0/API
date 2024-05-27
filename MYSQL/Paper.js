const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const paperRouter = express.Router();
const connection = require("./database");

paperRouter.get("/getpaperheader/:p_id", (req, res) => {
  const paperId = req.params.p_id;
  if (!/^\d+$/.test(paperId)) {
    return res.status(400).json({ error: "Invalid paper ID" });
  }
  const query = "SELECT p.*, c.c_id, c.c_code, c.c_title FROM Paper p JOIN Course c ON p.c_id = c.c_id WHERE p_id = ?";
  connection.query(query, [paperId], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(result);
  });
});

paperRouter.get("/getpaperheaderfaculty/:c_id", (req, res) => {
    const courseId = req.params.c_id;
    if (!/^\d+$/.test(courseId)) {
      return res.status(400).json({ error: "Invalid paper ID" });
    }
    // const query = "SELECT f_name FROM faculty f JOIN assigned_course ac ON f.f_id = ac.f_id JOIN course c ON ac.c_id = c.c_id JOIN paper p ON p.c_id = c.c_id WHERE p.p_id = ?";
    const query = "SELECT f.f_id, f.f_name FROM faculty f JOIN assigned_course ac ON f.f_id = ac.f_id JOIN course c ON ac.c_id = c.c_id WHERE c.c_id = ?";
    connection.query(query, [courseId], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });

paperRouter.get("/getapprovedpapers", (req, res) => {
  const query =
    "SELECT p.*, c.c_title, c.c_code FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE p.status = ?";
  const status = "approved";
  connection.query(query, [status], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(result);
  });
});

paperRouter.get("/searchapprovedpapers", (req, res) => {
  const searchQuery = req.query.search.toLowerCase();
  const query =
    "SELECT p.*, c.c_title, c.c_code FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE c.c_title LIKE ? AND p.status = 'approved'";
  const searchValue = `%${searchQuery}%`;
  connection.query(query, [searchValue], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(result);
  });
});

paperRouter.get("/getpendingpapers", (req, res) => {
  const query =
    "SELECT p.*, c.c_title, c.c_code FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE p.status = ?";
  const status = "pending";
  connection.query(query, [status], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(result);
  });
});

paperRouter.get("/searchpendingpapers", (req, res) => {
  const searchQuery = req.query.search;
  const query =
    "SELECT p.*, c.c_title, c.c_code FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE c.c_title LIKE ? AND p.status = 'pending'";
  const searchValue = `%${searchQuery}%`;
  connection.query(query, [searchValue], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(result);
  });
});

paperRouter.get("/getuploadedpapers", (req, res) => {
    const query =
      "SELECT p.*, c.c_title, c.c_code FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE p.status = ?";
    const status = "uploaded";
    connection.query(query, [status], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });

  paperRouter.get("/searchuploadedpapers", (req, res) => {
    const searchQuery = req.query.search;
    const query =
      "SELECT p.*, c.c_title, c.c_code FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE c.c_title LIKE ? AND p.status = 'uploaded'";
    const searchValue = `%${searchQuery}%`;
    connection.query(query, [searchValue], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });

paperRouter.put("/editapprovedpaperstatus/:p_id", (req, res) => {
  const paperId = req.params.p_id;

  const updateQuery = "UPDATE Paper SET status = ? WHERE p_id = ?";
  const status = "printed";
  //   const status = req.body.status === "Print" ? "Printed" : req.body.status;
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

paperRouter.get("/getprintedpapers", (req, res) => {
  const query =
    "SELECT Paper.*, Course.* FROM Paper INNER JOIN Course ON Paper.c_id = Course.c_id WHERE Paper.status = ?";
  const status = "printed";
  connection.query(query, [status], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(result);
  });
});

paperRouter.get("/searchprintedpapers", (req, res) => {
  const searchQuery = req.query.search;
  const query =
    "SELECT Paper.*, Course.* FROM Paper INNER JOIN Course ON Paper.c_id = Course.c_id WHERE Course.c_title LIKE ? AND Paper.status = 'printed'";
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

module.exports = paperRouter;
