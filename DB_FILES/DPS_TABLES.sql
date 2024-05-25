CREATE DATABASE dps;
USE dps;

1-  Session
2-  Faculty
3-  Course
4-  Paper
5-  Assigned_Course
6-  CLO
7-  Grid_View_Headers
8-  Grid_View_Weightage
9-  Topic
10- Subtopic
11- Topic_Taught
12- Topic_Map_CLO
13- Question
14- Feedback

CREATE TABLE Session (
    s_id INT AUTO_INCREMENT PRIMARY KEY,
    s_name VARCHAR(20) NOT NULL,
    flag BIT NOT NULL
);
CREATE TABLE Faculty (
    f_id INT AUTO_INCREMENT PRIMARY KEY,
    f_name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    status VARCHAR(20) NOT NULL
);
CREATE TABLE Course (
    c_id INT AUTO_INCREMENT PRIMARY KEY,
    c_code VARCHAR(10) NOT NULL,
    c_title VARCHAR(50) NOT NULL,
    cr_hours INT NOT NULL,
    status VARCHAR(20) NOT NULL
);
CREATE TABLE Paper (
    p_id INT AUTO_INCREMENT PRIMARY KEY,
    duration INT NOT NULL,
    degree VARCHAR(10) NOT NULL,
    t_marks INT NOT NULL,
    term VARCHAR(10) NOT NULL,
    year INT NOT NULL,
    exam_date VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    c_id INT NOT NULL,
    s_id INT NOT NULL,
    FOREIGN KEY (c_id) REFERENCES Course(c_id),
    FOREIGN KEY (s_id) REFERENCES session(s_id)
);
CREATE TABLE Assigned_Course (
    ac_id INT AUTO_INCREMENT PRIMARY KEY,
    c_id INT NOT NULL,
    f_id INT NOT NULL,
    role VARCHAR(20) NOT NULL,
    s_id INT NOT NULL,
    FOREIGN KEY (c_id) REFERENCES Course(c_id),
    FOREIGN KEY (f_id) REFERENCES Faculty(f_id),
    FOREIGN KEY (s_id) REFERENCES session(s_id)
);
CREATE TABLE CLO (
    clo_id INT AUTO_INCREMENT PRIMARY KEY,
    c_id INT NOT NULL,
    clo_number VARCHAR(10) NOT NULL,
    clo_text VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (c_id) REFERENCES Course(c_id)
);
CREATE TABLE Grid_View_Headers (
    header_id INT PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    weightage INT NOT NULL
);
CREATE TABLE Grid_View_Weightage (
    clo_id INT NOT NULL,
    weightage1 INT,
    weightage2 INT,
    weightage3 INT,
    weightage4 INT,
    FOREIGN KEY (clo_id) REFERENCES CLO(clo_id)
);
CREATE TABLE Topic (
    t_id INT PRIMARY KEY,
    t_name VARCHAR(255) NOT NULL,
    c_id INT NOT NULL,
    FOREIGN KEY (c_id) REFERENCES Course(c_id),
    status VARCHAR(20) NOT NULL
);
CREATE TABLE Subtopic (
    st_id INT PRIMARY KEY,
    t_id INT,
    st_name VARCHAR(255),
    FOREIGN KEY (t_id) REFERENCES Topic(t_id)
);
CREATE TABLE Topic_Taught (
    tt_id INT AUTO_INCREMENT PRIMARY KEY,
    f_id INT,
    t_id INT,
    st_id INT,
    FOREIGN KEY (f_id) REFERENCES Faculty(f_id),
    FOREIGN KEY (t_id) REFERENCES Topic(t_id),
    FOREIGN KEY (st_id) REFERENCES Subtopic(st_id)
);
CREATE TABLE Topic_Map_CLO (
    ct_id INT AUTO_INCREMENT PRIMARY KEY,
    clo_id INT NOT NULL,
    t_id INT NOT NULL,
    FOREIGN KEY (clo_id) REFERENCES CLO(clo_id),
    FOREIGN KEY (t_id) REFERENCES Topic(t_id)
);
CREATE TABLE Question (
    q_id INT AUTO_INCREMENT PRIMARY KEY,
    q_text VARCHAR(500) NOT NULL,
    q_image LONGTEXT,
    q_marks INT NOT NULL,
    q_difficulty VARCHAR(10) NOT NULL,
    q_status VARCHAR(10) NOT NULL,
    t_id INT NOT NULL,
    p_id INT NOT NULL,
    f_id INT NOT NULL,
    FOREIGN KEY (t_id) REFERENCES Topic(t_id),
    FOREIGN KEY (p_id) REFERENCES Paper(p_id),
    FOREIGN KEY (f_id) REFERENCES Faculty(f_id)
);
CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_details VARCHAR(200) NOT NULL,
    p_id INT NOT NULL,
    c_id INT NOT NULL,
    q_id INT ,
    FOREIGN KEY (p_id) REFERENCES Paper(p_id),
    FOREIGN KEY (c_id) REFERENCES Course(c_id),
    FOREIGN KEY (q_id) REFERENCES Question(q_id)
);
