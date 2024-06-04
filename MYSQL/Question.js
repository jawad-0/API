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

questionRouter.get("/getuploadedquestion/:p_id", (req, res) => {
  const paperId = req.params.p_id;
  const query =
    "SELECT * FROM Question WHERE p_id = ? AND q_status = 'uploaded'";

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

questionRouter.put("/editquestionstatus", (req, res) => {
  const { paperId, q_ids } = req.body;
  const new_status = "uploaded";
  if (!paperId || !q_ids || !Array.isArray(q_ids) || q_ids.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid or empty paper ID or q_ids provided" });
  }
  const updateQuery =
    "UPDATE Question SET q_status = CASE WHEN q_id IN (?) THEN ? ELSE ? END WHERE p_id = ?";
  const params = [q_ids, new_status, "pending", paperId];
  connection.query(updateQuery, params, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    const affectedRows = result.affectedRows || 0;
    if (affectedRows === 0) {
      return res.status(404).json({
        error: "No questions found with the provided q_ids or paperId"
      });
    }
    res.status(200).json({ message: "Question status updated successfully" });
  });
});

questionRouter.put("/editquestionstatus2", (req, res) => {
  const { acceptedQIds, rejectedQIds } = req.body;
  const newStatusAccepted = "accepted";
  const newStatusRejected = "rejected";
  if (
    (!acceptedQIds ||
      !Array.isArray(acceptedQIds) ||
      acceptedQIds.length === 0) &&
    (!rejectedQIds || !Array.isArray(rejectedQIds) || rejectedQIds.length === 0)
  ) {
    return res.status(400).json({ error: "Invalid or empty q_ids provided" });
  }
  const queries = [];
  const queryParams = [];
  if (acceptedQIds && acceptedQIds.length > 0) {
    queries.push("UPDATE Question SET q_status = ? WHERE q_id IN (?)");
    queryParams.push([newStatusAccepted, acceptedQIds]);
  }
  if (rejectedQIds && rejectedQIds.length > 0) {
    queries.push("UPDATE Question SET q_status = ? WHERE q_id IN (?)");
    queryParams.push([newStatusRejected, rejectedQIds]);
  }
  const executeQueries = queries.map(
    (query, index) =>
      new Promise((resolve, reject) => {
        connection.query(query, queryParams[index], (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        });
      })
  );
  Promise.all(executeQueries)
    .then((results) => {
      const affectedRows = results.reduce(
        (acc, result) => acc + (result.affectedRows || 0),
        0
      );
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "No questions found with the provided q_ids" });
      }
      res.status(200).json({ message: "Question status updated successfully" });
    })
    .catch((err) => {
      console.error("Error executing the queries:", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

module.exports = questionRouter;
