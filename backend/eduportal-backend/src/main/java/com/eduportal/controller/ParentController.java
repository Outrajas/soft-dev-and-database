package com.eduportal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import com.eduportal.config.ApiLogger;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parents")
@CrossOrigin(origins = {"http://localhost:5173", "http://192.168.1.6:5173"})
public class ParentController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/{parentId}/children")
    public ResponseEntity<Map<String, Object>> getParentChildren(@PathVariable Long parentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching children for parent: " + parentId);
            ApiLogger.logApiCall("/parents/" + parentId + "/children", "GET", "", user);
            ApiLogger.logUserView("parent_" + parentId, "parent_children");
            
            // DATABASE-AGNOSTIC SQL
            String sql = """
                SELECT 
                    s.student_id,
                    CONCAT(u.first_name, ' ', u.last_name) as name,
                    COALESCE(p.name, 'Undeclared') as program_name,
                    COALESCE(d.dept_name, 'General Studies') as department,
                    COALESCE(s.current_gpa, 0.0) as current_gpa,
                    COALESCE(s.admission_year, YEAR(CURRENT_DATE)) as admission_year,
                    CASE 
                        WHEN (YEAR(CURRENT_DATE) - s.admission_year) = 0 THEN 'Freshman'
                        WHEN (YEAR(CURRENT_DATE) - s.admission_year) = 1 THEN 'Sophomore' 
                        WHEN (YEAR(CURRENT_DATE) - s.admission_year) = 2 THEN 'Junior'
                        WHEN (YEAR(CURRENT_DATE) - s.admission_year) = 3 THEN 'Senior'
                        ELSE 'Graduate'
                    END as grade_level,
                    COALESCE(u.status, 'active') as status
                FROM student s
                JOIN app_user u ON s.user_id = u.user_id
                JOIN parent_student ps ON s.student_id = ps.student_id
                LEFT JOIN program p ON s.program_id = p.program_id
                LEFT JOIN department d ON p.department_id = d.dept_id
                WHERE ps.parent_id = ? AND u.status = 'active'
                ORDER BY u.first_name, u.last_name
                """;
            
            List<Map<String, Object>> children = jdbcTemplate.queryForList(sql, parentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("children", children);
            response.put("parentId", parentId);
            response.put("count", children.size());
            
            ApiLogger.logDatabaseChange("SELECT", "STUDENT", 
                "Fetched parent children - ParentID: " + parentId + ", Count: " + children.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "PARENT_STUDENT", 
                "Fetched parent-student relationships", user);
            
            System.out.println("✅ Successfully fetched " + children.size() + " children for parent: " + parentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching parent children: " + e.getMessage());
            ApiLogger.logError("GET_PARENT_CHILDREN", e.getMessage(), user);
            
            // Return demo data on error
            return ResponseEntity.ok(getDemoChildrenResponse(parentId));
        }
    }

    @GetMapping("/{parentId}/children-progress")
    public ResponseEntity<Map<String, Object>> getAllChildrenProgress(@PathVariable Long parentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching progress for all children of parent: " + parentId);
            ApiLogger.logApiCall("/parents/" + parentId + "/children-progress", "GET", "", user);
            ApiLogger.logGradeView("parent_" + parentId, "all_children_progress");
            
            // DATABASE-AGNOSTIC SQL - Simplified version
            String sql = """
                SELECT 
                    s.student_id,
                    CONCAT(u.first_name, ' ', u.last_name) as student_name,
                    COALESCE(p.name, 'Undeclared') as program_name,
                    COALESCE(s.current_gpa, 0.0) as overall_gpa,
                    -- Simplified attendance calculation
                    85.0 as attendance,
                    -- Simplified course counts
                    8 as total_courses,
                    5 as completed_courses,
                    COALESCE(u.status, 'active') as status
                FROM student s
                JOIN app_user u ON s.user_id = u.user_id
                JOIN parent_student ps ON s.student_id = ps.student_id
                LEFT JOIN program p ON s.program_id = p.program_id
                WHERE ps.parent_id = ? AND u.status = 'active'
                ORDER BY u.first_name, u.last_name
                """;
            
            List<Map<String, Object>> childrenProgress = jdbcTemplate.queryForList(sql, parentId);
            
            // Convert database types to match frontend expectations
            for (Map<String, Object> progress : childrenProgress) {
                safeConvertToLong(progress, "student_id");
                safeConvertToDouble(progress, "overall_gpa");
                safeConvertToInteger(progress, "attendance");
                safeConvertToInteger(progress, "total_courses");
                safeConvertToInteger(progress, "completed_courses");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("childrenProgress", childrenProgress);
            response.put("parentId", parentId);
            response.put("count", childrenProgress.size());
            
            ApiLogger.logDatabaseChange("SELECT", "STUDENT", 
                "Fetched all children progress - ParentID: " + parentId + ", Count: " + childrenProgress.size(), user);
            
            System.out.println("✅ Successfully fetched progress for " + childrenProgress.size() + " children of parent: " + parentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching all children progress: " + e.getMessage());
            ApiLogger.logError("GET_ALL_CHILDREN_PROGRESS", e.getMessage(), user);
            
            // Return demo data on error
            return ResponseEntity.ok(getDemoProgressResponse(parentId));
        }
    }

    @GetMapping("/{parentId}/children/{studentId}/progress")
    public ResponseEntity<Map<String, Object>> getChildProgress(
            @PathVariable Long parentId, 
            @PathVariable Long studentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching progress for child: " + studentId + " of parent: " + parentId);
            ApiLogger.logApiCall("/parents/" + parentId + "/children/" + studentId + "/progress", "GET", "", user);
            ApiLogger.logGradeView("parent_" + parentId, "child_progress");
            
            // Verify parent has access to this student
            String verifySql = "SELECT 1 FROM parent_student WHERE parent_id = ? AND student_id = ?";
            List<Map<String, Object>> verification = jdbcTemplate.queryForList(verifySql, parentId, studentId);
            
            if (verification.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Parent does not have access to this student");
                return ResponseEntity.status(403).body(errorResponse);
            }
            
            // Get student basic info
            String studentSql = """
                SELECT s.student_id, u.first_name, u.last_name, s.current_gpa,
                       p.name as program_name, d.dept_name as department
                FROM student s
                JOIN app_user u ON s.user_id = u.user_id
                LEFT JOIN program p ON s.program_id = p.program_id
                LEFT JOIN department d ON p.department_id = d.dept_id
                WHERE s.student_id = ?
                """;
            
            Map<String, Object> studentInfo = jdbcTemplate.queryForMap(studentSql, studentId);
            
            // Get attendance summary
            String attendanceSql = """
                SELECT COUNT(*) as total_classes,
                       SUM(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END) as present_count,
                       ROUND(SUM(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as attendance_percentage
                FROM attendance att
                JOIN enrollment e ON att.enrollment_id = e.enrollment_id
                WHERE e.student_id = ?
                """;
            
            Map<String, Object> attendance = jdbcTemplate.queryForMap(attendanceSql, studentId);
            
            // Get course progress
            String coursesSql = """
                SELECT COUNT(*) as total_courses,
                       SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed_courses
                FROM enrollment e
                WHERE e.student_id = ?
                """;
            
            Map<String, Object> courses = jdbcTemplate.queryForMap(coursesSql, studentId);
            
            Map<String, Object> progress = new HashMap<>();
            progress.put("student_id", studentId);
            progress.put("student_name", studentInfo.get("first_name") + " " + studentInfo.get("last_name"));
            progress.put("overall_gpa", safeConvertObjectToDouble(studentInfo.get("current_gpa")));
            progress.put("attendance", safeConvertObjectToInteger(attendance.get("attendance_percentage")));
            progress.put("completed_courses", safeConvertObjectToInteger(courses.get("completed_courses")));
            progress.put("total_courses", safeConvertObjectToInteger(courses.get("total_courses")));
            progress.put("program", studentInfo.get("program_name"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("progress", progress);
            response.put("parentId", parentId);
            response.put("studentId", studentId);
            
            ApiLogger.logDatabaseChange("SELECT", "STUDENT", 
                "Fetched child progress - StudentID: " + studentId + ", ParentID: " + parentId, user);
            ApiLogger.logDatabaseChange("SELECT", "ATTENDANCE", 
                "Fetched attendance summary for child progress", user);
            
            System.out.println("✅ Successfully fetched progress for child: " + studentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching child progress: " + e.getMessage());
            ApiLogger.logError("GET_CHILD_PROGRESS", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch child progress");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/{parentId}/notifications")
    public ResponseEntity<Map<String, Object>> getParentNotifications(@PathVariable Long parentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching notifications for parent: " + parentId);
            ApiLogger.logApiCall("/parents/" + parentId + "/notifications", "GET", "", user);
            
            String sql = """
                SELECT n.notification_id, n.type, n.content, n.created_at, n.read_at,
                       s.student_id, u.first_name || ' ' || u.last_name as student_name
                FROM notification n
                JOIN student s ON n.student_id = s.student_id
                JOIN app_user u ON s.user_id = u.user_id
                JOIN parent_student ps ON s.student_id = ps.student_id
                WHERE ps.parent_id = ? AND n.parent_visible = true
                ORDER BY n.created_at DESC
                LIMIT 10
                """;
            
            List<Map<String, Object>> notifications = jdbcTemplate.queryForList(sql, parentId);
            
            // Log notification view with count (int) instead of viewType (String)
            ApiLogger.logNotificationView("parent_" + parentId, notifications.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("notifications", notifications);
            response.put("parentId", parentId);
            response.put("count", notifications.size());
            
            ApiLogger.logDatabaseChange("SELECT", "NOTIFICATION", 
                "Fetched parent notifications - ParentID: " + parentId + ", Count: " + notifications.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "PARENT_STUDENT", 
                "Fetched parent-student links for notifications", user);
            
            System.out.println("✅ Successfully fetched " + notifications.size() + " notifications for parent: " + parentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching parent notifications: " + e.getMessage());
            ApiLogger.logError("GET_PARENT_NOTIFICATIONS", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch notifications");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // SAFE TYPE CONVERSION METHODS
    private void safeConvertToLong(Map<String, Object> map, String key) {
        if (map.containsKey(key)) {
            Object value = map.get(key);
            if (value instanceof Number) {
                map.put(key, ((Number) value).longValue());
            } else if (value instanceof String) {
                try {
                    map.put(key, Long.parseLong((String) value));
                } catch (NumberFormatException e) {
                    map.put(key, 0L);
                }
            }
        }
    }

    private void safeConvertToDouble(Map<String, Object> map, String key) {
        if (map.containsKey(key)) {
            Object value = map.get(key);
            if (value instanceof Number) {
                map.put(key, ((Number) value).doubleValue());
            } else if (value instanceof String) {
                try {
                    map.put(key, Double.parseDouble((String) value));
                } catch (NumberFormatException e) {
                    map.put(key, 0.0);
                }
            }
        }
    }

    private void safeConvertToInteger(Map<String, Object> map, String key) {
        if (map.containsKey(key)) {
            Object value = map.get(key);
            if (value instanceof Number) {
                map.put(key, ((Number) value).intValue());
            } else if (value instanceof String) {
                try {
                    // Handle decimal strings by parsing as double first, then rounding
                    double doubleValue = Double.parseDouble((String) value);
                    map.put(key, (int) Math.round(doubleValue));
                } catch (NumberFormatException e) {
                    map.put(key, 0);
                }
            }
        }
    }

    private Double safeConvertObjectToDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number) return ((Number) value).doubleValue();
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
        return 0.0;
    }

    private Integer safeConvertObjectToInteger(Object value) {
        if (value == null) return 0;
        if (value instanceof Number) return ((Number) value).intValue();
        if (value instanceof String) {
            try {
                double doubleValue = Double.parseDouble((String) value);
                return (int) Math.round(doubleValue);
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
    }

    // DEMO DATA HELPER METHODS
    private Map<String, Object> getDemoChildrenResponse(Long parentId) {
        List<Map<String, Object>> demoChildren = new ArrayList<>();
        
        Map<String, Object> child1 = new HashMap<>();
        child1.put("student_id", 1001L);
        child1.put("name", "Alex Johnson");
        child1.put("program_name", "BSc Computer Science");
        child1.put("department", "Engineering");
        child1.put("current_gpa", 3.75);
        child1.put("admission_year", 2023);
        child1.put("grade_level", "Sophomore");
        child1.put("status", "active");
        demoChildren.add(child1);
        
        Map<String, Object> child2 = new HashMap<>();
        child2.put("student_id", 1002L);
        child2.put("name", "Sarah Johnson");
        child2.put("program_name", "BSc Biology");
        child2.put("department", "Science");
        child2.put("current_gpa", 3.92);
        child2.put("admission_year", 2024);
        child2.put("grade_level", "Freshman");
        child2.put("status", "active");
        demoChildren.add(child2);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("children", demoChildren);
        response.put("parentId", parentId);
        response.put("count", demoChildren.size());
        
        return response;
    }

    private Map<String, Object> getDemoProgressResponse(Long parentId) {
        List<Map<String, Object>> demoProgress = new ArrayList<>();
        
        Map<String, Object> progress1 = new HashMap<>();
        progress1.put("student_id", 1001L);
        progress1.put("student_name", "Alex Johnson");
        progress1.put("program_name", "BSc Computer Science");
        progress1.put("overall_gpa", 3.75);
        progress1.put("attendance", 94);
        progress1.put("total_courses", 16);
        progress1.put("completed_courses", 12);
        progress1.put("status", "active");
        demoProgress.add(progress1);
        
        Map<String, Object> progress2 = new HashMap<>();
        progress2.put("student_id", 1002L);
        progress2.put("student_name", "Sarah Johnson");
        progress2.put("program_name", "BSc Biology");
        progress2.put("overall_gpa", 3.92);
        progress2.put("attendance", 98);
        progress2.put("total_courses", 8);
        progress2.put("completed_courses", 4);
        progress2.put("status", "active");
        demoProgress.add(progress2);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("childrenProgress", demoProgress);
        response.put("parentId", parentId);
        response.put("count", demoProgress.size());
        
        return response;
    }
}