const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const gridviewRouter = express.Router();
const connection = require("./database");
gridviewRouter.use(bodyParser.json());

// To get Grid_View_Headers
gridviewRouter.get("/getGridViewHeaders", (req, res) => {
  const getQuery = "SELECT * FROM Grid_View_Headers";
  connection.query(getQuery, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// To Add New Grid_View_Weightage
gridviewRouter.put("/addGridViewWeightage", (req, res) => {
  const { clo_id, weightage1, weightage2, weightage3, weightage4 } = req.body;
  console.log(weightage1, weightage2, weightage3, weightage4);
  // Step 1: Retrieve the course ID for the given clo_id
  connection.query(
    "SELECT c_id FROM CLO WHERE clo_id = ?",
    [clo_id],
    (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: "CLO not found" });
        return;
      }
      const courseId = results[0].c_id;

      // Step 2: Retrieve current weightages for the given clo_id
      connection.query(
        "SELECT weightage1, weightage2, weightage3, weightage4 FROM Grid_View_Weightage WHERE clo_id = ?",
        [clo_id],
        (err, currentResults) => {
          if (err) {
            console.error("Error executing the query:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
          }

          const currentWeightages = currentResults[0] || {
            weightage1: 0,
            weightage2: 0,
            weightage3: 0,
            weightage4: 0
          };

          // Step 3: Calculate total weightages for the course, excluding the current CLO’s weightages
          connection.query(
            "SELECT SUM(weightage1) AS totalWeightage1, SUM(weightage2) AS totalWeightage2, SUM(weightage3) AS totalWeightage3, SUM(weightage4) AS totalWeightage4 FROM Grid_View_Weightage WHERE clo_id IN (SELECT clo_id FROM CLO WHERE c_id = ?)",
            [courseId],
            (err, results) => {
              if (err) {
                console.error("Error executing the query:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
              }

              const totalWeightage1 =
                (results[0].totalWeightage1 || 0) -
                currentWeightages.weightage1;
              const totalWeightage2 =
                (results[0].totalWeightage2 || 0) -
                currentWeightages.weightage2;
              const totalWeightage3 =
                (results[0].totalWeightage3 || 0) -
                currentWeightages.weightage3;
              const totalWeightage4 =
                (results[0].totalWeightage4 || 0) -
                currentWeightages.weightage4;

              console.log("Current Total Weightages:", {
                totalWeightage1,
                totalWeightage2,
                totalWeightage3,
                totalWeightage4
              });

              // Step 4: Validate new weightages
              const errors = [];
              if (weightage1 + totalWeightage1 > 20) {
                errors.push("Total weightage1 limit exceeded for the course");
              }
              if (weightage2 + totalWeightage2 > 30) {
                errors.push("Total weightage2 limit exceeded for the course");
              }
              if (weightage3 + totalWeightage3 > 20) {
                errors.push("Total weightage3 limit exceeded for the course");
              }
              if (weightage4 + totalWeightage4 > 30) {
                errors.push("Total weightage4 limit exceeded for the course");
              }

              if (errors.length > 0) {
                res.status(400).json({ errors });
                return;
              }

              // Step 5: Check if a record with the given clo_id already exists
              connection.query(
                "SELECT * FROM Grid_View_Weightage WHERE clo_id = ?",
                [clo_id],
                (err, results) => {
                  if (err) {
                    console.error("Error executing the query:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                    return;
                  }

                  let query;
                  const values = [
                    weightage1,
                    weightage2,
                    weightage3,
                    weightage4,
                    clo_id
                  ];

                  if (results.length > 0) {
                    // Update existing record
                    query =
                      "UPDATE Grid_View_Weightage SET weightage1 = ?, weightage2 = ?, weightage3 = ?, weightage4 = ? WHERE clo_id = ?";
                  } else {
                    // Insert new record
                    query =
                      "INSERT INTO Grid_View_Weightage (weightage1, weightage2, weightage3, weightage4, clo_id) VALUES (?, ?, ?, ?, ?)";
                  }

                  // Step 6: Execute the query
                  connection.query(query, values, (err) => {
                    if (err) {
                      console.error("Error executing the query:", err);
                      res.status(500).json({ error: "Internal Server Error" });
                      return;
                    }
                    res.status(200).json({
                      message: "Grid_View_Weightage added/updated successfully"
                    });
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// To Get Grid_View_Weightage of 1 CLO
gridviewRouter.get("/getCLOGridViewWeightage/:clo_id", (req, res) => {
  const clo_id = req.params.clo_id;
  const getQuery = "SELECT * FROM Grid_View_Weightage WHERE clo_id = ?";
  connection.query(getQuery, clo_id, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// To Get Grid_View_Weightage of Course
gridviewRouter.get("/getCourseGridViewWeightage/:c_id", (req, res) => {
  const c_id = req.params.c_id;
  const getQuery =
    "SELECT gvwt.*, CLO.clo_number FROM Course JOIN CLO ON Course.c_id = CLO.c_id JOIN Grid_View_Weightage gvwt ON CLO.clo_id = gvwt.clo_id WHERE Course.c_id = ? ORDER BY CLO.CLO_number ASC";
  connection.query(getQuery, c_id, (err, results) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// To Edit Existing Grid_View_Weightage
// gridviewRouter.put("/editGridViewWeightage/:clo_id", (req, res) => {
//   const clo_id = req.params.clo_id;
//   const { weightage1, weightage2, weightage3, weightage4 } = req.body;

//   const query =
//     "UPDATE Grid_View_Weightage SET weightage1 = ?, weightage2 = ?, weightage3 = ?, weightage4 = ? WHERE clo_id = ?";
//   const values = [weightage1, weightage2, weightage3, weightage4, clo_id];

//   connection.query(query, values, (err, result) => {
//     if (err) {
//       console.error("Error executing the query:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }
//     if (result.affectedRows === 0) {
//       res.status(404).json({ error: "Grid_View_Weightage not found" });
//       return;
//     }
//     res
//       .status(200)
//       .json({ message: "Grid_View_Weightage updated successfully" });
//   });
// });

// To Add New Grid_View_Weightage
// gridviewRouter.post("/addGridViewWeightage", (req, res) => {
//   const { clo_id, header_id, weightage } = req.body;
//   const query =
//     "INSERT INTO Grid_View_Weightage (clo_id, header_id, weightage) VALUES (?, ?, ?)";
//   const values = [clo_id, header_id, weightage];
//   connection.query(query, values, (err) => {
//     if (err) {
//       console.error("Error executing the query:", err);
//       res.status(500).json({ error: "Internal Server Error" });
//       return;
//     }
//     res.status(200).json({ message: "Course added successfully" });
//   });
// });

// To Add New Grid_View_Weightage
// gridviewRouter.post("/addGridViewWeightage", (req, res) => {
//   const { clo_id, weightage1, weightage2, weightage3, weightage4 } = req.body;
//   connection.query(
//     "SELECT c_id FROM CLO WHERE clo_id = ?",
//     [clo_id],
//     (err, results) => {
//       if (err) {
//         console.error("Error executing the query:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//         return;
//       }
//       const courseId = results[0].c_id;
//       connection.query(
//         "SELECT SUM(weightage1) AS totalWeightage1, SUM(weightage2) AS totalWeightage2, SUM(weightage3) AS totalWeightage3, SUM(weightage4) AS totalWeightage4 FROM Grid_View_Weightage WHERE clo_id IN (SELECT clo_id FROM CLO WHERE c_id = ?)",
//         [courseId],
//         (err, results) => {
//           if (err) {
//             console.error("Error executing the query:", err);
//             res.status(500).json({ error: "Internal Server Error" });
//             return;
//           }
//           const totalWeightage1 = results[0].totalWeightage1 || 0;
//           const totalWeightage2 = results[0].totalWeightage2 || 0;
//           const totalWeightage3 = results[0].totalWeightage3 || 0;
//           const totalWeightage4 = results[0].totalWeightage4 || 0;

//           const errors = [];

//           if (weightage1 + totalWeightage1 > 20) {
//             errors.push("Total weightage1 limit exceeded for the course");
//           }
//           if (weightage2 + totalWeightage2 > 30) {
//             errors.push("Total weightage2 limit exceeded for the course");
//           }
//           if (weightage3 + totalWeightage3 > 20) {
//             errors.push("Total weightage3 limit exceeded for the course");
//           }
//           if (weightage4 + totalWeightage4 > 30) {
//             errors.push("Total weightage4 limit exceeded for the course");
//           }

//           if (errors.length > 0) {
//             res.status(400).json({ errors });
//             return;
//           }

//           const query =
//             "INSERT INTO Grid_View_Weightage (clo_id, weightage1, weightage2, weightage3, weightage4) VALUES (?, ?, ?, ?, ?)";
//           const values = [
//             clo_id,
//             weightage1,
//             weightage2,
//             weightage3,
//             weightage4
//           ];

//           connection.query(query, values, (err) => {
//             if (err) {
//               console.error("Error executing the query:", err);
//               res.status(500).json({ error: "Internal Server Error" });
//               return;
//             }
//             res
//               .status(200)
//               .json({ message: "Grid_View_Weightage added successfully" });
//           });
//         }
//       );
//     }
//   );
// });

module.exports = gridviewRouter;
