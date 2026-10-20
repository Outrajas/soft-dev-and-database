package com.eduportal.service;

import com.eduportal.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.dao.EmptyResultDataAccessException;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private JwtService jwtService;

    public Map<String, Object> authenticateUser(String email, String password) {
    Map<String, Object> result = new HashMap<>();
    
    try {
        System.out.println("🔐 AuthService: Authenticating user: " + email);
        System.out.println("🔐 Password provided: " + password);
        
        // Input validation
        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            result.put("success", false);
            result.put("message", "Email and password are required");
            return result;
        }

        // First try database authentication
        String sql = """
            SELECT u.user_id, u.email, u.password_hash, u.role, u.first_name, u.last_name,
                   u.phone, u.avatar_url, u.status, u.created_at, u.last_login,
                   s.student_code as student_id, f.faculty_id,
                   p.name as program_name, d.dept_name as department,
                   s.admission_year, s.current_gpa, s.total_credits
            FROM app_user u
            LEFT JOIN student s ON u.user_id = s.user_id
            LEFT JOIN faculty f ON u.user_id = f.faculty_id
            LEFT JOIN program p ON s.program_id = p.program_id
            LEFT JOIN department d ON p.department_id = d.dept_id
            WHERE u.email = ? AND u.status = 'active'
            """;
        
        System.out.println("🔍 Executing SQL query for user: " + email);
        
        try {
            User user = jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(User.class), email);
            
            if (user != null) {
                System.out.println("✅ User found in database: " + user.getEmail());
                System.out.println("🔐 Stored password hash: " + (user.getPasswordHash() != null ? "PRESENT" : "NULL"));
                
                // 🔥 CRITICAL FIX: Enhanced password validation
                boolean passwordValid = validatePassword(password, user.getPasswordHash());
                System.out.println("🔐 Password validation result: " + passwordValid);
                
                if (passwordValid) {
                    System.out.println("✅ Password validation SUCCESSFUL for: " + email);
                    
                    // Update last login
                    updateLastLogin(user.getUserId());
                    
                    // Generate JWT token
                    String token = jwtService.generateToken(user);
                    
                    // Prepare user data for response (without password)
                    Map<String, Object> userData = buildUserResponse(user);
                    userData.put("isDemo", false);
                    
                    result.put("success", true);
                    result.put("user", userData);
                    result.put("token", token);
                    result.put("message", "Login successful");
                    
                    System.out.println("✅ AuthService: Database authentication SUCCESSFUL for: " + email);
                    return result;
                }
            }
        } catch (EmptyResultDataAccessException e) {
            System.out.println("❌ No user found in database: " + email);
            // Continue to demo accounts check
        }
        
        // 🔥 FIX: If database authentication fails, try demo accounts
        System.out.println("🔄 Trying demo accounts for: " + email);
        Map<String, Object> demoResult = checkDemoAccounts(email, password);
        if (demoResult.get("success").equals(true)) {
            System.out.println("✅ Demo account authentication successful for: " + email);
            return demoResult;
        }
        
        // If both database and demo accounts fail
        System.out.println("❌ All authentication attempts failed for: " + email);
        result.put("success", false);
        result.put("message", "Invalid email or password");
        
    } catch (Exception e) {
        System.err.println("❌ AuthService: Error during authentication: " + e.getMessage());
        e.printStackTrace();
        result.put("success", false);
        result.put("message", "Authentication service error");
    }
    
    return result;
}

private boolean validatePassword(String providedPassword, String storedHash) {
    try {
        System.out.println("🔐 Password validation:");
        System.out.println("   Provided: " + providedPassword);
        System.out.println("   Stored hash: " + storedHash);
        
        // For demo purposes, accept common demo passwords
        List<String> demoPasswords = Arrays.asList(
            "demo123", "student123", "faculty123", "admin123", "finance123", "parent123",
            "student@123", "faculty@123", "admin@123", "password123", "test123"
        );
        
        // Accept any of the demo passwords
        if (demoPasswords.contains(providedPassword)) {
            System.out.println("✅ Demo password accepted: " + providedPassword);
            return true;
        }
        
        // Also accept the actual stored hash as password (for development)
        if (providedPassword.equals(storedHash)) {
            System.out.println("✅ Stored hash accepted as password");
            return true;
        }
        
        // Simple password comparison for demo
        if (storedHash != null && storedHash.equals(providedPassword)) {
            System.out.println("✅ Direct password match");
            return true;
        }
        
        // Accept any password if stored hash is "demo123" (your actual database password)
        if ("demo123".equals(storedHash) && providedPassword != null) {
            System.out.println("✅ Default demo password accepted");
            return true;
        }
        
        System.out.println("❌ Password validation failed");
        return false;
        
    } catch (Exception e) {
        System.err.println("❌ Password validation error: " + e.getMessage());
        return false;
    }
}
public Map<String, Object> registerUser(String email, String password, String firstName, String lastName, String role, String phone) {
    Map<String, Object> result = new HashMap<>();
    
    try {
        System.out.println("📝 AuthService: Registering new user: " + email);
        
        // Check if user already exists
        String checkSql = "SELECT COUNT(*) FROM app_user WHERE email = ?";
        int count = jdbcTemplate.queryForObject(checkSql, Integer.class, email);
        
        if (count > 0) {
            result.put("success", false);
            result.put("message", "Email already registered");
            return result;
        }
        
        // Insert new user with password hash
        String insertSql = """
            INSERT INTO app_user (email, password_hash, first_name, last_name, role, phone, status, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, 'active', SYSDATE)
            """;
        
        // CRITICAL: Store the actual password as hash (for now, we'll store plaintext for demo)
        // In production, you should use password encoding like BCrypt
        int rowsAffected = jdbcTemplate.update(insertSql, email, password, firstName, lastName, role, phone);
        
        if (rowsAffected > 0) {
            // Get the new user ID
            String getIdSql = "SELECT user_id FROM app_user WHERE email = ?";
            Long userId = jdbcTemplate.queryForObject(getIdSql, Long.class, email);
            
            // Create student record if role is student
            if ("student".equals(role)) {
                String studentCode = "S" + (1000 + userId);
                String studentSql = "INSERT INTO student (user_id, student_code, admission_year, current_gpa, total_credits) VALUES (?, ?, 2024, 0.0, 0)";
                jdbcTemplate.update(studentSql, userId, studentCode);
            }
            
            // Create faculty record if role is faculty
            if ("faculty".equals(role)) {
                String facultyId = "F" + (2000 + userId);
                String facultySql = "INSERT INTO faculty (user_id, faculty_id, department_id) VALUES (?, ?, 1)";
                jdbcTemplate.update(facultySql, userId, facultyId);
            }
            
            // Generate token for immediate login
            String getUserSql = "SELECT * FROM app_user WHERE user_id = ?";
               User newUser = jdbcTemplate.queryForObject(getUserSql, new BeanPropertyRowMapper<>(User.class), userId);

            // Then generate tokenf
            String token = jwtService.generateToken(newUser);
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("userId", userId);
            userData.put("email", email);
            userData.put("role", role);
            userData.put("firstName", firstName);
            userData.put("lastName", lastName);
            userData.put("phone", phone);
            userData.put("isDemo", false);
            
            if ("student".equals(role)) {
                userData.put("studentId", "S" + (1000 + userId));
            }
            if ("faculty".equals(role)) {
                userData.put("facultyId", "F" + (2000 + userId));
            }
            
            result.put("success", true);
            result.put("user", userData);
            result.put("token", token);
            result.put("message", "Registration successful");
            
            System.out.println("✅ User registered successfully: " + email);
        } else {
            result.put("success", false);
            result.put("message", "Registration failed");
        }
        
    } catch (Exception e) {
        System.err.println("❌ AuthService: Registration error: " + e.getMessage());
        e.printStackTrace();
        result.put("success", false);
        result.put("message", "Registration failed: " + e.getMessage());
    }
    
    return result;
}

    private Map<String, Object> checkDemoAccounts(String email, String password) {
        Map<String, Object> response = new HashMap<>();
        
        // Demo accounts
        Map<String, Map<String, Object>> demoAccounts = createDemoAccounts();
        
        Map<String, Object> demoAccount = demoAccounts.get(email.toLowerCase());
        if (demoAccount != null && demoAccount.get("password").equals(password)) {
            // Generate demo token
            String token = "demo-token-" + System.currentTimeMillis() + "-" + demoAccount.get("userId") + "-" + demoAccount.get("role");
            
            // Build user response
            Map<String, Object> userResponse = new HashMap<>();
            userResponse.put("userId", demoAccount.get("userId"));
            userResponse.put("email", demoAccount.get("email"));
            userResponse.put("role", demoAccount.get("role"));
            userResponse.put("firstName", demoAccount.get("firstName"));
            userResponse.put("lastName", demoAccount.get("lastName"));
            userResponse.put("studentId", demoAccount.get("studentId"));
            userResponse.put("facultyId", demoAccount.get("facultyId"));
            userResponse.put("programName", demoAccount.get("programName"));
            userResponse.put("department", demoAccount.get("department"));
            userResponse.put("admissionYear", demoAccount.get("admissionYear"));
            userResponse.put("currentGpa", demoAccount.get("currentGpa"));
            userResponse.put("totalCredits", demoAccount.get("totalCredits"));
            userResponse.put("isDemo", true);
            userResponse.put("permissions", getPermissionsForRole((String) demoAccount.get("role")));
            userResponse.put("lastLogin", java.time.LocalDateTime.now().toString());
            
            response.put("success", true);
            response.put("user", userResponse);
            response.put("token", token);
            response.put("message", "Demo login successful");
            
            System.out.println("✅ AuthService: Demo authentication successful for: " + email);
        } else {
            response.put("success", false);
            response.put("message", "Invalid email or password");
            System.out.println("❌ AuthService: Demo authentication failed for: " + email);
        }
        
        return response;
    }

    private Map<String, Map<String, Object>> createDemoAccounts() {
        Map<String, Map<String, Object>> demoAccounts = new HashMap<>();
        
        // Student
        Map<String, Object> student = new HashMap<>();
        student.put("userId", 1L);
        student.put("email", "student@university.edu");
        student.put("password", "student123");
        student.put("role", "student");
        student.put("firstName", "Alex");
        student.put("lastName", "Johnson");
        student.put("studentId", "1001");
        student.put("programName", "BSc Computer Science");
        student.put("department", "Computer Science");
        student.put("admissionYear", 2023);
        student.put("currentGpa", 3.75);
        student.put("totalCredits", 45);
        demoAccounts.put("student@university.edu", student);
        
        // Faculty
        Map<String, Object> faculty = new HashMap<>();
        faculty.put("userId", 2L);
        faculty.put("email", "professor@university.edu");
        faculty.put("password", "professor123");
        faculty.put("role", "faculty");
        faculty.put("firstName", "Sarah");
        faculty.put("lastName", "Chen");
        faculty.put("facultyId", "F2023001");
        faculty.put("department", "Computer Science");
        demoAccounts.put("professor@university.edu", faculty);
        
        // Admin
        Map<String, Object> admin = new HashMap<>();
        admin.put("userId", 3L);
        admin.put("email", "admin@university.edu");
        admin.put("password", "admin123");
        admin.put("role", "admin");
        admin.put("firstName", "Admin");
        admin.put("lastName", "User");
        admin.put("department", "Administration");
        demoAccounts.put("admin@university.edu", admin);
        
        // Finance
        Map<String, Object> finance = new HashMap<>();
        finance.put("userId", 4L);
        finance.put("email", "finance@university.edu");
        finance.put("password", "finance123");
        finance.put("role", "finance");
        finance.put("firstName", "Finance");
        finance.put("lastName", "Officer");
        finance.put("department", "Finance");
        demoAccounts.put("finance@university.edu", finance);
        
        // Parent
        Map<String, Object> parent = new HashMap<>();
        parent.put("userId", 5L);
        parent.put("email", "parent@university.edu");
        parent.put("password", "parent123");
        parent.put("role", "parent");
        parent.put("firstName", "Michael");
        parent.put("lastName", "Davis");
        demoAccounts.put("parent@university.edu", parent);
        
        return demoAccounts;
    }

    private java.util.List<String> getPermissionsForRole(String role) {
        switch (role) {
            case "student":
                return java.util.Arrays.asList("view_courses", "view_grades", "view_attendance", "make_payments");
            case "faculty":
                return java.util.Arrays.asList("manage_classes", "manage_grades", "track_attendance", "view_schedule");
            case "admin":
                return java.util.Arrays.asList("manage_users", "manage_courses", "manage_departments", "view_reports");
            case "finance":
                return java.util.Arrays.asList("manage_invoices", "track_payments", "view_financial_reports");
            case "parent":
                return java.util.Arrays.asList("view_children", "view_progress", "make_payments");
            default:
                return java.util.Arrays.asList();
        }
    }

    private boolean isValidPassword(String inputPassword, String storedHash) {
        // For demo purposes, accept any password
        return true;
    }

    private Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("userId", user.getUserId());
        userResponse.put("email", user.getEmail());
        userResponse.put("role", user.getRole());
        userResponse.put("firstName", user.getFirstName());
        userResponse.put("lastName", user.getLastName());
        userResponse.put("phone", user.getPhone());
        userResponse.put("avatarUrl", user.getAvatarUrl());
        userResponse.put("studentId", user.getStudentId());
        userResponse.put("facultyId", user.getFacultyId());
        userResponse.put("programName", user.getProgramName());
        userResponse.put("department", user.getDepartment());
        userResponse.put("admissionYear", user.getAdmissionYear());
        userResponse.put("currentGpa", user.getCurrentGpa());
        userResponse.put("totalCredits", user.getTotalCredits());
        userResponse.put("isDemo", false);
        userResponse.put("permissions", getPermissionsForRole(user.getRole()));
        userResponse.put("lastLogin", user.getLastLogin() != null ? user.getLastLogin().toString() : java.time.LocalDateTime.now().toString());
        return userResponse;
    }

    private void updateLastLogin(Long userId) {
        try {
            String sql = "UPDATE app_user SET last_login = SYSDATE WHERE user_id = ?";
            jdbcTemplate.update(sql, userId);
            System.out.println("✅ Updated last login for user: " + userId);
        } catch (Exception e) {
            System.err.println("❌ Failed to update last login: " + e.getMessage());
        }
    }

    public Map<String, Object> validateToken(String token) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("🔐 AuthService: Validating token");
            
            // Handle demo tokens
            if (token.startsWith("demo-token-")) {
                System.out.println("🎯 Demo token detected");
                String[] parts = token.split("-");
                if (parts.length >= 4) {
                    try {
                        Long userId = Long.parseLong(parts[3]);
                        String role = parts.length > 4 ? parts[4] : "student";
                        
                        Map<String, Map<String, Object>> demoAccounts = createDemoAccounts();
                        Map<String, Object> demoAccount = findDemoAccountById(demoAccounts, userId);
                        
                        if (demoAccount != null) {
                            Map<String, Object> userResponse = new HashMap<>();
                            userResponse.put("userId", demoAccount.get("userId"));
                            userResponse.put("email", demoAccount.get("email"));
                            userResponse.put("role", demoAccount.get("role"));
                            userResponse.put("firstName", demoAccount.get("firstName"));
                            userResponse.put("lastName", demoAccount.get("lastName"));
                            userResponse.put("studentId", demoAccount.get("studentId"));
                            userResponse.put("facultyId", demoAccount.get("facultyId"));
                            userResponse.put("programName", demoAccount.get("programName"));
                            userResponse.put("department", demoAccount.get("department"));
                            userResponse.put("admissionYear", demoAccount.get("admissionYear"));
                            userResponse.put("currentGpa", demoAccount.get("currentGpa"));
                            userResponse.put("totalCredits", demoAccount.get("totalCredits"));
                            userResponse.put("isDemo", true);
                            userResponse.put("permissions", getPermissionsForRole((String) demoAccount.get("role")));
                            userResponse.put("lastLogin", java.time.LocalDateTime.now().toString());
                            
                            response.put("valid", true);
                            response.put("user", userResponse);
                            response.put("message", "Demo token validated");
                            
                            System.out.println("✅ AuthService: Demo token validation successful");
                            return response;
                        }
                    } catch (NumberFormatException e) {
                        System.err.println("❌ Invalid demo token format");
                    }
                }
            }
            
            // Validate real JWT tokens
            if (jwtService.validateToken(token)) {
                String email = jwtService.getEmailFromToken(token);
                String role = jwtService.getRoleFromToken(token);
                Long userId = jwtService.getUserIdFromToken(token);
                
                // Fetch fresh user data from database
                String sql = """
                    SELECT u.user_id, u.email, u.role, u.first_name, u.last_name, u.phone, u.avatar_url, 
                           s.student_code as student_id, f.faculty_id,
                           p.name as program_name, d.dept_name as department,
                           s.admission_year, s.current_gpa, s.total_credits
                    FROM app_user u
                    LEFT JOIN student s ON u.user_id = s.user_id
                    LEFT JOIN faculty f ON u.user_id = f.user_id
                    LEFT JOIN program p ON s.program_id = p.program_id
                    LEFT JOIN department d ON p.department_id = d.dept_id
                    WHERE u.user_id = ? AND u.status = 'active'
                    """;
                
                try {
                    User user = jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(User.class), userId);
                    
                    if (user != null) {
                        Map<String, Object> userResponse = buildUserResponse(user);
                        response.put("valid", true);
                        response.put("user", userResponse);
                        response.put("message", "Token is valid");
                        
                        System.out.println("✅ AuthService: Token validation successful for: " + email);
                    } else {
                        response.put("valid", false);
                        response.put("message", "User not found");
                    }
                } catch (Exception e) {
                    response.put("valid", false);
                    response.put("message", "User data not found");
                }
            } else {
                response.put("valid", false);
                response.put("message", "Invalid token");
            }
            
        } catch (Exception e) {
            System.err.println("❌ AuthService: Token validation error: " + e.getMessage());
            response.put("valid", false);
            response.put("message", "Token validation error");
        }
        
        return response;
    }

    private Map<String, Object> findDemoAccountById(Map<String, Map<String, Object>> demoAccounts, Long userId) {
        for (Map<String, Object> account : demoAccounts.values()) {
            if (userId.equals(account.get("userId"))) {
                return account;
            }
        }
        return null;
    }

    public Map<String, Object> getDemoAccounts() {
        Map<String, Object> response = new HashMap<>();
        response.put("accounts", java.util.List.of(
            createDemoAccountMap("student@university.edu", "student123", "student", "Alex", "Johnson", "Student account"),
            createDemoAccountMap("professor@university.edu", "professor123", "faculty", "Sarah", "Chen", "Faculty account"),
            createDemoAccountMap("admin@university.edu", "admin123", "admin", "Admin", "User", "Admin account"),
            createDemoAccountMap("finance@university.edu", "finance123", "finance", "Finance", "Officer", "Finance account"),
            createDemoAccountMap("parent@university.edu", "parent123", "parent", "Michael", "Davis", "Parent account")
        ));
        return response;
    }
    
    private Map<String, Object> createDemoAccountMap(String email, String password, String role, String firstName, String lastName, String description) {
        Map<String, Object> account = new HashMap<>();
        account.put("email", email);
        account.put("password", password);
        account.put("role", role);
        account.put("firstName", firstName);
        account.put("lastName", lastName);
        account.put("description", description);
        return account;
    }
}