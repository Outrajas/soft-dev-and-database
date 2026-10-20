package com.eduportal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import com.eduportal.config.ApiLogger;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> getUserNotifications(@PathVariable Long userId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching notifications for user: " + userId);
            ApiLogger.logApiCall("/notifications/users/" + userId, "GET", "", user);
            ApiLogger.logNotificationView(userId.toString(), 0);
            
            String sql = """
                SELECT notification_id, type, content, created_at, read_at
                FROM notification 
                WHERE user_id = ?
                ORDER BY created_at DESC
                """;
            
            List<Map<String, Object>> notifications = jdbcTemplate.queryForList(sql, userId);
            
            // Count unread notifications
            String unreadSql = "SELECT COUNT(*) FROM notification WHERE user_id = ? AND read_at IS NULL";
            int unreadCount = jdbcTemplate.queryForObject(unreadSql, Integer.class, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("notifications", notifications);
            response.put("unreadCount", unreadCount);
            response.put("userId", userId);
            
            ApiLogger.logDatabaseChange("SELECT", "NOTIFICATION", 
                "Fetched user notifications - UserID: " + userId + ", Count: " + notifications.size(), user);
            ApiLogger.logNotificationView(userId.toString(), unreadCount);
            
            System.out.println("✅ Successfully fetched " + notifications.size() + " notifications for user: " + userId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching notifications: " + e.getMessage());
            ApiLogger.logError("GET_USER_NOTIFICATIONS", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch notifications");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/mark-read/{notificationId}")
    public ResponseEntity<Map<String, Object>> markNotificationAsRead(@PathVariable Long notificationId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Marking notification as read: " + notificationId);
            ApiLogger.logApiCall("/notifications/mark-read/" + notificationId, "POST", "", user);
            
            String sql = "UPDATE notification SET read_at = SYSDATE WHERE notification_id = ?";
            int rowsAffected = jdbcTemplate.update(sql, notificationId);
            
            Map<String, Object> response = new HashMap<>();
            if (rowsAffected > 0) {
                response.put("success", true);
                response.put("message", "Notification marked as read");
                
                ApiLogger.logNotificationMarkRead(user, notificationId.intValue());
                ApiLogger.logDatabaseChange("UPDATE", "NOTIFICATION", 
                    "Marked notification as read - ID: " + notificationId, user);
                
                System.out.println("✅ Successfully marked notification as read: " + notificationId);
            } else {
                response.put("success", false);
                response.put("message", "Notification not found");
                
                ApiLogger.logError("MARK_NOTIFICATION_READ", "Notification not found: " + notificationId, user);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error marking notification as read: " + e.getMessage());
            ApiLogger.logError("MARK_NOTIFICATION_READ", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to mark notification as read");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/mark-all-read/{userId}")
    public ResponseEntity<Map<String, Object>> markAllNotificationsAsRead(@PathVariable Long userId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Marking all notifications as read for user: " + userId);
            ApiLogger.logApiCall("/notifications/mark-all-read/" + userId, "POST", "", user);
            
            String sql = "UPDATE notification SET read_at = SYSDATE WHERE user_id = ? AND read_at IS NULL";
            int rowsAffected = jdbcTemplate.update(sql, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Marked " + rowsAffected + " notifications as read");
            response.put("count", rowsAffected);
            
            ApiLogger.logDatabaseChange("UPDATE", "NOTIFICATION", 
                "Marked all notifications as read - UserID: " + userId + ", Count: " + rowsAffected, user);
            ApiLogger.logNotificationMarkRead(userId.toString(), rowsAffected);
            
            System.out.println("✅ Successfully marked " + rowsAffected + " notifications as read for user: " + userId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error marking all notifications as read: " + e.getMessage());
            ApiLogger.logError("MARK_ALL_NOTIFICATIONS_READ", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to mark notifications as read");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createNotification(@RequestBody Map<String, Object> notificationData) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Creating notification: " + notificationData);
            ApiLogger.logApiCall("/notifications/create", "POST", 
                "userId=" + notificationData.get("userId") + ", type=" + notificationData.get("type"), user);
            
            Long userId = Long.valueOf(notificationData.get("userId").toString());
            String type = (String) notificationData.get("type");
            String content = (String) notificationData.get("content");
            
            String sql = "INSERT INTO notification (user_id, type, content, created_at) VALUES (?, ?, ?, SYSDATE)";
            int rowsAffected = jdbcTemplate.update(sql, userId, type, content);
            
            Map<String, Object> response = new HashMap<>();
            if (rowsAffected > 0) {
                response.put("success", true);
                response.put("message", "Notification created successfully");
                
                ApiLogger.logNotificationSend("System", userId.toString(), type);
                ApiLogger.logDatabaseChange("INSERT", "NOTIFICATION", 
                    "Created notification - UserID: " + userId + ", Type: " + type, user);
                
                System.out.println("✅ Successfully created notification for user: " + userId);
            } else {
                response.put("success", false);
                response.put("message", "Failed to create notification");
                
                ApiLogger.logError("CREATE_NOTIFICATION", "Database insert failed", user);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error creating notification: " + e.getMessage());
            ApiLogger.logError("CREATE_NOTIFICATION", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create notification: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/recent/{userId}")
    public ResponseEntity<Map<String, Object>> getRecentNotifications(@PathVariable Long userId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching recent notifications for user: " + userId);
            ApiLogger.logApiCall("/notifications/recent/" + userId, "GET", "", user);
            ApiLogger.logNotificationView(userId.toString(), 0);
            
            String sql = """
                SELECT notification_id, type, content, created_at, read_at
                FROM notification 
                WHERE user_id = ?
                ORDER BY created_at DESC
                FETCH FIRST 10 ROWS ONLY
                """;
            
            List<Map<String, Object>> notifications = jdbcTemplate.queryForList(sql, userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("notifications", notifications);
            response.put("userId", userId);
            
            ApiLogger.logDatabaseChange("SELECT", "NOTIFICATION", 
                "Fetched recent notifications - UserID: " + userId + ", Count: " + notifications.size(), user);
            
            System.out.println("✅ Successfully fetched " + notifications.size() + " recent notifications for user: " + userId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching recent notifications: " + e.getMessage());
            ApiLogger.logError("GET_RECENT_NOTIFICATIONS", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch recent notifications");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Map<String, Object>> deleteNotification(@PathVariable Long notificationId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Deleting notification: " + notificationId);
            ApiLogger.logApiCall("/notifications/" + notificationId, "DELETE", "", user);
            
            String sql = "DELETE FROM notification WHERE notification_id = ?";
            int rowsAffected = jdbcTemplate.update(sql, notificationId);
            
            Map<String, Object> response = new HashMap<>();
            if (rowsAffected > 0) {
                response.put("success", true);
                response.put("message", "Notification deleted successfully");
                
                ApiLogger.logDatabaseChange("DELETE", "NOTIFICATION", 
                    "Deleted notification - ID: " + notificationId, user);
                
                System.out.println("✅ Successfully deleted notification: " + notificationId);
            } else {
                response.put("success", false);
                response.put("message", "Notification not found");
                
                ApiLogger.logError("DELETE_NOTIFICATION", "Notification not found: " + notificationId, user);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error deleting notification: " + e.getMessage());
            ApiLogger.logError("DELETE_NOTIFICATION", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to delete notification");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}