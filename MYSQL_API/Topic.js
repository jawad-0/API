const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const topicRouter = express.Router();
const connection = require("./database");
topicRouter.use(bodyParser.json());

topicRouter.get("/gettopic/:c_id", (req, res) => {
  const paperId = req.params.c_id;
  const query = "SELECT * FROM Topic WHERE c_id = ?";

  connection.query(query, [paperId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

module.exports = topicRouter;
