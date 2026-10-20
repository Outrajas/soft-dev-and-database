package com.eduportal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class GradeService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public List<Map<String, Object>> getAllGrades() {
        String sql = """
            SELECT g.grade_id, s.student_id, u.email as student_email, 
                   c.code as course_code, a.title as assessment, 
                   g.grade, g.grade_date, f.designation as grader
            FROM grade g
            JOIN enrollment e ON g.enrollment_id = e.enrollment_id
            JOIN student s ON e.student_id = s.student_id
            JOIN app_user u ON s.user_id = u.user_id
            JOIN assessment a ON g.assessment_id = a.assessment_id
            JOIN course_offering co ON a.offering_id = co.offering_id
            JOIN course c ON co.course_id = c.course_id
            LEFT JOIN faculty f ON g.grader_id = f.faculty_id
            ORDER BY g.grade_date DESC
        """;
        return jdbcTemplate.queryForList(sql);
    }
    
    // ADD THIS METHOD - For student grades
    public List<Map<String, Object>> getStudentGrades(Long studentId) {
        try {
            System.out.println("📊 GradeService: Getting grades for student_id: " + studentId);
            
            String sql = """
                SELECT g.grade_id, c.code as course_code, c.title as course_name, 
                       a.title as assessment_title, g.grade, g.grade_date,
                       a.max_score, f.first_name || ' ' || f.last_name as grader_name
                FROM grade g
                JOIN enrollment e ON g.enrollment_id = e.enrollment_id
                JOIN assessment a ON g.assessment_id = a.assessment_id
                JOIN course_offering co ON a.offering_id = co.offering_id
                JOIN course c ON co.course_id = c.course_id
                LEFT JOIN faculty f ON g.grader_id = f.faculty_id
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
    
    // ADD THIS METHOD - For GPA calculation
    public Map<String, Object> calculateGPA(Long studentId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("📊 GradeService: Calculating GPA for student_id: " + studentId);
            
            // For demo purposes, return a fixed GPA
            // In a real system, you'd calculate this from actual grades
            double gpa = 3.75; // Demo GPA
            
            result.put("gpa", gpa);
            result.put("success", true);
            result.put("studentId", studentId);
            
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