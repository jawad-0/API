const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const difficultyRouter = express.Router();
const connection = require("./database");
difficultyRouter.use(bodyParser.json());

// To Get Difficulty Record
difficultyRouter.get("/getdifficulty", (req, res) => {
    const query = "SELECT * FROM Difficulty";

    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.json(results);
    });
  });

// To Save New Difficulty Record
difficultyRouter.post("/savedifficulty", (req, res) => {
  const { easy, medium, hard } = req.body;

  if (easy == null || medium == null || hard == null) {
    return res.status(400).json({
      error: "Please provide values for easy, medium, and hard difficulties"
    });
  }
  connection.beginTransaction((err) => {
    if (err) {
      console.error("Error starting the transaction:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const queries = [
      {
        query: "UPDATE Difficulty SET number = ? WHERE difficulty = 'easy'",
        value: easy
      },
      {
        query: "UPDATE Difficulty SET number = ? WHERE difficulty = 'medium'",
        value: medium
      },
      {
        query: "UPDATE Difficulty SET number = ? WHERE difficulty = 'hard'",
        value: hard
      }
    ];
    let queryIndex = 0;
    const executeQuery = () => {
      if (queryIndex < queries.length) {
        const currentQuery = queries[queryIndex];
        connection.query(currentQuery.query, [currentQuery.value], (err) => {
          if (err) {
            return connection.rollback(() => {
              console.error(
                `Error executing the query for ${currentQuery.query}:`,
                err
              );
              res.status(500).json({ error: "Internal Server Error" });
            });
          }
          queryIndex++;
          executeQuery();
        });
      } else {
        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error("Error committing the transaction:", err);
              res.status(500).json({ error: "Internal Server Error" });
            });
          }
          res
            .status(200)
            .json({ message: "Difficulty levels updated successfully" });
        });
      }
    };
    executeQuery();
  });
});

module.exports = difficultyRouter;
