SELECT clo_id FROM CLO WHERE c_id = 1 AND clo_number = 'CLO-2' AND clo_id != 1;

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

-- Get route -> getcommontopictaught
SELECT t.*
    FROM Topic t
    WHERE NOT EXISTS (
      SELECT f_id
      FROM Assigned_Course ac
      WHERE ac.c_id = 1
      AND ac.f_id NOT IN (
        SELECT DISTINCT tt.f_id
        FROM TopicTaught tt
        WHERE tt.t_id = t.t_id
      )
    )

SELECT t.t_id, COUNT(DISTINCT tt.f_id) as taught_count
FROM Topic t
JOIN TopicTaught tt ON t.t_id = tt.t_id
WHERE t.c_id = 1
GROUP BY t.t_id
HAVING taught_count = (
    SELECT COUNT(DISTINCT f.f_id)
    FROM Faculty f
    JOIN Assigned_Course ac ON f.f_id = ac.f_id
    WHERE ac.c_id = 1
)

SELECT
    t.t_id,
    COUNT(DISTINCT tt.f_id) AS taught_count,
    (SELECT COUNT(DISTINCT f.f_id)
     FROM Faculty f
     JOIN Assigned_Course ac ON f.f_id = ac.f_id
     WHERE ac.c_id = 1) AS total_teachers
FROM
    Topic t
JOIN
    TopicTaught tt ON t.t_id = tt.t_id
WHERE
    t.c_id = 1
GROUP BY
    t.t_id
HAVING
    taught_count = (SELECT COUNT(DISTINCT f.f_id)
                    FROM Faculty f
                    JOIN Assigned_Course ac ON f.f_id = ac.f_id
                    WHERE ac.c_id = 1);

SELECT
    CASE
        WHEN COUNT(DISTINCT tt.f_id) = (SELECT COUNT(DISTINCT f.f_id)
                                        FROM Faculty f
                                        JOIN Assigned_Course ac ON f.f_id = ac.f_id
                                        WHERE ac.c_id = 1)
        THEN TRUE
        ELSE FALSE
    END AS is_taught_by_all
FROM
    TopicTaught tt
WHERE
    tt.t_id = 1;

SELECT grid_view_weightage_test.*
FROM Course
JOIN CLO ON Course.c_id = CLO.c_id
JOIN grid_view_weightage_test ON CLO.clo_id = grid_view_weightage_test.clo_id
WHERE Course.c_id = 1;

SELECT gvwt.*
FROM Course
JOIN CLO ON Course.c_id = CLO.c_id
JOIN grid_view_weightage_test gvwt ON CLO.clo_id = gvwt.clo_id
WHERE Course.c_id = 1
ORDER BY CLO.CLO_number ASC;

SELECT SUM(weightage1) AS totalWeightage1,
       SUM(weightage2) AS totalWeightage2,
		 SUM(weightage3) AS totalWeightage3,
		 SUM(weightage4) AS totalWeightage4
FROM Grid_View_Weightage_Test WHERE clo_id IN (SELECT clo_id FROM CLO WHERE c_id = 1);
