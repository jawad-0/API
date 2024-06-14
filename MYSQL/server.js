const express = require("express");
const assignedCoursesRoutes = require("./Assigned_Course");
const cloRoutes = require("./Clo");
const courseRoutes = require("./Course");
const difficultyRouter = require("./Difficulty");
const facultyRoutes = require("./Faculty");
const feedbackRoutes = require("./Feedback");
const gridviewRoutes = require("./Grid_View");
const paperRoutes = require("./Paper");
const questionRoutes = require("./Question");
const sessionRouter = require("./Session");
const topicRoutes = require("./Topic");
const subtopicRoutes = require("./SubTopic");

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
