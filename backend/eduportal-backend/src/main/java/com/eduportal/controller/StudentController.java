package com.eduportal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import com.eduportal.config.ApiLogger;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllStudents() {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching all students");
            ApiLogger.logApiCall("/students", "GET", "", user);
            ApiLogger.logUserView("admin", "all_students");
            
            String sql = """
                SELECT s.student_id, u.first_name, u.last_name, u.email, u.phone,
                       s.student_code, s.current_gpa, s.total_credits,
                       p.name as program_name, d.dept_name as department,
                       s.admission_year
                FROM student s
                JOIN app_user u ON s.user_id = u.user_id
                LEFT JOIN program p ON s.program_id = p.program_id
                LEFT JOIN department d ON p.department_id = d.dept_id
                WHERE u.status = 'active'
                """;
            
            List<Map<String, Object>> students = jdbcTemplate.queryForList(sql);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("students", students);
            response.put("count", students.size());
            
            ApiLogger.logDatabaseChange("SELECT", "STUDENT", 
                "Fetched all students - Count: " + students.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "APP_USER", 
                "Fetched user details for students", user);
            
            System.out.println("✅ Successfully fetched " + students.size() + " students");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching students: " + e.getMessage());
            ApiLogger.logError("GET_ALL_STUDENTS", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch students");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/{studentId}/courses")
    public ResponseEntity<Map<String, Object>> getStudentCourses(@PathVariable Long studentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching courses for student: " + studentId);
            ApiLogger.logApiCall("/students/" + studentId + "/courses", "GET", "", user);
            ApiLogger.logCourseView("student_" + studentId, "student_courses");
            
            String sql = """
                SELECT c.course_id, c.code, c.title, co.section, co.schedule, co.room,
                       u.first_name || ' ' || u.last_name as faculty_name,
                       t.name as term_name, e.enrolled_at, e.status
                FROM enrollment e
                JOIN course_offering co ON e.offering_id = co.offering_id
                JOIN course c ON co.course_id = c.course_id
                JOIN faculty f ON co.faculty_id = f.faculty_id
                JOIN app_user u ON f.user_id = u.user_id
                JOIN term t ON e.term_id = t.term_id
                WHERE e.student_id = ? AND e.status = 'active'
                ORDER BY t.start_date DESC
                """;
            
            List<Map<String, Object>> courses = jdbcTemplate.queryForList(sql, studentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("courses", courses);
            response.put("studentId", studentId);
            
            ApiLogger.logDatabaseChange("SELECT", "ENROLLMENT", 
                "Fetched student courses - StudentID: " + studentId + ", Count: " + courses.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "COURSE", 
                "Fetched course details for student", user);
            
            System.out.println("✅ Successfully fetched " + courses.size() + " courses for student: " + studentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching student courses: " + e.getMessage());
            ApiLogger.logError("GET_STUDENT_COURSES", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch courses");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/{studentId}/grades")
    public ResponseEntity<Map<String, Object>> getStudentGrades(@PathVariable Long studentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching grades for student: " + studentId);
            ApiLogger.logApiCall("/students/" + studentId + "/grades", "GET", "", user);
            ApiLogger.logGradeView("student_" + studentId, "student_grades");
            
            String sql = """
                SELECT c.code as course_code, c.title as course_name,
                       a.title as assessment_title, a.max_score, g.grade,
                       g.grade_date, u.first_name || ' ' || u.last_name as grader_name,
                       (g.grade / a.max_score * 100) as percentage,
                       CASE 
                         WHEN (g.grade / a.max_score * 100) >= 90 THEN 'A'
                         WHEN (g.grade / a.max_score * 100) >= 80 THEN 'B'
                         WHEN (g.grade / a.max_score * 100) >= 70 THEN 'C'
                         WHEN (g.grade / a.max_score * 100) >= 60 THEN 'D'
                         ELSE 'F'
                       END as grade_letter
                FROM grade g
                JOIN assessment a ON g.assessment_id = a.assessment_id
                JOIN enrollment e ON g.enrollment_id = e.enrollment_id
                JOIN course_offering co ON e.offering_id = co.offering_id
                JOIN course c ON co.course_id = c.course_id
                JOIN faculty f ON g.grader_id = f.faculty_id
                JOIN app_user u ON f.user_id = u.user_id
                WHERE e.student_id = ?
                ORDER BY g.grade_date DESC
                """;
            
            List<Map<String, Object>> grades = jdbcTemplate.queryForList(sql, studentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("grades", grades);
            response.put("studentId", studentId);
            
            ApiLogger.logDatabaseChange("SELECT", "GRADE", 
                "Fetched student grades - StudentID: " + studentId + ", Count: " + grades.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "ASSESSMENT", 
                "Fetched assessment details for grades", user);
            
            System.out.println("✅ Successfully fetched " + grades.size() + " grades for student: " + studentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching student grades: " + e.getMessage());
            ApiLogger.logError("GET_STUDENT_GRADES", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch grades");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/{studentId}/payments")
    public ResponseEntity<Map<String, Object>> getStudentPayments(@PathVariable Long studentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching payments for student: " + studentId);
            ApiLogger.logApiCall("/students/" + studentId + "/payments", "GET", "", user);
            ApiLogger.logPaymentView("student_" + studentId, "student_payments");
            
            String sql = """
                SELECT i.invoice_id, i.amount, i.status, i.due_date, i.created_at,
                       t.name as term_name,
                       p.payment_id, p.amount as payment_amount, p.paid_on, 
                       p.method, p.notes
                FROM invoice i
                LEFT JOIN term t ON i.term_id = t.term_id
                LEFT JOIN payment p ON i.invoice_id = p.invoice_id
                WHERE i.student_id = ?
                ORDER BY i.due_date DESC, p.paid_on DESC
                """;
            
            List<Map<String, Object>> payments = jdbcTemplate.queryForList(sql, studentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payments", payments);
            response.put("studentId", studentId);
            
            ApiLogger.logDatabaseChange("SELECT", "INVOICE", 
                "Fetched student invoices - StudentID: " + studentId + ", Count: " + payments.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "PAYMENT", 
                "Fetched payment details for student", user);
            
            System.out.println("✅ Successfully fetched " + payments.size() + " payments for student: " + studentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching student payments: " + e.getMessage());
            ApiLogger.logError("GET_STUDENT_PAYMENTS", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch payments");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/{studentId}/gpa")
    public ResponseEntity<Map<String, Object>> calculateGPA(@PathVariable Long studentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Calculating GPA for student: " + studentId);
            ApiLogger.logApiCall("/students/" + studentId + "/gpa", "GET", "", user);
            ApiLogger.logGradeView("student_" + studentId, "student_gpa");
            
            // Get current GPA from student table
            String sql = "SELECT current_gpa FROM student WHERE student_id = ?";
            Double gpa = jdbcTemplate.queryForObject(sql, Double.class, studentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("gpa", gpa != null ? gpa : 0.0);
            response.put("studentId", studentId);
            
            ApiLogger.logDatabaseChange("SELECT", "STUDENT", 
                "Calculated GPA for student - StudentID: " + studentId + ", GPA: " + gpa, user);
            ApiLogger.logPLSQLExecution("calculate_gpa", 
                "student_id=" + studentId, "GPA: " + gpa, user);
            
            System.out.println("✅ Successfully calculated GPA for student: " + studentId + " - GPA: " + gpa);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error calculating GPA: " + e.getMessage());
            ApiLogger.logError("CALCULATE_GPA", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to calculate GPA");
            errorResponse.put("gpa", 0.0);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/{studentId}/attendance")
    public ResponseEntity<Map<String, Object>> getStudentAttendance(@PathVariable Long studentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching attendance for student: " + studentId);
            ApiLogger.logApiCall("/students/" + studentId + "/attendance", "GET", "", user);
            ApiLogger.logAttendanceView(studentId.toString(), user);
            
            String sql = """
                SELECT c.code as course_code, c.title as course_name,
                       att.class_date, att.status,
                       COUNT(*) OVER (PARTITION BY e.enrollment_id) as total_classes,
                       SUM(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END) 
                         OVER (PARTITION BY e.enrollment_id) as present_count
                FROM attendance att
                JOIN enrollment e ON att.enrollment_id = e.enrollment_id
                JOIN course_offering co ON e.offering_id = co.offering_id
                JOIN course c ON co.course_id = c.course_id
                WHERE e.student_id = ?
                ORDER BY att.class_date DESC
                """;
            
            List<Map<String, Object>> attendance = jdbcTemplate.queryForList(sql, studentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attendance", attendance);
            response.put("studentId", studentId);
            
            ApiLogger.logDatabaseChange("SELECT", "ATTENDANCE", 
                "Fetched student attendance - StudentID: " + studentId + ", Count: " + attendance.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "ENROLLMENT", 
                "Fetched enrollment data for attendance", user);
            
            System.out.println("✅ Successfully fetched " + attendance.size() + " attendance records for student: " + studentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching attendance: " + e.getMessage());
            ApiLogger.logError("GET_STUDENT_ATTENDANCE", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch attendance");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}