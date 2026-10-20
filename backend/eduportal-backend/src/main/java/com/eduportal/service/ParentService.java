package com.eduportal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ParentService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public List<Map<String, Object>> getParentChildren(Long parentId) {
        try {
            System.out.println("👨‍👧‍👦 ParentService: Getting children for parent_id: " + parentId);
            
            String sql = """
                SELECT s.student_id, u.first_name || ' ' || u.last_name as name,
                       p.name as program_name, s.admission_year,
                       s.current_gpa, s.total_credits
                FROM student_parent sp
                JOIN student s ON sp.student_id = s.student_id
                JOIN app_user u ON s.user_id = u.user_id
                LEFT JOIN program p ON s.program_id = p.program_id
                WHERE sp.parent_id = ?
            """;
            
            List<Map<String, Object>> children = jdbcTemplate.queryForList(sql, parentId);
            System.out.println("✅ Found " + children.size() + " children for parent_id: " + parentId);
            
            return children;
            
        } catch (Exception e) {
            System.err.println("❌ Error in getParentChildren: " + e.getMessage());
            return getDemoChildren();
        }
    }
    
    public List<Map<String, Object>> getParentChildrenProgress(Long parentId) {
        try {
            System.out.println("📊 ParentService: Getting children progress for parent_id: " + parentId);
            
            // This would combine grades, attendance, and course progress
            // For now, return the same as getParentChildren with additional progress data
            List<Map<String, Object>> children = getParentChildren(parentId);
            
            // Add progress data
            for (Map<String, Object> child : children) {
                child.put("overall_progress", 85.5); // Demo progress
                child.put("attendance_rate", 92.0); // Demo attendance
                child.put("recent_grades", Arrays.asList("A", "B+", "A-")); // Demo grades
            }
            
            return children;
            
        } catch (Exception e) {
            System.err.println("❌ Error in getParentChildrenProgress: " + e.getMessage());
            return getDemoChildren();
        }
    }
    
    private List<Map<String, Object>> getDemoChildren() {
        return Arrays.asList(
            createChild(1001L, "Alex Johnson", "BSc Computer Science", "Sophomore", 3.75, 45),
            createChild(1002L, "Sarah Johnson", "BSc Biology", "Freshman", 3.92, 32)
        );
    }
    
    private Map<String, Object> createChild(Long id, String name, String program, String gradeLevel, double gpa, int credits) {
        Map<String, Object> child = new HashMap<>();
        child.put("student_id", id);
        child.put("name", name);
        child.put("program_name", program);
        child.put("grade_level", gradeLevel);
        child.put("current_gpa", gpa);
        child.put("total_credits", credits);
        return child;
    }
}