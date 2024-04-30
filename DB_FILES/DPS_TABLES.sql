CREATE DATABASE dps;
USE dps;
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
    clo_id INT PRIMARY KEY,
    c_id INT NOT NULL,
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
    header_id INT NOT NULL,
    weightage INT NOT NULL,
    FOREIGN KEY (clo_id) REFERENCES CLO(clo_id),
    FOREIGN KEY (header_id) REFERENCES Grid_View_Headers(header_id)
);
CREATE TABLE Topic (
    t_id INT PRIMARY KEY,
    t_name VARCHAR(255) NOT NULL,
    c_id INT NOT NULL,
    FOREIGN KEY (c_id) REFERENCES Course(c_id)
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

