package com.eduportal.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
// CHANGE THIS LINE:
import jakarta.annotation.PostConstruct;  // Changed from javax.annotation.PostConstruct
import java.io.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ApiLogger {
    
    private static final String LOG_PATH = "C:\\Users\\ojasa\\Downloads\\apilog.txt";
    private static PrintWriter logWriter;
    private static final ConcurrentHashMap<String, String> apiCalls = new ConcurrentHashMap<>();
    
    @PostConstruct
    public void initializeLogging() {
        try {
            // Initialize log file at specified path
            logWriter = new PrintWriter(new FileWriter(LOG_PATH, true));
            
            logEvent("🚀 API Logger initialized - Frontend monitoring started");
            logEvent("📁 Log file: " + LOG_PATH);
            logEvent("🎯 Tracking ALL API endpoints: attendance, grades, courses, payments, users, notifications, etc.");
            
            System.out.println("✅ API Logger Started - Monitoring ALL frontend calls...");
            System.out.println("📁 Logging to: " + LOG_PATH);
            
        } catch (IOException e) {
            System.err.println("❌ Failed to initialize API logger: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // ==================== API CALL LOGGING ====================
    public static void logApiCall(String endpoint, String method, String parameters, String user) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 📱 API_CALL - %s %s | User: %s | Parameters: %s", 
            timestamp, method, endpoint, user, parameters);
        writeToLog(logEntry);
    }
    
    // ==================== AUTHENTICATION LOGGING ====================
    public static void logAuthEvent(String event, String user, String status) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 🔐 AUTH_EVENT - %s | User: %s | Status: %s", 
            timestamp, event, user, status);
        writeToLog(logEntry);
    }
    
    // ==================== ATTENDANCE LOGGING ====================
    public static void logAttendanceView(String studentId, String user) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 📊 ATTENDANCE_VIEW - Student: %s | User: %s", 
            timestamp, studentId, user);
        writeToLog(logEntry);
    }
    
    public static void logAttendanceMark(String studentId, String course, String status, String user) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] ✅ ATTENDANCE_MARK - Student: %s | Course: %s | Status: %s | User: %s", 
            timestamp, studentId, course, status, user);
        writeToLog(logEntry);
    }
    
    public static void logAttendanceTracking(String faculty, String course, int studentsMarked) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 👨‍🏫 ATTENDANCE_TRACKING - Faculty: %s | Course: %s | Students: %d", 
            timestamp, faculty, course, studentsMarked);
        writeToLog(logEntry);
    }
    
    // ==================== GRADE LOGGING ====================
    public static void logGradeView(String studentId, String viewType) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 📝 GRADE_VIEW - Student: %s | View: %s", 
            timestamp, studentId, viewType);
        writeToLog(logEntry);
    }
    
    public static void logGradeUpdate(String studentId, String course, String assignment, String grade, String user) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] ✏️ GRADE_UPDATE - Student: %s | Course: %s | Assignment: %s | Grade: %s | User: %s", 
            timestamp, studentId, course, assignment, grade, user);
        writeToLog(logEntry);
    }
    
    public static void logGradeManagement(String faculty, String action, String details, String result) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 🎓 GRADE_MANAGEMENT - Faculty: %s | Action: %s | Details: %s | Result: %s", 
            timestamp, faculty, action, details, result);
        writeToLog(logEntry);
    }
    
    // ==================== COURSE LOGGING ====================
    public static void logCourseView(String userId, String viewType) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 📚 COURSE_VIEW - User: %s | View: %s", 
            timestamp, userId, viewType);
        writeToLog(logEntry);
    }
    
    public static void logCourseEnrollment(String studentId, String course, String user) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 🎫 COURSE_ENROLLMENT - Student: %s | Course: %s | User: %s", 
            timestamp, studentId, course, user);
        writeToLog(logEntry);
    }
    
    public static void logCourseManagement(String admin, String action, String course, String details) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] ⚙️ COURSE_MANAGEMENT - Admin: %s | Action: %s | Course: %s | Details: %s", 
            timestamp, admin, action, course, details);
        writeToLog(logEntry);
    }
    
    // ==================== PAYMENT LOGGING ====================
    public static void logPaymentEvent(String event, double amount, String user, String status) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 💰 PAYMENT_EVENT - %s | Amount: $%.2f | User: %s | Status: %s", 
            timestamp, event, amount, user, status);
        writeToLog(logEntry);
    }
    
    public static void logPaymentView(String user, String filters) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 💳 PAYMENT_VIEW - User: %s | Filters: %s", 
            timestamp, user, filters);
        writeToLog(logEntry);
    }
    
    // ==================== NOTIFICATION LOGGING ====================
    public static void logNotificationView(String user, int count) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 🔔 NOTIFICATION_VIEW - User: %s | Count: %d", 
            timestamp, user, count);
        writeToLog(logEntry);
    }
    
    public static void logNotificationMarkRead(String user, int notificationId) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] ✅ NOTIFICATION_READ - User: %s | NotificationID: %d", 
            timestamp, user, notificationId);
        writeToLog(logEntry);
    }
    
    public static void logNotificationSend(String fromUser, String toUser, String type) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 📨 NOTIFICATION_SEND - From: %s | To: %s | Type: %s", 
            timestamp, fromUser, toUser, type);
        writeToLog(logEntry);
    }
    
    // ==================== USER MANAGEMENT LOGGING ====================
    public static void logUserView(String admin, String filters) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 👥 USER_VIEW - Admin: %s | Filters: %s", 
            timestamp, admin, filters);
        writeToLog(logEntry);
    }
    
    public static void logUserCreate(String admin, String newUser, String role) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] ➕ USER_CREATE - Admin: %s | NewUser: %s | Role: %s", 
            timestamp, admin, newUser, role);
        writeToLog(logEntry);
    }
    
    public static void logUserUpdate(String admin, String targetUser, String field, String newValue) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] ✏️ USER_UPDATE - Admin: %s | Target: %s | Field: %s | NewValue: %s", 
            timestamp, admin, targetUser, field, newValue);
        writeToLog(logEntry);
    }
    
    public static void logUserDelete(String admin, String targetUser) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] ❌ USER_DELETE - Admin: %s | DeletedUser: %s", 
            timestamp, admin, targetUser);
        writeToLog(logEntry);
    }
    
    // ==================== REPORT LOGGING ====================
    public static void logReportView(String user, String reportType, String filters) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 📊 REPORT_VIEW - User: %s | Type: %s | Filters: %s", 
            timestamp, user, reportType, filters);
        writeToLog(logEntry);
    }
    
    public static void logReportGenerate(String user, String reportType, String parameters) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 🖨️ REPORT_GENERATE - User: %s | Type: %s | Parameters: %s", 
            timestamp, user, reportType, parameters);
        writeToLog(logEntry);
    }
    
    // ==================== FINANCE LOGGING ====================
    public static void logInvoiceView(String financeUser, String filters) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 🧾 INVOICE_VIEW - FinanceUser: %s | Filters: %s", 
            timestamp, financeUser, filters);
        writeToLog(logEntry);
    }
    
    public static void logFinancialReport(String financeUser, String reportType, String period) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 💹 FINANCIAL_REPORT - FinanceUser: %s | Type: %s | Period: %s", 
            timestamp, financeUser, reportType, period);
        writeToLog(logEntry);
    }
    
    // ==================== DATABASE OPERATIONS ====================
    public static void logDatabaseChange(String operation, String table, String details, String user) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] 🗄️ DB_CHANGE - %s on %s | User: %s | Details: %s", 
            timestamp, operation, table, user, details);
        writeToLog(logEntry);
    }
    
    // ==================== PL/SQL OPERATIONS ====================
    public static void logPLSQLExecution(String procedureName, String parameters, String result, String user) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] ⚡ PLSQL_EXEC - %s | User: %s | Parameters: %s | Result: %s", 
            timestamp, procedureName, user, parameters, result);
        writeToLog(logEntry);
    }
    
    // ==================== ERROR LOGGING ====================
    public static void logError(String context, String errorMessage, String user) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] ❌ ERROR - Context: %s | User: %s | Error: %s", 
            timestamp, context, user, errorMessage);
        writeToLog(logEntry);
    }
    
    // ==================== GENERIC LOGGING ====================
    private static void logEvent(String message) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
        String logEntry = String.format("[%s] %s", timestamp, message);
        writeToLog(logEntry);
    }
    
    // ==================== PRIVATE METHODS ====================
    private static synchronized void writeToLog(String logEntry) {
        if (logWriter != null) {
            logWriter.println(logEntry);
            logWriter.flush();
            System.out.println(logEntry); // Also print to console
        }
    }
    
    public static void closeLogger() {
        if (logWriter != null) {
            logEvent("🛑 API Logger stopped");
            logWriter.close();
        }
    }
}