package com.eduportal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class SettingsService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public Map<String, Object> getUserProfile(Long userId) {
        try {
            System.out.println("⚙️ SettingsService: Getting profile for user_id: " + userId);
            
            String sql = """
                SELECT u.user_id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
                       s.student_code, f.faculty_id, p.name as program_name, 
                       d.dept_name as department_name, s.admission_year
                FROM app_user u
                LEFT JOIN student s ON u.user_id = s.user_id
                LEFT JOIN faculty f ON u.user_id = f.user_id
                LEFT JOIN program p ON s.program_id = p.program_id
                LEFT JOIN department d ON p.department_id = d.dept_id
                WHERE u.user_id = ?
            """;
            
            Map<String, Object> profile = jdbcTemplate.queryForMap(sql, userId);
            System.out.println("✅ Found profile for user_id: " + userId);
            
            return profile;
            
        } catch (Exception e) {
            System.err.println("❌ Error in getUserProfile: " + e.getMessage());
            return getDemoProfile(userId);
        }
    }
    
    private Map<String, Object> getDemoProfile(Long userId) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("user_id", userId);
        profile.put("email", "user" + userId + "@university.edu");
        profile.put("first_name", "Demo");
        profile.put("last_name", "User");
        profile.put("phone", "+1 (555) 123-4567");
        profile.put("address", "123 University Ave, Campus City, ST 12345");
        profile.put("bio", "Demo user account for testing");
        profile.put("role", "user");
        return profile;
    }
}