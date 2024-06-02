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

questionRouter.post("/addQuestion", (req, res) => {
  const { q_text, q_image, q_marks, q_difficulty, f_name, t_id, p_id, f_id } =
    req.body;
  const q_status = "pending";

  const query =
    "INSERT INTO Question (q_text, q_image, q_marks, q_difficulty, q_status, f_name, t_id, p_id, f_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  connection.query(
    query,
    [
      q_text,
      q_image,
      q_marks,
      q_difficulty,
      q_status,
      f_name,
      t_id,
      p_id,
      f_id
    ],
    (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      res.status(200).json({ message: "Question added successfully" });
    }
  );
});

module.exports = questionRouter;
