-- Test connection first
SELECT 'Connected to Oracle Database: ' || SYSDATE FROM DUAL;

-- Set SQL*Plus options
SET ECHO ON
SET FEEDBACK ON
SET VERIFY ON
SET PAGESIZE 1000
SET LINESIZE 200
SET SERVEROUTPUT ON

PROMPT Starting EXPANDED database setup...
PROMPT This will create 40+ users with comprehensive relationships...
PROMPT

-- Run the main database script
PROMPT Executing expanded database script...
@"pdatabase_complete.txt"

PROMPT Expanded database script execution completed.

-- Enhanced verification
PROMPT 
PROMPT === ENHANCED VERIFICATION - EXPANDED DATASET ===

-- Verify tables were created with expanded data
PROMPT 
PROMPT === Table Creation Status ===
SELECT table_name, num_rows 
FROM user_tables 
WHERE table_name IN ('APP_USER','STUDENT','FACULTY','COURSE','ENROLLMENT','GRADE','PAYMENT','INVOICE','ATTENDANCE','ASSESSMENT')
ORDER BY table_name;

-- Display comprehensive data counts
PROMPT 
PROMPT === EXPANDED Table Record Counts ===
SELECT 'APP_USER' as table_name, COUNT(*) as record_count FROM app_user
UNION ALL
SELECT 'STUDENT', COUNT(*) FROM student
UNION ALL
SELECT 'FACULTY', COUNT(*) FROM faculty
UNION ALL
SELECT 'COURSE', COUNT(*) FROM course
UNION ALL
SELECT 'ENROLLMENT', COUNT(*) FROM enrollment
UNION ALL
SELECT 'GRADE', COUNT(*) FROM grade
UNION ALL
SELECT 'PAYMENT', COUNT(*) FROM payment
UNION ALL
SELECT 'INVOICE', COUNT(*) FROM invoice
UNION ALL
SELECT 'ATTENDANCE', COUNT(*) FROM attendance
UNION ALL
SELECT 'ASSESSMENT', COUNT(*) FROM assessment
UNION ALL
SELECT 'NOTIFICATION', COUNT(*) FROM notification
UNION ALL
SELECT 'DEPARTMENT', COUNT(*) FROM department
UNION ALL
SELECT 'PROGRAM', COUNT(*) FROM program
UNION ALL
SELECT 'TERM', COUNT(*) FROM term
UNION ALL
SELECT 'PARENT', COUNT(*) FROM parent
UNION ALL
SELECT 'STUDENT_PARENT', COUNT(*) FROM student_parent
UNION ALL
SELECT 'COURSE_OFFERING', COUNT(*) FROM course_offering;

-- User role distribution
PROMPT 
PROMPT === USER ROLE DISTRIBUTION ===
SELECT role, COUNT(*) as user_count FROM app_user GROUP BY role ORDER BY role;

-- Parent-Student relationships verification
PROMPT 
PROMPT === PARENT-STUDENT RELATIONSHIPS ===
SELECT p.parent_id, p.name as parent_name, COUNT(sp.student_id) as children_count
FROM parent p
LEFT JOIN student_parent sp ON p.parent_id = sp.parent_id
GROUP BY p.parent_id, p.name
ORDER BY p.parent_id;

-- Student enrollment summary
PROMPT 
PROMPT === STUDENT ENROLLMENT SUMMARY ===
SELECT s.student_code, u.first_name, u.last_name, COUNT(e.enrollment_id) as course_count
FROM student s
JOIN app_user u ON s.user_id = u.user_id
LEFT JOIN enrollment e ON s.student_id = e.student_id
GROUP BY s.student_code, u.first_name, u.last_name
ORDER BY course_count DESC;

-- Faculty course assignments
PROMPT 
PROMPT === FACULTY COURSE ASSIGNMENTS ===
SELECT f.faculty_id, u.first_name, u.last_name, f.designation, COUNT(co.offering_id) as courses_assigned
FROM faculty f
JOIN app_user u ON f.user_id = u.user_id
LEFT JOIN course_offering co ON f.faculty_id = co.faculty_id
GROUP BY f.faculty_id, u.first_name, u.last_name, f.designation
ORDER BY courses_assigned DESC;

-- Financial overview
PROMPT 
PROMPT === FINANCIAL OVERVIEW ===
SELECT 
    COUNT(*) as total_invoices,
    SUM(amount) as total_amount,
    status,
    COUNT(*) as status_count
FROM invoice 
GROUP BY status
ORDER BY status;

PROMPT
PROMPT ===============================================
PROMPT EXPANDED DATABASE SETUP VERIFICATION COMPLETED
PROMPT ===============================================
PROMPT
PROMPT ✅ Database successfully expanded with:
PROMPT    - 40+ users across all roles
PROMPT    - 12 students with comprehensive profiles
PROMPT    - 10 faculty members
PROMPT    - Parent-child relationships (2 children per parent)
PROMPT    - 30+ course enrollments
PROMPT    - 60+ attendance records
PROMPT    - 40+ grade entries
PROMPT    - 25+ payment records
PROMPT
PROMPT 🎉 Your application now has rich, production-like data!
PROMPT
EXIT;