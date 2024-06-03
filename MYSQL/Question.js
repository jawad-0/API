const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const questionRouter = express.Router();
const connection = require("./database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
questionRouter.use(bodyParser.json());

// Set up multer storage engine
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   }
// });

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

questionRouter.get("/getquestion/:p_id", (req, res) => {
  const paperId = req.params.p_id;
  const query = "SELECT * FROM Question WHERE p_id = ?";

  connection.query(query, [paperId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    // Read image files from the uploads directory for records with images
    results.forEach((question) => {
      if (question.q_image) {
        const imagePath = `${question.q_image}`;
        try {
          const imageData = fs.readFileSync(imagePath);
          question.imageData = imageData.toString("base64");
        } catch (error) {
          console.error("Error reading image file:", error);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
      }
    });

    res.json(results);
  });
});

// questionRouter.get("/getquestion2/:p_id", (req, res) => {
//   const paperId = req.params.p_id;
//   const query = "SELECT * FROM Question WHERE p_id = ?";

//   connection.query(query, [paperId], (err, results) => {
//     if (err) {
//       console.error("Error executing the query:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }
//     res.json(results);
//   });
// });

questionRouter.post("/addQuestion", upload.single("q_image"), (req, res) => {
  const { q_text, q_marks, q_difficulty, f_name, t_id, p_id, f_id } = req.body;
  console.log(f_name);
  const q_status = "pending";
  const q_image = req.file ? req.file.path : null;

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

questionRouter.post("/addQuestion2", (req, res) => {
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
