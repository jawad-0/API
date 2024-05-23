const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const questionRouter = express.Router();
const connection = require("./database");
questionRouter.use(bodyParser.json());

questionRouter.get("/getquestion/:p_id", (req, res) => {
  const paperId = req.params.p_id;
  const query = "SELECT * FROM Question WHERE p_id = ?";

  connection.query(query, [paperId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

module.exports = questionRouter;
