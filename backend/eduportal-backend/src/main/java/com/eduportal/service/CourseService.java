package com.eduportal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class CourseService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public List<Map<String, Object>> getAllCourses() {
        String sql = """
            SELECT c.course_id, c.code, c.title, d.dept_name as department
            FROM course c
            LEFT JOIN department d ON c.department_id = d.dept_id
            ORDER BY c.code
        """;
        return jdbcTemplate.queryForList(sql);
    }
    
    public List<Map<String, Object>> getStudentCourses(Long studentId) {
        try {
            System.out.println("📚 CourseService: Getting courses for student_id: " + studentId);
            
            String sql = """
                SELECT c.course_id, c.code as course_code, c.title as course_name,
                       co.section, co.schedule, co.room,
                       u.first_name || ' ' || u.last_name as instructor,
                       t.name as term_name, e.enrolled_at
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
    
    public List<Map<String, Object>> getFacultyCourses(Long facultyId) {
        try {
            System.out.println("📚 CourseService: Getting courses for faculty_id: " + facultyId);
            
            String sql = """
                SELECT co.offering_id, c.code as course_code, c.title as course_name,
                       co.section, co.schedule, co.room, co.capacity,
                       t.name as term_name,
                       (SELECT COUNT(*) FROM enrollment e WHERE e.offering_id = co.offering_id) as enrolled_students
                FROM course_offering co
                JOIN course c ON co.course_id = c.course_id
                JOIN term t ON co.term_id = t.term_id
                WHERE co.faculty_id = ?
                ORDER BY t.start_date DESC
            """;
            
            List<Map<String, Object>> courses = jdbcTemplate.queryForList(sql, facultyId);
            System.out.println("✅ Found " + courses.size() + " courses for faculty_id: " + facultyId);
            
            return courses;
            
        } catch (Exception e) {
            System.err.println("❌ Error in getFacultyCourses: " + e.getMessage());
            return new ArrayList<>();
        }
    }
}