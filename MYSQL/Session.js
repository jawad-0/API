const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const sessionRouter = express.Router();
const connection = require("./database");
sessionRouter.use(bodyParser.json());

// Routes >>>
// GET  -> getSession
// POST -> addsession
// PUT  -> editsession/:s_id
// PUT  -> enabledisablesession/:s_id

// GET endpoint
sessionRouter.get("/getSession", (req, res) => {
  const query = "SELECT * FROM Session";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// POST endpoint
sessionRouter.post("/addsession", (req, res) => {
  const { s_name, year } = req.body;
  const status = "inactive";
  const query = "INSERT INTO Session (s_name, year, flag) VALUES (?, ?, ?)";
  const values = [s_name, year, status];
  connection.query(query, values, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Session added successfully" });
  });
});

// PUT endpoint
sessionRouter.put("/editsession/:s_id", (req, res) => {
  const sessionId = req.params.s_id;
  const { s_name, year } = req.body;
  const query = "UPDATE Session SET s_name = ? , year = ? WHERE s_id = ?";
  const values = [s_name, year, sessionId];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Session record not found" });
      return;
    }
    res.status(200).json({ message: "Session record updated successfully" });
  });
});

// PUT endpoint
sessionRouter.put("/enabledisablesession/:s_id", (req, res) => {
  const sessionId = req.params.s_id;
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }
  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    const activateSessionQuery =
      "UPDATE Session SET flag = 'active' WHERE s_id = ?";
    connection.query(activateSessionQuery, [sessionId], (err, result) => {
      if (err) {
        console.error("Error activating session:", err);
        return connection.rollback(() => {
          res.status(500).json({ error: "Internal Server Error" });
        });
      }
      if (result.affectedRows === 0) {
        return connection.rollback(() => {
          res.status(404).json({ error: "Session record not found" });
        });
      }
      const deactivateOtherSessionsQuery =
        "UPDATE Session SET flag = 'inactive' WHERE s_id != ?";
      connection.query(
        deactivateOtherSessionsQuery,
        [sessionId],
        (err, result) => {
          if (err) {
            console.error("Error deactivating other sessions:", err);
            return connection.rollback(() => {
              res.status(500).json({ error: "Internal Server Error" });
            });
          }
          connection.commit((err) => {
            if (err) {
              console.error("Error committing transaction:", err);
              return connection.rollback(() => {
                res.status(500).json({ error: "Internal Server Error" });
              });
            }
            res
              .status(200)
              .json({ message: "Session status updated successfully" });
          });
        }
      );
    });
  });
});

module.exports = sessionRouter;
