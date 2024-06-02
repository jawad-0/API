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
  const query =
    "SELECT p.*, c.c_id, c.c_code, c.c_title FROM Paper p JOIN Course c ON p.c_id = c.c_id WHERE p_id = ?";
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
  const query =
    "SELECT f.f_id, f.f_name FROM faculty f JOIN assigned_course ac ON f.f_id = ac.f_id JOIN course c ON ac.c_id = c.c_id WHERE c.c_id = ?";
  connection.query(query, [courseId], (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(result);
  });
});

paperRouter.get("/getPapers/:c_id", (req, res) => {
  const { c_id } = req.params;
  const sessionQuery = "SELECT s_id FROM Session WHERE flag = 'active'";
  connection.query(sessionQuery, (err, sessionResult) => {
    if (err) {
      console.error("Error executing the session query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (sessionResult.length === 0) {
      res.status(404).json({ error: "No active session found" });
      return;
    }
    const { s_id } = sessionResult[0];
    const papersQuery = "SELECT * FROM Paper WHERE s_id = ? AND c_id = ?";
    connection.query(papersQuery, [s_id, c_id], (err, result) => {
      if (err) {
        console.error("Error executing the papers query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });
});

// To Add New Paper
paperRouter.post("/addPaper", (req, res) => {
  const { degree, exam_date, duration, term, c_id } = req.body;
  const status = "pending";
  const sessionQuery =
    "SELECT s_id, s_name, year FROM Session WHERE flag = 'active'";
  connection.query(sessionQuery, (err, sessionResult) => {
    if (err) {
      console.error("Error executing the session query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (sessionResult.length === 0) {
      res.status(404).json({ error: "No active session found" });
      return;
    }
    const { s_id, s_name, year } = sessionResult[0];
    const checkTermQuery =
      "SELECT * FROM Paper WHERE term = ? AND c_id = ? AND s_id = ?";
    connection.query(
      checkTermQuery,
      [term.toLowerCase(), c_id, s_id],
      (err, existingPapers) => {
        if (err) {
          console.error("Error executing the check query:", err);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
        if (existingPapers.length > 0) {
          res.status(400).json({
            error: `${term} term paper for this course already exists`
          });
          return;
        }
        const insertQuery = `
          INSERT INTO Paper (degree, exam_date, duration, term, status, session, year, c_id, s_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          degree,
          exam_date,
          duration,
          term,
          status,
          s_name,
          year,
          c_id,
          s_id
        ];

        connection.query(insertQuery, values, (err) => {
          if (err) {
            console.error("Error executing the insert query:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
          }

          res.status(200).json({ message: "Paper added successfully" });
        });
      }
    );
  });
});

// To Edit Paper
paperRouter.put("/editPaper/:id", (req, res) => {
  const paperID = req.params.id;
  const { degree, exam_date, duration } = req.body;
  const checkPaperQuery = "SELECT * FROM Paper WHERE p_id = ?";
  connection.query(checkPaperQuery, [paperID], (err, existingPaper) => {
    if (err) {
      console.error("Error executing the check query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (existingPaper.length === 0) {
      res.status(404).json({ error: "Paper not found" });
      return;
    }
    const updateQuery =
      "UPDATE Paper SET degree = ?, exam_date = ?, duration = ? WHERE p_id = ?";
    const values = [degree, exam_date, duration, paperID];
    connection.query(updateQuery, values, (err) => {
      if (err) {
        console.error("Error executing the update query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json({ message: "Paper updated successfully" });
    });
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
  const searchQuery = req.query.search;
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
