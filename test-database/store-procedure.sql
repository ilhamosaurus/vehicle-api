DELIMITER //

CREATE PROCEDURE GetStudentClassTeacher()
BEGIN
    SELECT 
        students.name AS student_name,
        students.age,
        classes.name AS class_name,
        teachers.name AS teacher_name,
        teachers.subject
    FROM 
        students
    JOIN 
        classes ON students.class_id = classes.id
    JOIN 
        teachers ON classes.teacher_id = teachers.id;
END //

DELIMITER ;

CALL GetStudentClassTeacher();
