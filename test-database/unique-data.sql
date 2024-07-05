-- Cara Umum
ALTER TABLE students ADD CONSTRAINT unique_student_name UNIQUE (name);

-- Menggunakan custom fungsi
-- Pertama buat fungsi untuk cek duplikasi
DELIMITER //

CREATE FUNCTION check_duplicate_student_name(new_name VARCHAR(100))
RETURNS BOOLEAN
BEGIN
    DECLARE duplicate_count INT;
    
    SELECT COUNT(*)
    INTO duplicate_count
    FROM students
    WHERE name = new_name;
    
    IF duplicate_count > 0 THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END //

DELIMITER ;

-- Kedua buat trigger
DELIMITER //

CREATE TRIGGER before_insert_student
BEFORE INSERT ON students
FOR EACH ROW
BEGIN
    IF check_duplicate_student_name(NEW.name) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Student with the same name already exists';
    END IF;
END //

DELIMITER ;
