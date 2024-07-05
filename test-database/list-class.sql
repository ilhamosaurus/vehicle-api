SELECT 
    teachers.name AS teacher_name,
    GROUP_CONCAT(classes.name SEPARATOR ', ') AS class_names
FROM 
    classes
JOIN 
    teachers ON classes.teacher_id = teachers.id
GROUP BY 
    teachers.name
HAVING 
    COUNT(classes.id) > 1;
