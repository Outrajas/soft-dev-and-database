package com.eduportal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "APP_USER")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "email", unique = true, nullable = false)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "role")
    private String role;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    // Additional fields from joins (NOT in database - marked as Transient)
    @Transient
    private String studentId;
    
    @Transient
    private String facultyId;
    
    @Transient
    private String department;
    
    @Transient
    private String programName;
    
    @Transient
    private Integer admissionYear;
    
    @Transient
    private Double currentGpa;
    
    @Transient
    private Integer totalCredits;

    // Default constructor
    public User() {}

    // All-args constructor for convenience
    public User(Long userId, String email, String firstName, String lastName, String role) {
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.status = "active";
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getUserId() { 
        return userId; 
    }
    
    public void setUserId(Long userId) { 
        this.userId = userId; 
    }

    public String getEmail() { 
        return email; 
    }
    
    public void setEmail(String email) { 
        this.email = email; 
    }

    public String getPasswordHash() { 
        return passwordHash; 
    }
    
    public void setPasswordHash(String passwordHash) { 
        this.passwordHash = passwordHash; 
    }

    public String getStatus() { 
        return status; 
    }
    
    public void setStatus(String status) { 
        this.status = status; 
    }

    public LocalDateTime getCreatedAt() { 
        return createdAt; 
    }
    
    public void setCreatedAt(LocalDateTime createdAt) { 
        this.createdAt = createdAt; 
    }

    public String getFirstName() { 
        return firstName; 
    }
    
    public void setFirstName(String firstName) { 
        this.firstName = firstName; 
    }

    public String getLastName() { 
        return lastName; 
    }
    
    public void setLastName(String lastName) { 
        this.lastName = lastName; 
    }

    public String getRole() { 
        return role; 
    }
    
    public void setRole(String role) { 
        this.role = role; 
    }

    public String getPhone() { 
        return phone; 
    }
    
    public void setPhone(String phone) { 
        this.phone = phone; 
    }

    public String getAvatarUrl() { 
        return avatarUrl; 
    }
    
    public void setAvatarUrl(String avatarUrl) { 
        this.avatarUrl = avatarUrl; 
    }

    public LocalDateTime getLastLogin() { 
        return lastLogin; 
    }
    
    public void setLastLogin(LocalDateTime lastLogin) { 
        this.lastLogin = lastLogin; 
    }

    public String getStudentId() { 
        return studentId; 
    }
    
    public void setStudentId(String studentId) { 
        this.studentId = studentId; 
    }

    public String getFacultyId() { 
        return facultyId; 
    }
    
    public void setFacultyId(String facultyId) { 
        this.facultyId = facultyId; 
    }

    public String getDepartment() { 
        return department; 
    }
    
    public void setDepartment(String department) { 
        this.department = department; 
    }

    public String getProgramName() { 
        return programName; 
    }
    
    public void setProgramName(String programName) { 
        this.programName = programName; 
    }

    public Integer getAdmissionYear() { 
        return admissionYear; 
    }
    
    public void setAdmissionYear(Integer admissionYear) { 
        this.admissionYear = admissionYear; 
    }

    public Double getCurrentGpa() { 
        return currentGpa; 
    }
    
    public void setCurrentGpa(Double currentGpa) { 
        this.currentGpa = currentGpa; 
    }

    public Integer getTotalCredits() { 
        return totalCredits; 
    }
    
    public void setTotalCredits(Integer totalCredits) { 
        this.totalCredits = totalCredits; 
    }

    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean isStudent() {
        return "student".equalsIgnoreCase(role);
    }

    public boolean isFaculty() {
        return "faculty".equalsIgnoreCase(role);
    }

    public boolean isAdmin() {
        return "admin".equalsIgnoreCase(role);
    }

    public boolean isFinance() {
        return "finance".equalsIgnoreCase(role);
    }

    public boolean isParent() {
        return "parent".equalsIgnoreCase(role);
    }

    public boolean isActive() {
        return "active".equalsIgnoreCase(status);
    }

    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", role='" + role + '\'' +
                ", status='" + status + '\'' +
                ", studentId='" + studentId + '\'' +
                ", facultyId='" + facultyId + '\'' +
                ", department='" + department + '\'' +
                ", programName='" + programName + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return userId != null && userId.equals(user.userId);
    }

    @Override
    public int hashCode() {
        return userId != null ? userId.hashCode() : 0;
    }
}