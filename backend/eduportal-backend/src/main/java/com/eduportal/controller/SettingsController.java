package com.eduportal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import com.eduportal.config.ApiLogger;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "http://localhost:5173")
public class SettingsController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/users/{userId}/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable Long userId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching user profile: " + userId);
            ApiLogger.logApiCall("/settings/users/" + userId + "/profile", "GET", "", user);
            ApiLogger.logUserView("system", "user_profile");
            
            String sql = """
                SELECT u.user_id, u.email, u.first_name, u.last_name, u.role, u.phone, 
                       u.avatar_url, u.last_login, u.created_at,
                       s.student_code, s.current_gpa, s.total_credits,
                       p.name as program_name, d.dept_name as department,
                       s.admission_year, f.faculty_id
                FROM app_user u
                LEFT JOIN student s ON u.user_id = s.user_id
                LEFT JOIN program p ON s.program_id = p.program_id
                LEFT JOIN department d ON p.department_id = d.dept_id
                LEFT JOIN faculty f ON u.user_id = f.user_id
                WHERE u.user_id = ?
                """;
            
            Map<String, Object> profile = jdbcTemplate.queryForMap(sql, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("profile", profile);
            
            ApiLogger.logDatabaseChange("SELECT", "APP_USER", 
                "Fetched user profile - UserID: " + userId, user);
            ApiLogger.logDatabaseChange("SELECT", "STUDENT", 
                "Fetched student profile data", user);
            
            System.out.println("✅ Successfully fetched user profile: " + userId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching user profile: " + e.getMessage());
            ApiLogger.logError("GET_USER_PROFILE", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch user profile");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/users/{userId}/profile")
    public ResponseEntity<Map<String, Object>> updateUserProfile(@PathVariable Long userId, @RequestBody Map<String, Object> profileData) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Updating user profile: " + userId);
            ApiLogger.logApiCall("/settings/users/" + userId + "/profile", "PUT", 
                "firstName=" + profileData.get("firstName") + ", lastName=" + profileData.get("lastName"), user);
            
            String firstName = (String) profileData.get("firstName");
            String lastName = (String) profileData.get("lastName");
            String phone = (String) profileData.get("phone");
            String avatarUrl = (String) profileData.get("avatarUrl");
            
            String sql = "UPDATE app_user SET first_name = ?, last_name = ?, phone = ?, avatar_url = ? WHERE user_id = ?";
            int rowsAffected = jdbcTemplate.update(sql, firstName, lastName, phone, avatarUrl, userId);
            
            Map<String, Object> response = new HashMap<>();
            if (rowsAffected > 0) {
                response.put("success", true);
                response.put("message", "Profile updated successfully");
                
                ApiLogger.logUserUpdate("System", userId.toString(), "profile", "Updated personal information");
                ApiLogger.logDatabaseChange("UPDATE", "APP_USER", 
                    "Updated user profile - UserID: " + userId + ", Fields: firstName, lastName, phone, avatarUrl", user);
                
                System.out.println("✅ Successfully updated user profile: " + userId);
            } else {
                response.put("success", false);
                response.put("message", "Failed to update profile");
                
                ApiLogger.logError("UPDATE_USER_PROFILE", "No rows affected for user: " + userId, user);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error updating user profile: " + e.getMessage());
            ApiLogger.logError("UPDATE_USER_PROFILE", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/users/{userId}/password")
    public ResponseEntity<Map<String, Object>> changePassword(@PathVariable Long userId, @RequestBody Map<String, Object> passwordData) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Changing password for user: " + userId);
            ApiLogger.logApiCall("/settings/users/" + userId + "/password", "PUT", "", user);
            
            String currentPassword = (String) passwordData.get("currentPassword");
            String newPassword = (String) passwordData.get("newPassword");
            
            // Verify current password
            String verifySql = "SELECT password_hash FROM app_user WHERE user_id = ?";
            String currentHash = jdbcTemplate.queryForObject(verifySql, String.class, userId);
            
            // For demo accounts, skip password verification
            if (!currentHash.equals("demo123")) {
                // In real implementation, use password encoder
                if (!currentHash.equals(currentPassword)) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("success", false);
                    errorResponse.put("message", "Current password is incorrect");
                    
                    ApiLogger.logAuthEvent("PASSWORD_CHANGE_FAILED", userId.toString(), "Incorrect current password");
                    return ResponseEntity.status(400).body(errorResponse);
                }
            }
            
            // Update password (in real app, hash the new password)
            String updateSql = "UPDATE app_user SET password_hash = ? WHERE user_id = ?";
            int rowsAffected = jdbcTemplate.update(updateSql, newPassword, userId);
            
            Map<String, Object> response = new HashMap<>();
            if (rowsAffected > 0) {
                response.put("success", true);
                response.put("message", "Password changed successfully");
                
                ApiLogger.logUserUpdate("System", userId.toString(), "password", "Password changed");
                ApiLogger.logDatabaseChange("UPDATE", "APP_USER", 
                    "Changed password for user - UserID: " + userId, user);
                ApiLogger.logAuthEvent("PASSWORD_CHANGE_SUCCESS", userId.toString(), "Password updated successfully");
                
                System.out.println("✅ Successfully changed password for user: " + userId);
            } else {
                response.put("success", false);
                response.put("message", "Failed to change password");
                
                ApiLogger.logError("CHANGE_PASSWORD", "No rows affected for user: " + userId, user);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error changing password: " + e.getMessage());
            ApiLogger.logError("CHANGE_PASSWORD", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to change password: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/system")
    public ResponseEntity<Map<String, Object>> getSystemSettings() {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching system settings");
            ApiLogger.logApiCall("/settings/system", "GET", "", user);
            ApiLogger.logReportView("admin", "system_settings", "all");
            
            // Get counts for dashboard
            String userCountSql = "SELECT COUNT(*) FROM app_user WHERE status = 'active'";
            String studentCountSql = "SELECT COUNT(*) FROM student";
            String facultyCountSql = "SELECT COUNT(*) FROM faculty";
            String courseCountSql = "SELECT COUNT(*) FROM course";
            
            int userCount = jdbcTemplate.queryForObject(userCountSql, Integer.class);
            int studentCount = jdbcTemplate.queryForObject(studentCountSql, Integer.class);
            int facultyCount = jdbcTemplate.queryForObject(facultyCountSql, Integer.class);
            int courseCount = jdbcTemplate.queryForObject(courseCountSql, Integer.class);
            
            Map<String, Object> settings = new HashMap<>();
            settings.put("userCount", userCount);
            settings.put("studentCount", studentCount);
            settings.put("facultyCount", facultyCount);
            settings.put("courseCount", courseCount);
            settings.put("systemVersion", "1.0.0");
            settings.put("demoMode", true);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("settings", settings);
            
            ApiLogger.logDatabaseChange("SELECT", "APP_USER", 
                "Fetched system statistics - Users: " + userCount + ", Students: " + studentCount + 
                ", Faculty: " + facultyCount + ", Courses: " + courseCount, user);
            ApiLogger.logReportGenerate("admin", "system_statistics", 
                "Users: " + userCount + ", Students: " + studentCount + ", Faculty: " + facultyCount);
            
            System.out.println("✅ Successfully fetched system settings");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching system settings: " + e.getMessage());
            ApiLogger.logError("GET_SYSTEM_SETTINGS", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch system settings");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}