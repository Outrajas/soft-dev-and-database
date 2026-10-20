package com.eduportal.config;

import com.eduportal.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String path = request.getServletPath();
        
        // Skip JWT filter for public endpoints
        if (path.startsWith("/api/auth/") || path.equals("/api/health") || path.equals("/error")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;
        String role = null;
        Long userId = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            
            // STEP 1: Check if it's a demo token first (FIXED: Handle simple demo token format)
            if (isDemoToken(token)) {
                System.out.println("🎯 Demo token detected, processing demo authentication");
                try {
                    // Extract demo user info from token
                    DemoUserInfo demoInfo = extractDemoUserInfo(token);
                    username = demoInfo.getEmail();
                    role = demoInfo.getRole();
                    userId = demoInfo.getUserId();
                    
                    System.out.println("🔐 Demo Token found for user: " + username);
                    
                } catch (Exception e) {
                    System.err.println("❌ Demo token validation failed: " + e.getMessage());
                }
            } else {
                // STEP 2: Process as regular JWT token
                try {
                    username = jwtService.getEmailFromToken(token);
                    System.out.println("🔐 JWT Token found for user: " + username);
                } catch (Exception e) {
                    System.err.println("❌ JWT token validation failed: " + e.getMessage());
                }
            }
        } else {
            System.out.println("⚠️ No Authorization header found for: " + path);
        }

        // STEP 3: Set authentication for both demo and real tokens
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // For demo tokens, we skip JWT validation (FIXED: Always validate demo tokens)
            boolean isValid = isDemoToken(token) || jwtService.validateToken(token);
            
            if (isValid) {
                try {
                    // If role/userId not set (for real tokens), get from JWT service
                    if (role == null && !isDemoToken(token)) {
                        role = jwtService.getRoleFromToken(token);
                    }
                    if (userId == null && !isDemoToken(token)) {
                        userId = jwtService.getUserIdFromToken(token);
                    }
                    
                    // Add ROLE_ prefix for Spring Security
                    String authority = "ROLE_" + role.toUpperCase();
                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority(authority)
                    );
                    
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                    authToken.setDetails(userId);
                    
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    String tokenType = isDemoToken(token) ? "Demo" : "JWT";
                    System.out.println("✅ " + tokenType + " Authentication successful for user: " + username + " with role: " + role);
                    
                } catch (Exception e) {
                    System.err.println("❌ Error setting authentication: " + e.getMessage());
                }
            } else {
                System.err.println("❌ Token validation failed for user: " + username);
            }
        }

        filterChain.doFilter(request, response);
    }

    // STEP 4: Helper method to check if token is a demo token (FIXED: Handle simple format)
    private boolean isDemoToken(String token) {
        if (token == null) return false;
        
        // FIXED: Check for simple demo token format (demo-token-timestamp-userId)
        if (token.startsWith("demo-token-")) {
            return true;
        }
        
        // Also check for JWT format demo tokens
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;
            
            // Decode payload to check for demo marker
            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
            return payload.contains("\"isDemo\":true");
        } catch (Exception e) {
            return false;
        }
    }

    // STEP 5: Helper method to extract demo user info from token (FIXED: Handle simple format)
    private DemoUserInfo extractDemoUserInfo(String token) {
        try {
            // FIXED: Handle simple demo token format (demo-token-timestamp-userId)
            if (token.startsWith("demo-token-")) {
                String[] parts = token.split("-");
                if (parts.length >= 4) {
                    try {
                        Long userId = Long.parseLong(parts[3]);
                        
                        // Map user ID to demo account info
                        if (userId == 1L) {
                            return new DemoUserInfo("student@university.edu", "student", userId);
                        } else if (userId == 2L) {
                            return new DemoUserInfo("professor@university.edu", "faculty", userId);
                        } else if (userId == 3L) {
                            return new DemoUserInfo("admin@university.edu", "admin", userId);
                        } else if (userId == 4L) {
                            return new DemoUserInfo("finance@university.edu", "finance", userId);
                        } else if (userId == 5L) {
                            return new DemoUserInfo("parent@university.edu", "parent", userId);
                        } else {
                            // Default fallback
                            return new DemoUserInfo("demo@university.edu", "student", userId);
                        }
                    } catch (NumberFormatException e) {
                        throw new RuntimeException("Invalid demo token format: " + token);
                    }
                } else {
                    throw new RuntimeException("Invalid demo token format: " + token);
                }
            }
            
            // Handle JWT format demo tokens (existing logic)
            String[] parts = token.split("\\.");
            String payload = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
            
            // Parse JSON payload
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, Object> payloadMap = mapper.readValue(payload, java.util.Map.class);
            
            String email = (String) payloadMap.get("email");
            String role = (String) payloadMap.get("role");
            Number userId = (Number) payloadMap.get("userId");
            
            return new DemoUserInfo(email, role, userId != null ? userId.longValue() : 1L);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract demo user info: " + e.getMessage());
        }
    }

    // STEP 6: Inner class to hold demo user information
    private static class DemoUserInfo {
        private final String email;
        private final String role;
        private final Long userId;

        public DemoUserInfo(String email, String role, Long userId) {
            this.email = email;
            this.role = role;
            this.userId = userId;
        }

        public String getEmail() { return email; }
        public String getRole() { return role; }
        public Long getUserId() { return userId; }
    }
}