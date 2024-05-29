const express = require("express");
const facultyRoutes = require("./Faculty");
const courseRoutes = require("./Course");
const paperRoutes = require("./Paper");
const assignedCoursesRoutes = require("./Assigned_Course");
const cloRoutes = require("./Clo");
const gridviewRoutes = require("./Grid_View");
const feedbackRoutes = require("./Feedback");
const questionRoutes = require("./Question");
const topicRoutes = require("./Topic");
const subtopicRoutes = require("./SubTopic");
const difficultyRouter = require("./Difficulty");
const sessionRouter = require("./Session");

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", facultyRoutes);
app.use("/", courseRoutes);
app.use("/", paperRoutes);
app.use("/", assignedCoursesRoutes);
app.use("/", cloRoutes);
app.use("/", gridviewRoutes);
app.use("/", feedbackRoutes);
app.use("/", questionRoutes);
app.use("/", topicRoutes);
app.use("/", subtopicRoutes);
app.use("/", difficultyRouter);
app.use("/", sessionRouter);

app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
  });
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
