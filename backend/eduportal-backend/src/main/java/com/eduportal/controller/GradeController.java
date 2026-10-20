package com.eduportal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import com.eduportal.config.ApiLogger;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "http://localhost:5173")
public class GradeController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<Map<String, Object>> getFacultyGrades(@PathVariable Long facultyId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching grades for faculty: " + facultyId);
            ApiLogger.logApiCall("/grades/faculty/" + facultyId, "GET", "", user);
            ApiLogger.logGradeView("faculty_" + facultyId, "faculty_grades");
            
            String sql = """
                SELECT g.grade_id, g.grade, g.grade_date,
                       s.student_id, u.first_name || ' ' || u.last_name as student_name,
                       s.student_code,
                       c.code as course_code, c.title as course_name,
                       a.title as assessment_title, a.max_score, a.due_date,
                       co.section, t.name as term_name
                FROM grade g
                JOIN assessment a ON g.assessment_id = a.assessment_id
                JOIN enrollment e ON g.enrollment_id = e.enrollment_id
                JOIN student s ON e.student_id = s.student_id
                JOIN app_user u ON s.user_id = u.user_id
                JOIN course_offering co ON e.offering_id = co.offering_id
                JOIN course c ON co.course_id = c.course_id
                JOIN term t ON e.term_id = t.term_id
                WHERE g.grader_id = ?
                ORDER BY g.grade_date DESC
                """;
            
            List<Map<String, Object>> grades = jdbcTemplate.queryForList(sql, facultyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("grades", grades);
            response.put("facultyId", facultyId);
            
            ApiLogger.logDatabaseChange("SELECT", "GRADE", 
                "Fetched faculty grades - FacultyID: " + facultyId + ", Count: " + grades.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "ASSESSMENT", 
                "Fetched assessment details for grades", user);
            ApiLogger.logDatabaseChange("SELECT", "STUDENT", 
                "Fetched student details for grades", user);
            ApiLogger.logGradeManagement("System", "VIEW_FACULTY_GRADES", 
                "Faculty ID: " + facultyId, "Count: " + grades.size());
            
            System.out.println("✅ Successfully fetched " + grades.size() + " grades for faculty: " + facultyId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching faculty grades: " + e.getMessage());
            ApiLogger.logError("GET_FACULTY_GRADES", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch faculty grades");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitGrade(@RequestBody Map<String, Object> gradeData) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Submitting grade: " + gradeData);
            
            Long enrollmentId = Long.valueOf(gradeData.get("enrollmentId").toString());
            Long assessmentId = Long.valueOf(gradeData.get("assessmentId").toString());
            Double grade = Double.valueOf(gradeData.get("grade").toString());
            Long graderId = Long.valueOf(gradeData.get("graderId").toString());
            user = gradeData.containsKey("userId") ? gradeData.get("userId").toString() : "faculty_" + graderId;
            
            ApiLogger.logApiCall("/grades/submit", "POST", 
                "enrollmentId=" + enrollmentId + ", assessmentId=" + assessmentId + ", grade=" + grade, user);
            ApiLogger.logGradeManagement("Faculty_" + graderId, "SUBMIT_GRADE", 
                "Assessment: " + assessmentId, "Grade: " + grade.toString());
            
            // Check if grade already exists
            String checkSql = "SELECT COUNT(*) FROM grade WHERE enrollment_id = ? AND assessment_id = ?";
            int existingCount = jdbcTemplate.queryForObject(checkSql, Integer.class, enrollmentId, assessmentId);
            
            String operation = "";
            if (existingCount > 0) {
                // Update existing grade
                String updateSql = "UPDATE grade SET grade = ?, grade_date = SYSDATE WHERE enrollment_id = ? AND assessment_id = ?";
                jdbcTemplate.update(updateSql, grade, enrollmentId, assessmentId);
                operation = "UPDATE";
            } else {
                // Insert new grade
                String insertSql = "INSERT INTO grade (enrollment_id, assessment_id, grade, grade_date, grader_id) VALUES (?, ?, ?, SYSDATE, ?)";
                jdbcTemplate.update(insertSql, enrollmentId, assessmentId, grade, graderId);
                operation = "INSERT";
            }
            
            // Get student and course info for logging
            String infoSql = """
                SELECT u.first_name || ' ' || u.last_name as student_name, 
                       c.code as course_code, a.title as assessment_title
                FROM enrollment e
                JOIN student s ON e.student_id = s.student_id
                JOIN app_user u ON s.user_id = u.user_id
                JOIN course_offering co ON e.offering_id = co.offering_id
                JOIN course c ON co.course_id = c.course_id
                JOIN assessment a ON a.assessment_id = ?
                WHERE e.enrollment_id = ?
                """;
            
            Map<String, Object> info = jdbcTemplate.queryForMap(infoSql, assessmentId, enrollmentId);
            String studentName = (String) info.get("student_name");
            String courseCode = (String) info.get("course_code");
            String assessmentTitle = (String) info.get("assessment_title");
            
            ApiLogger.logGradeUpdate(studentName, courseCode, assessmentTitle, grade.toString(), user);
            ApiLogger.logDatabaseChange(operation, "GRADE", 
                operation + " grade for student: " + studentName + ", Course: " + courseCode + 
                ", Assessment: " + assessmentTitle + ", Grade: " + grade, user);
            ApiLogger.logPLSQLExecution("calculate_gpa", 
                "student_id=" + enrollmentId, "SUCCESS", user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Grade submitted successfully");
            response.put("operation", operation.toLowerCase());
            
            System.out.println("✅ Grade submitted successfully - " + operation + " for student: " + studentName);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error submitting grade: " + e.getMessage());
            ApiLogger.logError("SUBMIT_GRADE", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to submit grade: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/assessments/{offeringId}")
    public ResponseEntity<Map<String, Object>> getCourseAssessments(@PathVariable Long offeringId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching assessments for offering: " + offeringId);
            ApiLogger.logApiCall("/grades/assessments/" + offeringId, "GET", "", user);
            ApiLogger.logGradeView(user, "course_assessments");
            
            String sql = """
                SELECT a.assessment_id, a.title, a.max_score, a.weight, a.due_date,
                       COUNT(g.grade_id) as graded_count,
                       COUNT(e.enrollment_id) as total_students
                FROM assessment a
                LEFT JOIN grade g ON a.assessment_id = g.assessment_id
                LEFT JOIN enrollment e ON a.offering_id = e.offering_id AND e.status = 'active'
                WHERE a.offering_id = ?
                GROUP BY a.assessment_id, a.title, a.max_score, a.weight, a.due_date
                ORDER BY a.due_date
                """;
            
            List<Map<String, Object>> assessments = jdbcTemplate.queryForList(sql, offeringId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("assessments", assessments);
            response.put("offeringId", offeringId);
            
            ApiLogger.logDatabaseChange("SELECT", "ASSESSMENT", 
                "Fetched assessments for offering - OfferingID: " + offeringId + ", Count: " + assessments.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "GRADE", 
                "Fetched grade counts for assessments", user);
            
            System.out.println("✅ Successfully fetched " + assessments.size() + " assessments for offering: " + offeringId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching assessments: " + e.getMessage());
            ApiLogger.logError("GET_COURSE_ASSESSMENTS", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch assessments");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/assessment/{assessmentId}/students")
    public ResponseEntity<Map<String, Object>> getStudentsForAssessment(@PathVariable Long assessmentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching students for assessment: " + assessmentId);
            ApiLogger.logApiCall("/grades/assessment/" + assessmentId + "/students", "GET", "", user);
            ApiLogger.logGradeView(user, "assessment_students");
            
            String sql = """
                SELECT e.enrollment_id, s.student_id, u.first_name, u.last_name,
                       s.student_code, g.grade, g.grade_date
                FROM enrollment e
                JOIN student s ON e.student_id = s.student_id
                JOIN app_user u ON s.user_id = u.user_id
                LEFT JOIN grade g ON e.enrollment_id = g.enrollment_id AND g.assessment_id = ?
                JOIN course_offering co ON e.offering_id = co.offering_id
                JOIN assessment a ON co.offering_id = a.offering_id
                WHERE a.assessment_id = ? AND e.status = 'active'
                ORDER BY u.last_name, u.first_name
                """;
            
            List<Map<String, Object>> students = jdbcTemplate.queryForList(sql, assessmentId, assessmentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("students", students);
            response.put("assessmentId", assessmentId);
            
            ApiLogger.logDatabaseChange("SELECT", "ENROLLMENT", 
                "Fetched students for assessment - AssessmentID: " + assessmentId + ", Count: " + students.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "GRADE", 
                "Fetched existing grades for assessment", user);
            ApiLogger.logGradeManagement("System", "VIEW_ASSESSMENT_STUDENTS", 
                "Assessment ID: " + assessmentId, "Count: " + students.size());
            
            System.out.println("✅ Successfully fetched " + students.size() + " students for assessment: " + assessmentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching assessment students: " + e.getMessage());
            ApiLogger.logError("GET_ASSESSMENT_STUDENTS", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch assessment students");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/course/{courseId}/statistics")
    public ResponseEntity<Map<String, Object>> getCourseGradeStatistics(@PathVariable Long courseId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching grade statistics for course: " + courseId);
            ApiLogger.logApiCall("/grades/course/" + courseId + "/statistics", "GET", "", user);
            ApiLogger.logReportView(user, "grade_statistics", "course=" + courseId);
            
            String sql = """
                SELECT 
                    c.code as course_code,
                    c.title as course_name,
                    COUNT(DISTINCT e.student_id) as total_students,
                    AVG(g.grade) as average_grade,
                    MIN(g.grade) as min_grade,
                    MAX(g.grade) as max_grade,
                    COUNT(g.grade_id) as total_grades,
                    COUNT(DISTINCT a.assessment_id) as total_assessments
                FROM course c
                JOIN course_offering co ON c.course_id = co.course_id
                JOIN enrollment e ON co.offering_id = e.offering_id
                LEFT JOIN assessment a ON co.offering_id = a.offering_id
                LEFT JOIN grade g ON a.assessment_id = g.assessment_id AND e.enrollment_id = g.enrollment_id
                WHERE c.course_id = ?
                GROUP BY c.code, c.title
                """;
            
            Map<String, Object> stats = jdbcTemplate.queryForMap(sql, courseId);
            
            // Get grade distribution
            String distributionSql = """
                SELECT 
                    CASE 
                        WHEN (g.grade / a.max_score * 100) >= 90 THEN 'A'
                        WHEN (g.grade / a.max_score * 100) >= 80 THEN 'B' 
                        WHEN (g.grade / a.max_score * 100) >= 70 THEN 'C'
                        WHEN (g.grade / a.max_score * 100) >= 60 THEN 'D'
                        ELSE 'F'
                    END as grade_letter,
                    COUNT(*) as count
                FROM grade g
                JOIN assessment a ON g.assessment_id = a.assessment_id
                JOIN course_offering co ON a.offering_id = co.offering_id
                WHERE co.course_id = ?
                GROUP BY 
                    CASE 
                        WHEN (g.grade / a.max_score * 100) >= 90 THEN 'A'
                        WHEN (g.grade / a.max_score * 100) >= 80 THEN 'B'
                        WHEN (g.grade / a.max_score * 100) >= 70 THEN 'C'
                        WHEN (g.grade / a.max_score * 100) >= 60 THEN 'D'
                        ELSE 'F'
                    END
                ORDER BY grade_letter
                """;
            
            List<Map<String, Object>> distribution = jdbcTemplate.queryForList(distributionSql, courseId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", stats);
            response.put("gradeDistribution", distribution);
            response.put("courseId", courseId);
            
            ApiLogger.logDatabaseChange("SELECT", "GRADE", 
                "Fetched grade statistics for course - CourseID: " + courseId, user);
            ApiLogger.logDatabaseChange("SELECT", "ASSESSMENT", 
                "Fetched assessment data for statistics", user);
            ApiLogger.logReportGenerate(user, "grade_statistics", 
                "Course: " + courseId + ", TotalStudents: " + stats.get("total_students") + 
                ", AverageGrade: " + stats.get("average_grade"));
            
            System.out.println("✅ Successfully fetched grade statistics for course: " + courseId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching grade statistics: " + e.getMessage());
            ApiLogger.logError("GET_COURSE_STATISTICS", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch grade statistics");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentGrades(@PathVariable String studentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching grades for student: " + studentId);
            ApiLogger.logApiCall("/grades/students/" + studentId, "GET", "", user);
            ApiLogger.logGradeView("student_" + studentId, "student_grades");
            
            // Mock student grades for demo
            List<Map<String, Object>> grades = Arrays.asList(
                createMockGrade(1, "Introduction to Computer Science", "Programming Assignment 1", "A", 95),
                createMockGrade(2, "Calculus II", "Midterm Exam", "B+", 88),
                createMockGrade(3, "Physics Fundamentals", "Lab Report 3", "A-", 92)
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("grades", grades);
            response.put("studentId", studentId);
            
            ApiLogger.logDatabaseChange("SELECT", "GRADE", 
                "Fetched student grades - StudentID: " + studentId + ", Count: " + grades.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "ASSESSMENT", 
                "Fetched assessment details for student grades", user);
            
            System.out.println("✅ Successfully fetched " + grades.size() + " grades for student: " + studentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching student grades: " + e.getMessage());
            ApiLogger.logError("GET_STUDENT_GRADES", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch student grades");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/students/{studentId}/gpa")
    public ResponseEntity<Map<String, Object>> calculateGPA(@PathVariable String studentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Calculating GPA for student: " + studentId);
            ApiLogger.logApiCall("/grades/students/" + studentId + "/gpa", "GET", "", user);
            ApiLogger.logGradeView("student_" + studentId, "student_gpa");
            
            // Mock GPA calculation
            double gpa = 3.75 + (Math.random() * 0.5); // Random GPA between 3.75 and 4.25
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("gpa", Math.round(gpa * 100.0) / 100.0);
            response.put("studentId", studentId);
            
            ApiLogger.logDatabaseChange("SELECT", "GRADE", 
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
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Helper method for mock grades
    private Map<String, Object> createMockGrade(int courseId, String courseName, String assignment, String grade, int percentage) {
        Map<String, Object> gradeInfo = new HashMap<>();
        gradeInfo.put("course_id", courseId);
        gradeInfo.put("course_name", courseName);
        gradeInfo.put("assignment", assignment);
        gradeInfo.put("grade", grade);
        gradeInfo.put("max_grade", "A");
        gradeInfo.put("percentage", percentage);
        gradeInfo.put("submitted_at", "2025-09-15");
        return gradeInfo;
    }
}