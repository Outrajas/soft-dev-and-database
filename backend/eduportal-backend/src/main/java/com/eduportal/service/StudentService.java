package com.eduportal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class StudentService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public List<Map<String, Object>> getAllStudents() {
        String sql = """
            SELECT s.student_id, u.email, u.first_name, u.last_name, 
                   p.name as program_name, d.dept_name as department_name,
                   s.admission_year, s.current_gpa, s.total_credits
            FROM student s
            JOIN app_user u ON s.user_id = u.user_id
            LEFT JOIN program p ON s.program_id = p.program_id
            LEFT JOIN department d ON p.department_id = d.dept_id
            ORDER BY u.first_name, u.last_name
        """;
        return jdbcTemplate.queryForList(sql);
    }
    
    public List<Map<String, Object>> getStudentCourses(Long studentId) {
        try {
            System.out.println("🎓 StudentService: Getting courses for student_id: " + studentId);
            
            String sql = """
                SELECT c.course_id, c.code as course_code, c.title as course_name, 
                       co.section, co.schedule, co.room,
                       u.first_name || ' ' || u.last_name as instructor,
                       t.name as term_name, e.enrolled_at, e.status
                FROM enrollment e
                JOIN course_offering co ON e.offering_id = co.offering_id
                JOIN course c ON co.course_id = c.course_id
                JOIN term t ON e.term_id = t.term_id
                JOIN faculty f ON co.faculty_id = f.faculty_id
                JOIN app_user u ON f.user_id = u.user_id
                WHERE e.student_id = ? AND e.status = 'active'
                ORDER BY t.start_date DESC
            """;
            
            List<Map<String, Object>> courses = jdbcTemplate.queryForList(sql, studentId);
            System.out.println("✅ Found " + courses.size() + " courses for student_id: " + studentId);
            
            return courses;
            
        } catch (Exception e) {
            System.err.println("❌ Error in getStudentCourses: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    public List<Map<String, Object>> getStudentGrades(Long studentId) {
        try {
            System.out.println("🎓 StudentService: Getting grades for student_id: " + studentId);
            
            String sql = """
                SELECT g.grade_id, c.code as course_code, c.title as course_name, 
                       a.title as assessment, g.grade, g.grade_date,
                       a.max_score, u.first_name || ' ' || u.last_name as grader_name
                FROM grade g
                JOIN enrollment e ON g.enrollment_id = e.enrollment_id
                JOIN assessment a ON g.assessment_id = a.assessment_id
                JOIN course_offering co ON a.offering_id = co.offering_id
                JOIN course c ON co.course_id = c.course_id
                LEFT JOIN faculty f ON g.grader_id = f.faculty_id
                LEFT JOIN app_user u ON f.user_id = u.user_id
                WHERE e.student_id = ?
                ORDER BY g.grade_date DESC
            """;
            
            List<Map<String, Object>> grades = jdbcTemplate.queryForList(sql, studentId);
            System.out.println("✅ Found " + grades.size() + " grades for student_id: " + studentId);
            
            return grades;
            
        } catch (Exception e) {
            System.err.println("❌ Error in getStudentGrades: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    public Map<String, Object> getStudentByUserId(Long userId) {
        try {
            System.out.println("🎓 StudentService: Getting student for user_id: " + userId);
            
            String sql = """
                SELECT s.student_id, u.user_id, u.email, u.first_name, u.last_name, 
                       p.name as program_name, d.dept_name as department_name, 
                       s.admission_year, s.phone, s.student_code,
                       s.current_gpa, s.total_credits
                FROM student s
                JOIN app_user u ON s.user_id = u.user_id
                LEFT JOIN program p ON s.program_id = p.program_id
                LEFT JOIN department d ON p.department_id = d.dept_id
                WHERE s.user_id = ?
            """;
            
            Map<String, Object> student = jdbcTemplate.queryForMap(sql, userId);
            System.out.println("✅ Found student record for user_id: " + userId);
            
            return student;
            
        } catch (Exception e) {
            System.err.println("❌ No student record found for user_id: " + userId);
            Map<String, Object> emptyStudent = new HashMap<>();
            emptyStudent.put("student_id", 0);
            emptyStudent.put("user_id", userId);
            emptyStudent.put("email", "No student record");
            emptyStudent.put("first_name", "Student");
            emptyStudent.put("last_name", "Not Found");
            emptyStudent.put("program_name", "Not enrolled");
            emptyStudent.put("department_name", "No department");
            emptyStudent.put("admission_year", 2024);
            emptyStudent.put("phone", "Not provided");
            emptyStudent.put("student_code", "N/A");
            emptyStudent.put("current_gpa", 0.0);
            emptyStudent.put("total_credits", 0);
            return emptyStudent;
        }
    }
    
    public List<Map<String, Object>> getStudentAttendance(Long studentId) {
        try {
            System.out.println("🎓 StudentService: Getting attendance for student_id: " + studentId);
            
            String sql = """
                SELECT c.code as course_code, c.title as course_name,
                       COUNT(a.attendance_id) as total_classes,
                       SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
                       ROUND(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.attendance_id), 2) as attendance_percentage
                FROM enrollment e
                JOIN course_offering co ON e.offering_id = co.offering_id
                JOIN course c ON co.course_id = c.course_id
                LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id
                WHERE e.student_id = ? AND a.attendance_id IS NOT NULL
                GROUP BY c.code, c.title
                ORDER BY c.code
            """;
            
            List<Map<String, Object>> attendance = jdbcTemplate.queryForList(sql, studentId);
            System.out.println("✅ Found " + attendance.size() + " attendance records for student_id: " + studentId);
            
            return attendance;
            
        } catch (Exception e) {
            System.err.println("❌ Error in getStudentAttendance: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    // ADD THIS METHOD - For GPA calculation
    public Map<String, Object> calculateGPA(Long studentId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("🎓 StudentService: Calculating GPA for student_id: " + studentId);
            
            // For demo purposes, return the student's current GPA from database
            String sql = "SELECT current_gpa FROM student WHERE student_id = ?";
            Double gpa = jdbcTemplate.queryForObject(sql, Double.class, studentId);
            
            if (gpa != null) {
                result.put("gpa", gpa);
                result.put("success", true);
                result.put("studentId", studentId);
            } else {
                result.put("gpa", 0.0);
                result.put("success", false);
                result.put("message", "Student not found");
            }
            
            System.out.println("✅ GPA calculated: " + gpa + " for student_id: " + studentId);
            
        } catch (Exception e) {
            System.err.println("❌ Error calculating GPA: " + e.getMessage());
            result.put("gpa", 0.0);
            result.put("success", false);
            result.put("message", "Failed to calculate GPA");
        }
        
        return result;
    }
}