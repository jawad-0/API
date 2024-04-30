-- Get Unassigned Courses for a Faculty Member
SELECT c.*
FROM course c
LEFT JOIN assigned_course ac ON c.c_id = ac.c_id AND ac.f_id = 1
WHERE ac.ac_id IS NULL;

-- Get Papers Status for a Faculty Member
SELECT c.c_title, p.status
FROM faculty f
JOIN assigned_course ac ON f.f_id = ac.f_id
JOIN course c ON ac.c_id = c.c_id
LEFT JOIN Paper p ON c.c_id = p.c_id
WHERE f.f_id = 19;

-- Get Feedback for a Faculty Member
SELECT c.c_code, c.c_title, f.*
FROM feedback f
JOIN paper p ON f.p_id = p.p_id
JOIN course c ON f.c_id = c.c_id
JOIN assigned_course ac ON c.c_id = ac.c_id
WHERE ac.f_id = 2;

-- Get Uploaded / Approved Papers
SELECT c._code, c_title , p.*
FROM course c
JOIN paper p ON c.c_id = p.c_id
WHERE p.status = 'pending';

SELECT c._code, c_title , p.*
FROM course c
JOIN paper p ON c.c_id = p.c_id
WHERE p.status = 'approved';

-- Get Paper Header Information
SELECT * FROM paper WHERE p_id = 1;
SELECT f_name
FROM faculty f
JOIN assigned_course ac ON f.f_id = ac.f_id
JOIN course c ON ac.c_id = c.c_id
JOIN paper p ON p.c_id = c.c_id
WHERE p.p_id = 1;





