package com.eduportal.controller;

import com.eduportal.service.AuthService;
import com.eduportal.service.JwtService;
import com.eduportal.config.ApiLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtService jwtService;

    // CRITICAL: The /me endpoint that frontend expects - ENHANCED VERSION
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String userEmail = "Unknown";
        try {
            System.out.println("🔐 /me endpoint called");
            ApiLogger.logApiCall("/auth/me", "GET", "", "Unknown");
            
            System.out.println("📋 Request details - Authorization header: " + (authHeader != null ? "PRESENT" : "MISSING"));
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("❌ No valid Authorization header");
                ApiLogger.logAuthEvent("TOKEN_VALIDATION_FAILED", "Unknown", "Missing or invalid Authorization header");
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Authorization header missing or invalid");
                response.put("error", "MISSING_TOKEN");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            String token = authHeader.substring(7);
            System.out.println("🔐 Validating token for /me endpoint");
            System.out.println("📋 Token preview: " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));
            
            // Check if it's a demo token
            if (token.startsWith("demo-token-")) {
                System.out.println("🎯 Demo token detected in /me endpoint");
                ApiLogger.logAuthEvent("DEMO_TOKEN_VALIDATION", "DemoUser", "Demo token detected");
                
                // For demo tokens, we need to extract user info from the token pattern
                // demo-token-{timestamp}-{userId}-{role}
                String[] parts = token.split("-");
                if (parts.length >= 4) {
                    try {
                        Long userId = Long.parseLong(parts[3]);
                        String role = parts.length > 4 ? parts[4] : "student";
                        userEmail = "demo" + userId + "@university.edu";
                        
                        // Create demo user response
                        Map<String, Object> demoUser = new HashMap<>();
                        demoUser.put("userId", userId);
                        demoUser.put("email", userEmail);
                        demoUser.put("role", role);
                        demoUser.put("firstName", "Demo");
                        demoUser.put("lastName", "User");
                        demoUser.put("isDemo", true);
                        
                        Map<String, Object> successResponse = new HashMap<>();
                        successResponse.put("success", true);
                        successResponse.put("user", demoUser);
                        
                        ApiLogger.logAuthEvent("DEMO_TOKEN_VALIDATION_SUCCESS", userEmail, "Demo user session validated");
                        ApiLogger.logDatabaseChange("SELECT", "APP_USER", "Demo user session validation for: " + userEmail, userEmail);
                        
                        System.out.println("✅ /me demo token validation successful for user: " + userId);
                        return ResponseEntity.ok(successResponse);
                    } catch (NumberFormatException e) {
                        System.err.println("❌ Invalid demo token format");
                        ApiLogger.logError("DEMO_TOKEN_VALIDATION", "Invalid demo token format: " + token, "Unknown");
                    }
                }
            }
            
            Map<String, Object> validationResult = authService.validateToken(token);
            
            if ((Boolean) validationResult.get("valid")) {
                Map<String, Object> user = (Map<String, Object>) validationResult.get("user");
                userEmail = (String) user.get("email");
                
                Map<String, Object> successResponse = new HashMap<>();
                successResponse.put("success", true);
                successResponse.put("user", user);
                
                ApiLogger.logAuthEvent("TOKEN_VALIDATION_SUCCESS", userEmail, "User session validated");
                ApiLogger.logDatabaseChange("SELECT", "APP_USER", "User session validation for: " + userEmail, userEmail);
                
                System.out.println("✅ /me validation successful for real user: " + userEmail);
                return ResponseEntity.ok(successResponse);
            } else {
                ApiLogger.logAuthEvent("TOKEN_VALIDATION_FAILED", "Unknown", "Invalid token");
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Invalid token");
                errorResponse.put("error", "INVALID_TOKEN");
                System.out.println("❌ /me validation failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
        } catch (Exception e) {
            System.err.println("❌ /me endpoint error: " + e.getMessage());
            ApiLogger.logError("GET_CURRENT_USER", e.getMessage(), userEmail);
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to validate user session");
            errorResponse.put("error", "SERVER_ERROR");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ENHANCED login endpoint with better error handling
    @PostMapping("/login")
public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
    String email = "Unknown";
    try {
        email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        System.out.println("🔐 REAL LOGIN attempt for: " + email);
        ApiLogger.logApiCall("/auth/login", "POST", "email=" + email, "Unknown");
        
        System.out.println("📋 Login details - Email: " + email + ", Password provided: " + (password != null ? "YES" : "NO"));
        
        // STRICT Input validation
        if (email == null || email.trim().isEmpty()) {
            System.out.println("❌ Login failed: Email is required");
            ApiLogger.logAuthEvent("LOGIN_FAILED", "Unknown", "Email is required");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Email is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        if (password == null || password.trim().isEmpty()) {
            System.out.println("❌ Login failed: Password is required for: " + email);
            ApiLogger.logAuthEvent("LOGIN_FAILED", email, "Password is required");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Password is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        // Call the authentication service - NO DEMO BYPASS, NO FALLBACKS
        System.out.println("🔐 Calling AuthService.authenticateUser for: " + email);
        Map<String, Object> result = authService.authenticateUser(email, password);
        
        if ((Boolean) result.get("success")) {
            Map<String, Object> user = (Map<String, Object>) result.get("user");
            String userRole = (String) user.get("role");
            
            ApiLogger.logAuthEvent("LOGIN_SUCCESS", email, "User authenticated as " + userRole);
            ApiLogger.logDatabaseChange("SELECT", "APP_USER", "User authentication: " + email, email);
            ApiLogger.logDatabaseChange("UPDATE", "APP_USER", "Update last login for: " + email, email);
            
            System.out.println("✅ LOGIN SUCCESSFUL for: " + email);
            System.out.println("🔑 Token generated: " + (result.get("token") != null ? "YES" : "NO"));
            return ResponseEntity.ok(result);
        } else {
            String failureMessage = (String) result.get("message");
            System.out.println("❌ LOGIN FAILED for: " + email + " - " + failureMessage);
            ApiLogger.logAuthEvent("LOGIN_FAILED", email, failureMessage);
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
        
    } catch (Exception e) {
        System.err.println("❌ Login error for " + email + ": " + e.getMessage());
        ApiLogger.logError("LOGIN", e.getMessage(), email);
        e.printStackTrace();
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", "Login service error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}

    // ENHANCED demo accounts endpoint
    @GetMapping("/demo-accounts")
    public ResponseEntity<Map<String, Object>> getDemoAccounts() {
        try {
            System.out.println("🌐 Fetching demo accounts");
            ApiLogger.logApiCall("/auth/demo-accounts", "GET", "", "Unknown");
            
            Map<String, Object> demoAccounts = authService.getDemoAccounts();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("accounts", demoAccounts.get("accounts"));
            response.put("count", ((java.util.List<?>) demoAccounts.get("accounts")).size());
            
            ApiLogger.logDatabaseChange("SELECT", "DEMO_ACCOUNTS", "Fetch demo accounts list", "System");
            
            System.out.println("✅ Demo accounts fetched successfully, count: " + ((java.util.List<?>) demoAccounts.get("accounts")).size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Demo accounts error: " + e.getMessage());
            ApiLogger.logError("DEMO_ACCOUNTS", e.getMessage(), "Unknown");
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch demo accounts");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ENHANCED token validation endpoint
    @GetMapping("/validate-token")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestHeader(value = "Authorization", required = false) String token) {
        String userEmail = "Unknown";
        try {
            System.out.println("🔐 Validate token endpoint called");
            ApiLogger.logApiCall("/auth/validate-token", "GET", "", "Unknown");
            
            if (token == null || !token.startsWith("Bearer ")) {
                ApiLogger.logAuthEvent("TOKEN_VALIDATION_FAILED", "Unknown", "Missing Authorization header");
                
                Map<String, Object> response = new HashMap<>();
                response.put("valid", false);
                response.put("message", "Authorization header missing or invalid");
                response.put("error", "MISSING_TOKEN");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            token = token.substring(7);
            System.out.println("📋 Token preview: " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));
            
            // Handle demo tokens
            if (token.startsWith("demo-token-")) {
                System.out.println("🎯 Demo token validation request");
                ApiLogger.logAuthEvent("DEMO_TOKEN_VALIDATION", "DemoUser", "Demo token validation request");
                
                Map<String, Object> demoResponse = new HashMap<>();
                demoResponse.put("valid", true);
                demoResponse.put("message", "Demo token validated");
                demoResponse.put("isDemo", true);
                return ResponseEntity.ok(demoResponse);
            }
            
            Map<String, Object> result = authService.validateToken(token);
            
            if ((Boolean) result.get("valid")) {
                Map<String, Object> user = (Map<String, Object>) result.get("user");
                userEmail = (String) user.get("email");
                
                ApiLogger.logAuthEvent("TOKEN_VALIDATION_SUCCESS", userEmail, "Token validated successfully");
                ApiLogger.logDatabaseChange("SELECT", "APP_USER", "Token validation for: " + userEmail, userEmail);
                
                System.out.println("✅ Token validation successful for: " + userEmail);
                return ResponseEntity.ok(result);
            } else {
                ApiLogger.logAuthEvent("TOKEN_VALIDATION_FAILED", "Unknown", "Invalid token");
                
                System.out.println("❌ Token validation failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Token validation error: " + e.getMessage());
            ApiLogger.logError("TOKEN_VALIDATION", e.getMessage(), userEmail);
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valid", false);
            errorResponse.put("message", "Token validation failed");
            errorResponse.put("error", "SERVER_ERROR");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ENHANCED health check
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        ApiLogger.logApiCall("/auth/health", "GET", "", "System");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "EduPortal Auth Service");
        response.put("timestamp", System.currentTimeMillis());
        response.put("authentication", "JWT Token Based");
        response.put("version", "1.0.0");
        response.put("demoMode", true);
        return ResponseEntity.ok(response);
    }

    // FIXED: Real registration endpoint
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> registerRequest) {
        String email = "Unknown";
        try {
            email = registerRequest.get("email");
            String password = registerRequest.get("password");
            String firstName = registerRequest.get("firstName");
            String lastName = registerRequest.get("lastName");
            String role = registerRequest.get("role");
            String phone = registerRequest.get("phone");
            
            System.out.println("📝 REAL Registration attempt for: " + email);
            ApiLogger.logApiCall("/auth/register", "POST", 
                "email=" + email + ", firstName=" + firstName + ", role=" + role, "Unknown");
            
            System.out.println("📋 Registration details - Name: " + firstName + " " + lastName + ", Role: " + role);
            
            // Basic validation
            if (email == null || email.trim().isEmpty()) {
                ApiLogger.logAuthEvent("REGISTRATION_FAILED", "Unknown", "Email is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(createErrorResponse("Email is required"));
            }
            
            if (password == null || password.trim().isEmpty()) {
                ApiLogger.logAuthEvent("REGISTRATION_FAILED", email, "Password is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(createErrorResponse("Password is required"));
            }
            
            if (firstName == null || firstName.trim().isEmpty()) {
                ApiLogger.logAuthEvent("REGISTRATION_FAILED", email, "First name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(createErrorResponse("First name is required"));
            }
            
            if (lastName == null || lastName.trim().isEmpty()) {
                ApiLogger.logAuthEvent("REGISTRATION_FAILED", email, "Last name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(createErrorResponse("Last name is required"));
            }
            
            // Use the REAL registration service
            Map<String, Object> result = authService.registerUser(email, password, firstName, lastName, role, phone);
            
            if ((Boolean) result.get("success")) {
                ApiLogger.logAuthEvent("REGISTRATION_SUCCESS", email, "New user registered as " + role);
                ApiLogger.logDatabaseChange("INSERT", "APP_USER", "New user registration: " + email, email);
                ApiLogger.logUserCreate("System", email, role);
                
                System.out.println("✅ REAL Registration successful for: " + email);
                return ResponseEntity.ok(result);
            } else {
                ApiLogger.logAuthEvent("REGISTRATION_FAILED", email, "Registration failed: " + result.get("message"));
                
                System.out.println("❌ Registration failed for: " + email + " - " + result.get("message"));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Registration error: " + e.getMessage());
            ApiLogger.logError("REGISTRATION", e.getMessage(), email);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Registration failed: " + e.getMessage()));
        }
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}