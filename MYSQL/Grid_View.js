const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const gridviewRouter = express.Router();
const connection = require("./database");
gridviewRouter.use(bodyParser.json());

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
gridviewRouter.post("/addGridViewWeightage", (req, res) => {
  const { clo_id, weightage1, weightage2, weightage3, weightage4 } = req.body;
  // Get the course ID of the current CLO
  connection.query(
    "SELECT c_id FROM CLO WHERE clo_id = ?",
    [clo_id],
    (err, results) => {
      if (err) {
        console.error("Error executing the query:", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      const courseId = results[0].c_id;
      // Calculate the total weightage for all CLOs of the same course
      connection.query(
        "SELECT SUM(weightage1) AS totalWeightage1, SUM(weightage2) AS totalWeightage2, SUM(weightage3) AS totalWeightage3, SUM(weightage4) AS totalWeightage4 FROM Grid_View_Weightage_Test WHERE clo_id IN (SELECT clo_id FROM CLO WHERE c_id = ?)",
        [courseId],
        (err, results) => {
          if (err) {
            console.error("Error executing the query:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
          }
          const totalWeightage1 = results[0].totalWeightage1 || 0;
          const totalWeightage2 = results[0].totalWeightage2 || 0;
          const totalWeightage3 = results[0].totalWeightage3 || 0;
          const totalWeightage4 = results[0].totalWeightage4 || 0;
          // Validate against the specified limits
          if (
            weightage1 + totalWeightage1 > 20 ||
            weightage2 + totalWeightage2 > 30 ||
            weightage3 + totalWeightage3 > 20 ||
            weightage4 + totalWeightage4 > 20
          ) {
            res.status(400).json({
              error: "Total weightage limits exceeded for the course"
            });
            return;
          }
          // Proceed with the insertion if validation passes
          const query =
            "INSERT INTO Grid_View_Weightage_Test (clo_id, weightage1, weightage2, weightage3, weightage4) VALUES (?, ?, ?, ?, ?)";
          const values = [
            clo_id,
            weightage1,
            weightage2,
            weightage3,
            weightage4
          ];

          connection.query(query, values, (err) => {
            if (err) {
              console.error("Error executing the query:", err);
              res.status(500).json({ error: "Internal Server Error" });
              return;
            }
            res
              .status(200)
              .json({ message: "Grid_View_Weightage added successfully" });
          });
        }
      );
    }
  );
});

// To Add New Grid_View_Weightage
gridviewRouter.post("/addGridViewWeightage2", (req, res) => {
  const { clo_id, weightage1, weightage2, weightage3, weightage4 } = req.body;
  const query =
    "INSERT INTO Grid_View_Weightage_Test (clo_id, weightage1, weightage2, weightage3, weightage4) VALUES (?, ?, ?, ?, ?)";
  const values = [clo_id, weightage1, weightage2, weightage3, weightage4];
  connection.query(query, values, (err) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json({ message: "Grid_View_Weightage added successfully" });
  });
});

// To Get Grid_View_Weightage of 1 CLO
gridviewRouter.get("/getGridViewWeightage/:clo_id", (req, res) => {
  const clo_id = req.params.clo_id;
  const getQuery = "SELECT * FROM Grid_View_Weightage_Test WHERE clo_id = ?";
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
gridviewRouter.get("/getGridViewWeightage2/:c_id", (req, res) => {
  const c_id = req.params.c_id;
  const getQuery =
    "SELECT gvwt.* FROM Course JOIN CLO ON Course.c_id = CLO.c_id JOIN grid_view_weightage_test gvwt ON CLO.clo_id = gvwt.clo_id WHERE Course.c_id = ? ORDER BY CLO.CLO_number ASC";
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
gridviewRouter.put("/editGridViewWeightage/:clo_id", (req, res) => {
  const clo_id = req.params.clo_id;
  const { weightage1, weightage2, weightage3, weightage4 } = req.body;

  const query =
    "UPDATE Grid_View_Weightage_Test SET weightage1 = ?, weightage2 = ?, weightage3 = ?, weightage4 = ? WHERE clo_id = ?";
  const values = [weightage1, weightage2, weightage3, weightage4, clo_id];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error executing the query:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Grid_View_Weightage not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Grid_View_Weightage updated successfully" });
  });
});

module.exports = gridviewRouter;
