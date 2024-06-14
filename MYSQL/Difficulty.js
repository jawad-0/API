const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const difficultyRouter = express.Router();
const connection = require("./database");
difficultyRouter.use(bodyParser.json());

// Routes >>>
// GET  -> getNumberOfQuestions
// GET  -> getDifficulty/:noOfQuestions
// PUT  -> savedifficulty/:numberOfQuestions

// GET endpoint
difficultyRouter.get("/getNumberOfQuestions", (req, res) => {
  const getQuery = "SELECT number_of_questions FROM Difficulty";
  connection.query(getQuery, (err, result) => {
    if (err) {
      console.error("Error retrieving difficulties:", err);
      res.status(500).send("Get Request Error");
      return;
    }
    res.json(result);
  });
});

// GET endpoint
difficultyRouter.get("/getDifficulty/:noOfQuestions", (req, res) => {
  const noOfQuestions = req.params.noOfQuestions;
  const getQuery = "SELECT * FROM Difficulty WHERE number_of_questions = ?";
  connection.query(getQuery, [noOfQuestions], (err, result) => {
    if (err) {
      console.error("Error retrieving difficulties:", err);
      res.status(500).send("Get Request Error");
      return;
    }
    res.json(result);
  });
});

// PUT endpoint
difficultyRouter.put("/savedifficulty/:numberOfQuestions", (req, res) => {
  const numberOfQuestions = req.params.numberOfQuestions;
  const { easy, medium, hard } = req.body;
  console.log(easy, medium, hard);
  if (numberOfQuestions == null) {
    return res.status(400).json({
      error: "Please provide a value for numberOfQuestions"
    });
  }
  const easyValue = easy;
  const mediumValue = medium;
  const hardValue = hard;

  if (easyValue + mediumValue + hardValue != numberOfQuestions) {
    return res.status(400).json({
      error:
        "The sum of easy, medium, and hard should be equal to numberOfQuestions"
    });
  }

  const query =
    "UPDATE Difficulty SET easy = ? , medium = ? , hard = ? WHERE number_of_questions = ?";
  const values = [easy, medium, hard, numberOfQuestions];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Difficulty record not found" });
      return;
    }
    res.status(200).json({ message: "Difficulty record updated successfully" });
  });
});

// GET endpoint
// difficultyRouter.get("/getdifficulty", (req, res) => {
//   const query = "SELECT * FROM Difficulty";
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error executing the query:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }
//     res.json(results);
//   });
// });

// POST endpoint
// difficultyRouter.post("/savedifficulty", (req, res) => {
//   const { easy, medium, hard } = req.body;

//   if (easy == null || medium == null || hard == null) {
//     return res.status(400).json({
//       error: "Please provide values for easy, medium, and hard difficulties"
//     });
//   }
//   connection.beginTransaction((err) => {
//     if (err) {
//       console.error("Error starting the transaction:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }

//     const queries = [
//       {
//         query: "UPDATE Difficulty SET number = ? WHERE difficulty = 'easy'",
//         value: easy
//       },
//       {
//         query: "UPDATE Difficulty SET number = ? WHERE difficulty = 'medium'",
//         value: medium
//       },
//       {
//         query: "UPDATE Difficulty SET number = ? WHERE difficulty = 'hard'",
//         value: hard
//       }
//     ];
//     let queryIndex = 0;
//     const executeQuery = () => {
//       if (queryIndex < queries.length) {
//         const currentQuery = queries[queryIndex];
//         connection.query(currentQuery.query, [currentQuery.value], (err) => {
//           if (err) {
//             return connection.rollback(() => {
//               console.error(
//                 `Error executing the query for ${currentQuery.query}:`,
//                 err
//               );
//               res.status(500).json({ error: "Internal Server Error" });
//             });
//           }
//           queryIndex++;
//           executeQuery();
//         });
//       } else {
//         connection.commit((err) => {
//           if (err) {
//             return connection.rollback(() => {
//               console.error("Error committing the transaction:", err);
//               res.status(500).json({ error: "Internal Server Error" });
//             });
//           }
//           res
//             .status(200)
//             .json({ message: "Difficulty levels updated successfully" });
//         });
//       }
//     };
//     executeQuery();
//   });
// });

// difficultyRouter.post("/postDifficulty", (req, res) => {
//   const { easy, medium, hard, numberOfQuestions } = req.body;

//   if (numberOfQuestions == null) {
//     return res.status(400).json({
//       error: "Please provide a value for numberOfQuestions"
//     });
//   }

//   const easyValue = easy || 0;
//   const mediumValue = medium || 0;
//   const hardValue = hard || 0;

//   if (easyValue + mediumValue + hardValue !== numberOfQuestions) {
//     return res.status(400).json({
//       error:
//         "The sum of easy, medium, and hard should be equal to numberOfQuestions"
//     });
//   }

//   connection.beginTransaction((err) => {
//     if (err) {
//       console.error("Error starting the transaction:", err);
//       connection.release();
//       return res.status(500).json({ error: "Internal Server Error" });
//     }

//     const checkExistenceQuery =
//       "SELECT d_id FROM DifficultyOfQuestions WHERE number_of_questions = ?";
//     connection.query(
//       checkExistenceQuery,
//       [numberOfQuestions],
//       (err, results) => {
//         if (err) {
//           return connection.rollback(() => {
//             console.error("Error checking for existing record:", err);
//             connection.release();
//             res.status(500).json({ error: "Internal Server Error" });
//           });
//         }

//         if (results.length > 0) {
//           // Record exists, update it
//           const updateQuery = `
//                         UPDATE DifficultyOfQuestions
//                         SET easy = ?, medium = ?, hard = ?
//                         WHERE number_of_questions = ?
//                     `;
//           connection.query(
//             updateQuery,
//             [easyValue, mediumValue, hardValue, numberOfQuestions],
//             (err) => {
//               if (err) {
//                 return connection.rollback(() => {
//                   console.error("Error updating the record:", err);
//                   connection.release();
//                   res.status(500).json({ error: "Internal Server Error" });
//                 });
//               }

//               connection.commit((err) => {
//                 if (err) {
//                   return connection.rollback(() => {
//                     console.error("Error committing the transaction:", err);
//                     connection.release();
//                     res.status(500).json({ error: "Internal Server Error" });
//                   });
//                 }
//                 connection.release();
//                 res.status(200).json({
//                   message: "Difficulty levels updated successfully"
//                 });
//               });
//             }
//           );
//         } else {
//           // Record does not exist, insert it
//           const insertQuery = `
//                         INSERT INTO DifficultyOfQuestions (easy, medium, hard, number_of_questions)
//                         VALUES (?, ?, ?, ?)
//                     `;
//           connection.query(
//             insertQuery,
//             [easyValue, mediumValue, hardValue, numberOfQuestions],
//             (err) => {
//               if (err) {
//                 return connection.rollback(() => {
//                   console.error("Error inserting the record:", err);
//                   connection.release();
//                   res.status(500).json({ error: "Internal Server Error" });
//                 });
//               }

//               connection.commit((err) => {
//                 if (err) {
//                   return connection.rollback(() => {
//                     console.error("Error committing the transaction:", err);
//                     connection.release();
//                     res.status(500).json({ error: "Internal Server Error" });
//                   });
//                 }
//                 connection.release();
//                 res
//                   .status(200)
//                   .json({ message: "Difficulty levels added successfully" });
//               });
//             }
//           );
//         }
//       }
//     );
//   });
// });

module.exports = difficultyRouter;
