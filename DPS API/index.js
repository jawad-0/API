const express = require("express");
const facultyRoutes = require("./Faculty");
const courseRoutes = require("./Course");
const paperRoutes = require("./Paper");
const AssignedCoursesRoutes = require("./AssignedCourses");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/Faculty", facultyRoutes);
app.use("/Course", courseRoutes);
app.use("/Paper", paperRoutes);
app.use("/AssignedCourses", AssignedCoursesRoutes);


app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
  });
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});