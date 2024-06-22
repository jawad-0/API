const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const paperRouter = express.Router();
const connection = require("./database");
paperRouter.use(bodyParser.json());

// Routes >>>
// GET  -> getPapers/:c_id
// GET  -> getpaperheader/:p_id
// GET  -> getpaperheaderfaculty/:c_id
// GET  -> getNumberOfQuestions/:p_id
// POST -> addPaper
// PUT  -> editPaper/:p_id
// PUT  -> editpendingpaperstatus/:p_id
// PUT  -> edituploadedpaperstatus/:p_id
// PUT  -> editapprovedpaperstatus/:p_id
// GET  -> getapprovedpapers
// GET  -> searchapprovedpapers
// GET  -> getpendingpapers
// GET  -> searchpendingpapers
// GET  -> getuploadedpapers
// GET  -> searchuploadedpapers
// GET  -> getprintedpapers
// GET  -> searchprintedpapers
// GET -> searchpapershistory

// GET endpoint
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

// GET endpoint
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

// GET endpoint
paperRouter.get("/getpaperheaderfaculty/:c_id", (req, res) => {
  const courseId = req.params.c_id;
  if (!/^\d+$/.test(courseId)) {
    return res.status(400).json({ error: "Invalid course ID" });
  }
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
    // const query = "SELECT f_name FROM faculty f JOIN assigned_course ac ON f.f_id = ac.f_id JOIN course c ON ac.c_id = c.c_id JOIN paper p ON p.c_id = c.c_id WHERE p.p_id = ?";
    const query =
      "SELECT f.f_id, f.f_name FROM faculty f JOIN assigned_course ac ON f.f_id = ac.f_id JOIN course c ON ac.c_id = c.c_id WHERE c.c_id = ? AND ac.s_id = ?";
    connection.query(query, [courseId, s_id], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });
});

// GET endpoint
paperRouter.get("/getNumberOfQuestions/:p_id", (req, res) => {
  const paperId = req.params.p_id;
  if (!/^\d+$/.test(paperId)) {
    return res.status(400).json({ error: "Invalid paper ID" });
  }
  const query = "SELECT no_of_questions FROM Paper WHERE p_id = ?";
  connection.query(query, [paperId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// POST endpoint
paperRouter.post("/addPaper", (req, res) => {
  const { degree, exam_date, duration, term, no_of_questions, c_id } = req.body;
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
          INSERT INTO Paper (degree, exam_date, duration, term, no_of_questions, status, session, year, c_id, s_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          degree,
          exam_date,
          duration,
          term,
          no_of_questions,
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

// PUT endpoint
paperRouter.put("/editPaper/:p_id", (req, res) => {
  const paperID = req.params.p_id;
  const { degree, exam_date, duration, no_of_questions } = req.body;
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
      "UPDATE Paper SET degree = ?, exam_date = ?, duration = ?, no_of_questions = ? WHERE p_id = ?";
    const values = [degree, exam_date, duration, no_of_questions, paperID];
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

// PUT endpoint
paperRouter.put("/editpendingpaperstatus/:p_id", (req, res) => {
  const paperId = req.params.p_id;

  const updateQuery = "UPDATE Paper SET status = ? WHERE p_id = ?";
  const status = "uploaded";
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

// PUT endpoint
paperRouter.put("/edituploadedpaperstatus/:p_id", (req, res) => {
  const paperId = req.params.p_id;

  const updateQuery = "UPDATE Paper SET status = ? WHERE p_id = ?";
  const status = "approved";
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

// PUT endpoint
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

// GET endpoint
paperRouter.get("/getapprovedpapers", (req, res) => {
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
    const { s_id } = sessionResult[0];
    const query =
      "SELECT p.*, c.c_title, c.c_code FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE p.status = ? AND p.s_id = ?";
    const status = "approved";
    connection.query(query, [status, s_id], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });
});

// GET endpoint
paperRouter.get("/searchapprovedpapers", (req, res) => {
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
    const { s_id } = sessionResult[0];
    const searchQuery = req.query.search;
    const query =
      "SELECT p.*, c.c_title, c.c_code FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE c.c_title LIKE ? AND p.status = 'approved' AND p.s_id = ?";
    const searchValue = `%${searchQuery}%`;
    connection.query(query, [searchValue, s_id], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });
});

// GET endpoint
paperRouter.get("/getpendingpapers", (req, res) => {
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
    const { s_id } = sessionResult[0];
    const query =
      "SELECT p.*, c.c_title, c.c_code FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE p.status = ? AND p.s_id = ?";
    const status = "pending";
    connection.query(query, [status, s_id], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });
});

// GET endpoint
paperRouter.get("/searchpendingpapers", (req, res) => {
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
    const { s_id } = sessionResult[0];
    const searchQuery = req.query.search;
    const query =
      "SELECT p.*, c.c_title, c.c_code FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE c.c_title LIKE ? AND p.status = 'pending' AND p.s_id = ?";
    const searchValue = `%${searchQuery}%`;
    connection.query(query, [searchValue, s_id], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });
});

// GET endpoint
paperRouter.get("/getuploadedpapers", (req, res) => {
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
    const { s_id } = sessionResult[0];
    const query =
      "SELECT p.*, c.c_title, c.c_code FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE p.status = ? AND p.s_id = ?";
    const status = "uploaded";
    connection.query(query, [status, s_id], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });
});

// GET endpoint
paperRouter.get("/searchuploadedpapers", (req, res) => {
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
    const { s_id } = sessionResult[0];
    const searchQuery = req.query.search;
    const query =
      "SELECT p.*, c.c_title, c.c_code FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE c.c_title LIKE ? AND p.status = 'uploaded' AND p.s_id = ?";
    const searchValue = `%${searchQuery}%`;
    connection.query(query, [searchValue, s_id], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });
});

// GET endpoint
paperRouter.get("/getprintedpapers", (req, res) => {
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
    const { s_id } = sessionResult[0];
    const query =
      "SELECT p.*, c.* FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE p.status = ? AND p.s_id = ?";
    const status = "printed";
    connection.query(query, [status, s_id], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });
});

// GET endpoint
paperRouter.get("/searchprintedpapers", (req, res) => {
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
    const { s_id } = sessionResult[0];
    const searchQuery = req.query.search;
    const query =
      "SELECT p.*, c.* FROM Paper p INNER JOIN Course c ON p.c_id = c.c_id WHERE c.c_title LIKE ? AND p.status = 'printed' AND p.s_id = ?";
    const searchValue = `%${searchQuery}%`;
    connection.query(query, [searchValue, s_id], (err, result) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json(result);
    });
  });
});

// GET Endpoint
paperRouter.get("/searchpapershistory", (req, res) => {
  const year = req.query.year;
  const session = req.query.session;
  const term = req.query.term;
  console.log(`Received query parameters - Year: ${year}, Session: ${session}, Term: ${term}`);

  let query = `SELECT p.*, c.c_id, c.c_code, c.c_title FROM Paper p JOIN Course c ON p.c_id = c.c_id WHERE p.status = 'printed'`;
  let params = [];
  if (year) {
    query += ` AND year = ?`;
    params.push(year);
  }
  if (session) {
    query += ` AND session = ?`;
    params.push(session);
  }
  if (term) {
    query += ` AND term = ?`;
    params.push(term);
  }
  connection.query(query, params, (error, results, fields) => {
    if (error) {
      console.error("Error executing query: " + error);
      res.status(500).send("Error executing query.");
      return;
    }
    if (results.length === 0) {
      res.status(404).send("No papers found matching the criteria.");
      return;
    }
    res.json(results);
  });
});

module.exports = paperRouter;
