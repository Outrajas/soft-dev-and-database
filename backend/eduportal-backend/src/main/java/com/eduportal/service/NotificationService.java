package com.eduportal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class NotificationService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public List<Map<String, Object>> getUserNotifications(Long userId) {
        try {
            System.out.println("🔔 NotificationService: Getting notifications for user_id: " + userId);
            
            String sql = """
                SELECT notification_id, type, content, created_at, read_at
                FROM notification 
                WHERE user_id = ?
                ORDER BY created_at DESC
            """;
            
            List<Map<String, Object>> notifications = jdbcTemplate.queryForList(sql, userId);
            System.out.println("✅ Found " + notifications.size() + " notifications for user_id: " + userId);
            
            return notifications;
            
        } catch (Exception e) {
            System.err.println("❌ Error in getUserNotifications: " + e.getMessage());
            return getDemoNotifications(userId);
        }
    }
    
    public Map<String, Object> markNotificationAsRead(Long notificationId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("🔔 Marking notification as read: " + notificationId);
            
            String sql = "UPDATE notification SET read_at = SYSDATE WHERE notification_id = ?";
            int rowsAffected = jdbcTemplate.update(sql, notificationId);
            
            if (rowsAffected > 0) {
                result.put("success", true);
                result.put("message", "Notification marked as read");
            } else {
                result.put("success", false);
                result.put("message", "Notification not found");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error marking notification as read: " + e.getMessage());
            result.put("success", false);
            result.put("message", "Failed to mark notification as read");
        }
        
        return result;
    }
    
    public Map<String, Object> markAllNotificationsAsRead(Long userId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("🔔 Marking all notifications as read for user: " + userId);
            
            String sql = "UPDATE notification SET read_at = SYSDATE WHERE user_id = ? AND read_at IS NULL";
            int rowsAffected = jdbcTemplate.update(sql, userId);
            
            result.put("success", true);
            result.put("message", "Marked " + rowsAffected + " notifications as read");
            
        } catch (Exception e) {
            System.err.println("❌ Error marking all notifications as read: " + e.getMessage());
            result.put("success", false);
            result.put("message", "Failed to mark notifications as read");
        }
        
        return result;
    }
    
    public Map<String, Object> deleteNotification(Long notificationId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("🔔 Deleting notification: " + notificationId);
            
            String sql = "DELETE FROM notification WHERE notification_id = ?";
            int rowsAffected = jdbcTemplate.update(sql, notificationId);
            
            if (rowsAffected > 0) {
                result.put("success", true);
                result.put("message", "Notification deleted");
            } else {
                result.put("success", false);
                result.put("message", "Notification not found");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error deleting notification: " + e.getMessage());
            result.put("success", false);
            result.put("message", "Failed to delete notification");
        }
        
        return result;
    }
    
    private List<Map<String, Object>> getDemoNotifications(Long userId) {
        Map<Long, List<Map<String, Object>>> demoNotifications = new HashMap<>();
        
        demoNotifications.put(1L, Arrays.asList(
            createNotification(1L, "system", "Welcome to EduPortal! Your dashboard is ready."),
            createNotification(2L, "email", "Payment reminder: $1500 due for Spring 2024 semester")
        ));
        
        demoNotifications.put(2L, Arrays.asList(
            createNotification(3L, "push", "New assignment submissions waiting for review")
        ));
        
        return demoNotifications.getOrDefault(userId, Arrays.asList(
            createNotification(999L, "system", "Welcome to EduPortal!")
        ));
    }
    
    private Map<String, Object> createNotification(Long id, String type, String content) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("notification_id", id);
        notification.put("type", type);
        notification.put("content", content);
        notification.put("created_at", new Date().toString());
        notification.put("read_at", null);
        return notification;
    }
}