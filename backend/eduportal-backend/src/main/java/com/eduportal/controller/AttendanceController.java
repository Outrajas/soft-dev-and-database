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
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/students/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentAttendance(@PathVariable Long studentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching attendance for student: " + studentId);
            ApiLogger.logApiCall("/attendance/students/" + studentId, "GET", "", user);
            ApiLogger.logAttendanceView(studentId.toString(), user);
            
            String sql = """
                SELECT c.code as course_code, c.title as course_name,
                       att.class_date, att.status,
                       COUNT(*) OVER (PARTITION BY e.enrollment_id) as total_classes,
                       SUM(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END) 
                         OVER (PARTITION BY e.enrollment_id) as present_count,
                       ROUND(SUM(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END) 
                         OVER (PARTITION BY e.enrollment_id) * 100.0 / 
                         COUNT(*) OVER (PARTITION BY e.enrollment_id), 2) as attendance_percentage
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
            System.err.println("❌ Error fetching student attendance: " + e.getMessage());
            ApiLogger.logError("GET_STUDENT_ATTENDANCE", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch attendance");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/courses/{offeringId}")
    public ResponseEntity<Map<String, Object>> getCourseAttendance(@PathVariable Long offeringId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching attendance for course offering: " + offeringId);
            ApiLogger.logApiCall("/attendance/courses/" + offeringId, "GET", "", user);
            ApiLogger.logAttendanceView("offering_" + offeringId, user);
            
            String sql = """
                SELECT s.student_id, u.first_name, u.last_name, s.student_code,
                       att.class_date, att.status,
                       COUNT(CASE WHEN att.status = 'present' THEN 1 END) 
                         OVER (PARTITION BY s.student_id) as present_count,
                       COUNT(*) OVER (PARTITION BY s.student_id) as total_classes,
                       ROUND(COUNT(CASE WHEN att.status = 'present' THEN 1 END) 
                         OVER (PARTITION BY s.student_id) * 100.0 / 
                         COUNT(*) OVER (PARTITION BY s.student_id), 2) as attendance_percentage
                FROM attendance att
                JOIN enrollment e ON att.enrollment_id = e.enrollment_id
                JOIN student s ON e.student_id = s.student_id
                JOIN app_user u ON s.user_id = u.user_id
                WHERE e.offering_id = ?
                ORDER BY u.last_name, u.first_name, att.class_date DESC
                """;
            
            List<Map<String, Object>> attendance = jdbcTemplate.queryForList(sql, offeringId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attendance", attendance);
            response.put("offeringId", offeringId);
            
            ApiLogger.logDatabaseChange("SELECT", "ATTENDANCE", 
                "Fetched course attendance - OfferingID: " + offeringId + ", Count: " + attendance.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "STUDENT", 
                "Fetched student details for course attendance", user);
            ApiLogger.logAttendanceTracking("System", "Course_" + offeringId, attendance.size());
            
            System.out.println("✅ Successfully fetched " + attendance.size() + " attendance records for course offering: " + offeringId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching course attendance: " + e.getMessage());
            ApiLogger.logError("GET_COURSE_ATTENDANCE", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch course attendance");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/mark")
    public ResponseEntity<Map<String, Object>> markAttendance(@RequestBody Map<String, Object> attendanceData) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Marking attendance: " + attendanceData);
            
            Long enrollmentId = Long.valueOf(attendanceData.get("enrollmentId").toString());
            String classDate = (String) attendanceData.get("classDate");
            String status = (String) attendanceData.get("status");
            user = attendanceData.containsKey("userId") ? attendanceData.get("userId").toString() : "faculty";
            
            ApiLogger.logApiCall("/attendance/mark", "POST", 
                "enrollmentId=" + enrollmentId + ", classDate=" + classDate + ", status=" + status, user);
            
            // Check if attendance already exists for this date
            String checkSql = "SELECT COUNT(*) FROM attendance WHERE enrollment_id = ? AND class_date = TO_DATE(?, 'YYYY-MM-DD')";
            int existingCount = jdbcTemplate.queryForObject(checkSql, Integer.class, enrollmentId, classDate);
            
            String operation = "";
            if (existingCount > 0) {
                // Update existing attendance
                String updateSql = "UPDATE attendance SET status = ? WHERE enrollment_id = ? AND class_date = TO_DATE(?, 'YYYY-MM-DD')";
                jdbcTemplate.update(updateSql, status, enrollmentId, classDate);
                operation = "UPDATE";
            } else {
                // Insert new attendance
                String insertSql = "INSERT INTO attendance (enrollment_id, class_date, status) VALUES (?, TO_DATE(?, 'YYYY-MM-DD'), ?)";
                jdbcTemplate.update(insertSql, enrollmentId, classDate, status);
                operation = "INSERT";
            }
            
            // Get student and course info for logging
            String infoSql = """
                SELECT u.first_name || ' ' || u.last_name as student_name, 
                       c.code as course_code, c.title as course_name
                FROM enrollment e
                JOIN student s ON e.student_id = s.student_id
                JOIN app_user u ON s.user_id = u.user_id
                JOIN course_offering co ON e.offering_id = co.offering_id
                JOIN course c ON co.course_id = c.course_id
                WHERE e.enrollment_id = ?
                """;
            
            Map<String, Object> info = jdbcTemplate.queryForMap(infoSql, enrollmentId);
            String studentName = (String) info.get("student_name");
            String courseCode = (String) info.get("course_code");
            
            ApiLogger.logAttendanceMark(studentName, courseCode, status, user);
            ApiLogger.logDatabaseChange(operation, "ATTENDANCE", 
                operation + " attendance for student: " + studentName + ", Course: " + courseCode + 
                ", Date: " + classDate + ", Status: " + status, user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Attendance marked successfully");
            response.put("operation", operation.toLowerCase());
            
            System.out.println("✅ Attendance marked successfully - " + operation + " for student: " + studentName);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error marking attendance: " + e.getMessage());
            ApiLogger.logError("MARK_ATTENDANCE", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to mark attendance: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/summary/{studentId}")
    public ResponseEntity<Map<String, Object>> getAttendanceSummary(@PathVariable Long studentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching attendance summary for student: " + studentId);
            ApiLogger.logApiCall("/attendance/summary/" + studentId, "GET", "", user);
            ApiLogger.logAttendanceView(studentId.toString(), "summary");
            
            String sql = """
                SELECT c.code as course_code, c.title as course_name,
                       COUNT(*) as total_classes,
                       COUNT(CASE WHEN att.status = 'present' THEN 1 END) as present_count,
                       COUNT(CASE WHEN att.status = 'absent' THEN 1 END) as absent_count,
                       COUNT(CASE WHEN att.status = 'excused' THEN 1 END) as excused_count,
                       ROUND(COUNT(CASE WHEN att.status = 'present' THEN 1 END) * 100.0 / COUNT(*), 2) as attendance_percentage
                FROM attendance att
                JOIN enrollment e ON att.enrollment_id = e.enrollment_id
                JOIN course_offering co ON e.offering_id = co.offering_id
                JOIN course c ON co.course_id = c.course_id
                WHERE e.student_id = ?
                GROUP BY c.code, c.title
                ORDER BY c.code
                """;
            
            List<Map<String, Object>> summary = jdbcTemplate.queryForList(sql, studentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attendanceSummary", summary);
            response.put("studentId", studentId);
            
            ApiLogger.logDatabaseChange("SELECT", "ATTENDANCE", 
                "Fetched attendance summary - StudentID: " + studentId + ", Courses: " + summary.size(), user);
            ApiLogger.logReportGenerate(user, "attendance_summary", 
                "Student: " + studentId + ", Courses: " + summary.size());
            
            System.out.println("✅ Successfully fetched attendance summary for student: " + studentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching attendance summary: " + e.getMessage());
            ApiLogger.logError("GET_ATTENDANCE_SUMMARY", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch attendance summary");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}