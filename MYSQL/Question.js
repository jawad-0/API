const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const questionRouter = express.Router();
const connection = require("./database");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
questionRouter.use(bodyParser.json());

// Routes >>>
// GET  -> getquestion/:p_id
// GET  -> getsinglequestion/:q_id
// GET  -> getuploadedquestion/:p_id
// GET  -> getadditionalquestion/:p_id
// GET  -> getQuestionTopics/:q_id
// GET  -> getValidPaperCLOS/:p_id
// GET  -> getQuestionCLOS/:q_id
// POST -> addQuestion, upload.single("q_image")
// PUT  -> editQuestion, upload.single("q_image")
// PUT  -> editpendingquestionstatus
// PUT  -> edituploadedquestionstatus
// PUT  -> editswappingstatus

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

// GET endpoint
// questionRouter.get("/getquestion/:p_id", (req, res) => {
//   const paperId = req.params.p_id;
//   const query = "SELECT * FROM Question WHERE p_id = ?";

//   connection.query(query, [paperId], (err, results) => {
//     if (err) {
//       console.error("Error executing the query:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }
//     // Read image files from the uploads directory for records with images
//     results.forEach((question) => {
//       if (question.q_image) {
//         const imagePath = `${question.q_image}`;
//         try {
//           const imageData = fs.readFileSync(imagePath);
//           question.imageData = imageData.toString("base64");
//         } catch (error) {
//           console.error("Error reading image file:", error);
//           res.status(500).json({ error: "Internal Server Error" });
//           return;
//         }
//       }
//     });

//     res.json(results);
//   });
// });

// GET endpoint
questionRouter.get("/getquestion/:p_id", (req, res) => {
  const paperId = req.params.p_id;
  const query = `SELECT q.*, GROUP_CONCAT(DISTINCT clo.clo_number)
    AS mapped_clos FROM Question q LEFT JOIN Question_Topic qt
    ON q.q_id = qt.q_id LEFT JOIN Topic_Map_CLO tc ON
    qt.t_id = tc.t_id LEFT JOIN CLO clo ON tc.clo_id = clo.clo_id
    WHERE q.p_id = ? GROUP BY q.q_id`;
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

// GET endpoint
questionRouter.get("/getsinglequestion/:q_id", (req, res) => {
  const questionId = req.params.q_id;
  const query =
    "SELECT q.*, GROUP_CONCAT(DISTINCT clo.clo_number) AS mapped_clos FROM Question q LEFT JOIN Question_Topic qt ON q.q_id = qt.q_id LEFT JOIN Topic_Map_CLO tc ON qt.t_id = tc.t_id LEFT JOIN CLO clo ON tc.clo_id = clo.clo_id WHERE q.q_id = ? GROUP BY q.q_id";
  connection.query(query, [questionId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    // Append image URL to the result if an image exists
    if (results.length > 0 && results[0].q_image) {
      const imagePath = `${results[0].q_image}`;
      // Assuming your images are served from a static directory
      //  const imageUrl = path.join("/", imagePath);
      //  results[0].imageUrl = imageUrl;
    }
    res.json(results);
  });
});

// GET endpoint
questionRouter.get("/getuploadedquestion/:p_id", (req, res) => {
  const paperId = req.params.p_id;
  const query =
    "SELECT q.*, GROUP_CONCAT(DISTINCT clo.clo_number) AS mapped_clos FROM Question q LEFT JOIN Question_Topic qt ON q.q_id = qt.q_id LEFT JOIN Topic_Map_CLO tc ON qt.t_id = tc.t_id LEFT JOIN CLO clo ON tc.clo_id = clo.clo_id WHERE q.p_id = ? AND q.q_status = 'uploaded' GROUP BY q.q_id";
  //"SELECT * FROM Question WHERE p_id = ? AND q_status = 'uploaded'";

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

// GET endpoint
questionRouter.get("/getadditionalquestion/:p_id", (req, res) => {
  const paperId = req.params.p_id;
  const query =
    "SELECT q.*, GROUP_CONCAT(DISTINCT clo.clo_number) AS mapped_clos FROM Question q LEFT JOIN Question_Topic qt ON q.q_id = qt.q_id LEFT JOIN Topic_Map_CLO tc ON qt.t_id = tc.t_id LEFT JOIN CLO clo ON tc.clo_id = clo.clo_id WHERE q.p_id = ? AND q.q_status = 'pending' GROUP BY q.q_id";

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

// GET endpoint
questionRouter.get("/getQuestionTopics/:q_id", (req, res) => {
  const questionId = req.params.q_id;
  const getQuery =
    "SELECT t.* FROM question_topic qt JOIN topic t ON qt.t_id = t.t_id WHERE q_id = ?";
  connection.query(getQuery, [questionId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// GET endpoint
questionRouter.get("/getValidPaperCLOS/:p_id", (req, res) => {
  const paperId = req.params.p_id;
  const getQuery =
    "SELECT DISTINCT clo.clo_id FROM Question JOIN question_topic ON Question.q_id = question_topic.q_id JOIN topic_map_clo ON question_topic.t_id = topic_map_clo.t_id JOIN CLO ON topic_map_clo.clo_id = CLO.clo_id WHERE Question.q_id = ?";
  connection.query(getQuery, [questionId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// GET endpoint
questionRouter.get("/getQuestionCLOS/:q_id", (req, res) => {
  const questionId = req.params.q_id;
  const getQuery =
    "SELECT DISTINCT clo.clo_id FROM Question JOIN question_topic ON Question.q_id = question_topic.q_id JOIN topic_map_clo ON question_topic.t_id = topic_map_clo.t_id JOIN CLO ON topic_map_clo.clo_id = CLO.clo_id WHERE Question.q_id = ?";
  connection.query(getQuery, [questionId], (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// POST endpoint
questionRouter.post("/addQuestion", upload.single("q_image"), (req, res) => {
  const { q_text, q_marks, q_difficulty, f_name, p_id, f_id, t_ids } = req.body;
  console.log(f_name);
  const q_status = "pending";
  const q_image = req.file ? req.file.path : null;
  console.log(q_image);
  const query =
    "INSERT INTO Question (q_text, q_image, q_marks, q_difficulty, q_status, f_name, p_id, f_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  connection.query(
    query,
    [q_text, q_image, q_marks, q_difficulty, q_status, f_name, p_id, f_id],
    (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      const q_id = results.insertId;
      const topicQuery = "INSERT INTO question_topic (q_id, t_id) VALUES ?";
      const topicValues = t_ids.map((t_id) => [q_id, t_id]);
      connection.query(topicQuery, [topicValues], (topicErr, topicResults) => {
        if (topicErr) {
          console.error("Error executing the topic query:", topicErr);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
        res.status(200).json({ message: "Question added successfully" });
      });
    }
  );
});

// PUT endpoint
questionRouter.put(
  "/editQuestion/:q_id",
  upload.single("q_image"),
  (req, res) => {
    const q_id = req.params.q_id;
    const { q_text, q_marks, q_difficulty } = req.body;
    const q_image = req.file ? req.file.path : null;
    const t_ids = req.body.t_ids || [];

    // Begin a transaction
    connection.beginTransaction((err) => {
      if (err) {
        console.error("Error beginning transaction:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      // Delete existing records in question_topic table
      const deleteQuery = "DELETE FROM question_topic WHERE q_id = ?";
      connection.query(deleteQuery, [q_id], (deleteErr, deleteResults) => {
        if (deleteErr) {
          console.error("Error deleting existing topics:", deleteErr);
          connection.rollback(() => {
            res.status(500).json({ error: "Internal Server Error" });
          });
          return;
        }
        // Insert new records in question_topic table
        const insertQuery = "INSERT INTO question_topic (q_id, t_id) VALUES ?";
        const topicValues = t_ids.map((t_id) => [q_id, t_id]);
        connection.query(
          insertQuery,
          [topicValues],
          (insertErr, insertResults) => {
            if (insertErr) {
              console.error("Error inserting new topics:", insertErr);
              connection.rollback(() => {
                res.status(500).json({ error: "Internal Server Error" });
              });
              return;
            }
            // Update question details
            let updateQuery =
              "UPDATE Question SET q_text = ?, q_marks = ?, q_difficulty = ?";
            const updateValues = [q_text, q_marks, q_difficulty];
            if (q_image) {
              updateQuery += ", q_image = ?";
              updateValues.push(q_image);
            }
            updateQuery += " WHERE q_id = ?";
            updateValues.push(q_id);
            connection.query(
              updateQuery,
              updateValues,
              (updateErr, updateResults) => {
                if (updateErr) {
                  console.error("Error updating question details:", updateErr);
                  connection.rollback(() => {
                    res.status(500).json({ error: "Internal Server Error" });
                  });
                  return;
                }
                // Commit the transaction if all queries succeed
                connection.commit((commitErr) => {
                  if (commitErr) {
                    console.error("Error committing transaction:", commitErr);
                    connection.rollback(() => {
                      res.status(500).json({ error: "Internal Server Error" });
                    });
                    return;
                  }
                  // Send response if everything succeeds
                  res
                    .status(200)
                    .json({ message: "Question record updated successfully" });
                });
              }
            );
          }
        );
      });
    });
  }
);

// PUT endpoint
questionRouter.put("/editpendingquestionstatus", (req, res) => {
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

// PUT endpoint
questionRouter.put("/edituploadedquestionstatus", (req, res) => {
  const { acceptedQIds } = req.body;
  const newStatusAccepted = "accepted";
  if (
    !acceptedQIds ||
    !Array.isArray(acceptedQIds) ||
    acceptedQIds.length === 0
  ) {
    return res.status(400).json({ error: "Invalid or empty q_ids provided" });
  }
  const query = "UPDATE Question SET q_status = ? WHERE q_id IN (?)";
  connection.query(query, [newStatusAccepted, acceptedQIds], (err, result) => {
    if (err) {
      console.error("Error updating question status:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "No questions found with the provided q_ids" });
    }
    res.status(200).json({ message: "Question status updated successfully" });
  });
});

// PUT endpoint
questionRouter.put("/editswappingstatus", (req, res) => {
  const { paperId, id1, id2 } = req.body;
  // console.log(paperId, id1, id2);
  if (!paperId || !id1 || !id2) {
    return res
      .status(400)
      .json({ error: "Invalid or empty paper ID or question IDs provided" });
  }

  const updateQuery1 =
    "UPDATE Question SET q_status = 'pending' WHERE q_id = ? AND p_id = ?";
  const updateQuery2 =
    "UPDATE Question SET q_status = 'uploaded' WHERE q_id = ? AND p_id = ?";

  connection.query(updateQuery1, [id1, paperId], (err1, result1) => {
    if (err1) {
      console.error("Error executing the query for id1:", err1);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    connection.query(updateQuery2, [id2, paperId], (err2, result2) => {
      if (err2) {
        console.error("Error executing the query for id2:", err2);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      const affectedRows1 = result1.affectedRows || 0;
      const affectedRows2 = result2.affectedRows || 0;
      if (affectedRows1 === 0 && affectedRows2 === 0) {
        return res.status(404).json({
          error: "No questions found with the provided IDs or paperId"
        });
      }
      res
        .status(200)
        .json({ message: "Question statuses updated successfully" });
    });
  });
});

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

// questionRouter.post("/addQuestion2", (req, res) => {
//     const { q_text, q_image, q_marks, q_difficulty, f_name, t_id, p_id, f_id } =
//       req.body;
//     const q_status = "pending";
//     const query =
//       "INSERT INTO Question (q_text, q_image, q_marks, q_difficulty, q_status, f_name, t_id, p_id, f_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
//     connection.query(
//       query,
//       [
//         q_text,
//         q_image,
//         q_marks,
//         q_difficulty,
//         q_status,
//         f_name,
//         t_id,
//         p_id,
//         f_id
//       ],
//       (err, results) => {
//         if (err) {
//           console.error("Error executing the query:", err);
//           res.status(500).json({ error: "Internal Server Error" });
//           return;
//         }
//         res.status(200).json({ message: "Question added successfully" });
//       }
//     );
//   });

// PUT endpoint
// questionRouter.put("/edituploadedquestionstatus", (req, res) => {
//   const { acceptedQIds, rejectedQIds } = req.body;
//   const newStatusAccepted = "accepted";
//   const newStatusRejected = "rejected";
//   if (
//     (!acceptedQIds ||
//       !Array.isArray(acceptedQIds) ||
//       acceptedQIds.length === 0) &&
//     (!rejectedQIds || !Array.isArray(rejectedQIds) || rejectedQIds.length === 0)
//   ) {
//     return res.status(400).json({ error: "Invalid or empty q_ids provided" });
//   }
//   const queries = [];
//   const queryParams = [];
//   if (acceptedQIds && acceptedQIds.length > 0) {
//     queries.push("UPDATE Question SET q_status = ? WHERE q_id IN (?)");
//     queryParams.push([newStatusAccepted, acceptedQIds]);
//   }
//   if (rejectedQIds && rejectedQIds.length > 0) {
//     queries.push("UPDATE Question SET q_status = ? WHERE q_id IN (?)");
//     queryParams.push([newStatusRejected, rejectedQIds]);
//   }
//   const executeQueries = queries.map(
//     (query, index) =>
//       new Promise((resolve, reject) => {
//         connection.query(query, queryParams[index], (err, result) => {
//           if (err) {
//             return reject(err);
//           }
//           resolve(result);
//         });
//       })
//   );
//   Promise.all(executeQueries)
//     .then((results) => {
//       const affectedRows = results.reduce(
//         (acc, result) => acc + (result.affectedRows || 0),
//         0
//       );
//       if (affectedRows === 0) {
//         return res
//           .status(404)
//           .json({ error: "No questions found with the provided q_ids" });
//       }
//       res.status(200).json({ message: "Question status updated successfully" });
//     })
//     .catch((err) => {
//       console.error("Error executing the queries:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//     });
// });

module.exports = questionRouter;
