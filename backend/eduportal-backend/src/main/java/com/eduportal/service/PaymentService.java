package com.eduportal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class PaymentService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public List<Map<String, Object>> getAllPayments() {
        String sql = """
            SELECT p.payment_id, u.email as student_email, i.amount as invoice_amount,
                   p.amount as paid_amount, p.paid_on, p.method, p.notes,
                   i.status as invoice_status
            FROM payment p
            JOIN invoice i ON p.invoice_id = i.invoice_id
            JOIN student s ON i.student_id = s.student_id
            JOIN app_user u ON s.user_id = u.user_id
            ORDER BY p.paid_on DESC
        """;
        return jdbcTemplate.queryForList(sql);
    }
    
    public Map<String, Object> getStudentPayments(Long userId) {
        try {
            System.out.println("💰 PaymentService: Getting payments for user_id: " + userId);
            
            // Get the actual student_id from the database
            String studentIdSql = "SELECT student_id FROM student WHERE user_id = ?";
            Long studentId;
            
            try {
                studentId = jdbcTemplate.queryForObject(studentIdSql, Long.class, userId);
                System.out.println("✅ Mapped user_id " + userId + " to student_id: " + studentId);
            } catch (EmptyResultDataAccessException e) {
                System.out.println("❌ No student found for user_id: " + userId);
                Map<String, Object> result = new HashMap<>();
                result.put("payments", new ArrayList<>());
                result.put("success", true);
                return result;
            }
            
            String sql = """
                SELECT i.invoice_id, i.amount, i.status, i.due_date, i.created_at,
                       s.student_id, u.first_name || ' ' || u.last_name as student_name,
                       s.student_code, t.name as term_name,
                       COALESCE(SUM(p.amount), 0) as paid_amount,
                       (i.amount - COALESCE(SUM(p.amount), 0)) as remaining_amount
                FROM invoice i
                JOIN student s ON i.student_id = s.student_id
                JOIN app_user u ON s.user_id = u.user_id
                LEFT JOIN term t ON i.term_id = t.term_id
                LEFT JOIN payment p ON i.invoice_id = p.invoice_id
                WHERE s.student_id = ?
                GROUP BY i.invoice_id, i.amount, i.status, i.due_date, i.created_at,
                         s.student_id, u.first_name, u.last_name, s.student_code, t.name
                ORDER BY i.due_date DESC
            """;
            
            List<Map<String, Object>> payments = jdbcTemplate.queryForList(sql, studentId);
            System.out.println("✅ Found " + payments.size() + " payment records for student_id: " + studentId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("payments", payments);
            result.put("success", true);
            result.put("studentId", studentId);
            
            return result;
            
        } catch (Exception e) {
            System.err.println("❌ Error in getStudentPayments: " + e.getMessage());
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Failed to fetch payments: " + e.getMessage());
            return result;
        }
    }
    
    public Map<String, Object> processPayment(Map<String, Object> paymentData) {
        try {
            System.out.println("💰 Processing payment: " + paymentData);
            
            Long invoiceId = ((Number) paymentData.get("invoiceId")).longValue();
            Double amount = ((Number) paymentData.get("amount")).doubleValue();
            String method = (String) paymentData.get("method");
            String notes = (String) paymentData.get("notes");
            
            return recordPayment(invoiceId, amount, method, notes);
            
        } catch (Exception e) {
            System.err.println("❌ Payment processing error: " + e.getMessage());
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Payment processing failed: " + e.getMessage());
            return result;
        }
    }
    
    public Map<String, Object> recordPayment(Long invoiceId, Double amount, String method, String notes) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            System.out.println("💰 Recording payment - Invoice: " + invoiceId + ", Amount: " + amount + ", Method: " + method);
            
            List<String> allowedMethods = Arrays.asList("card", "netbanking", "cheque", "cash", "upi");
            if (!allowedMethods.contains(method.toLowerCase())) {
                result.put("success", false);
                result.put("message", "Invalid payment method: " + method);
                return result;
            }
            
            String sql = "INSERT INTO payment (invoice_id, amount, paid_on, method, notes) VALUES (?, ?, SYSDATE, ?, ?)";
            
            int rowsAffected = jdbcTemplate.update(sql, invoiceId, amount, method, notes);
            
            if (rowsAffected > 0) {
                updateInvoiceStatus(invoiceId);
                result.put("success", true);
                result.put("message", "Payment recorded successfully");
                result.put("paymentId", getLastPaymentId());
            } else {
                result.put("success", false);
                result.put("message", "Failed to record payment");
            }
            
        } catch (Exception e) {
            System.err.println("❌ Payment recording error: " + e.getMessage());
            result.put("success", false);
            result.put("message", "Payment recording failed: " + e.getMessage());
        }
        
        return result;
    }
    
    public Long getStudentIdFromUserId(Long userId) {
        try {
            String sql = "SELECT student_id FROM student WHERE user_id = ?";
            return jdbcTemplate.queryForObject(sql, Long.class, userId);
        } catch (Exception e) {
            System.err.println("❌ Error getting student ID: " + e.getMessage());
            return null;
        }
    }
    
    private void updateInvoiceStatus(Long invoiceId) {
        try {
            String statusSql = """
                UPDATE invoice i 
                SET status = CASE 
                    WHEN (SELECT COALESCE(SUM(amount), 0) FROM payment WHERE invoice_id = i.invoice_id) >= i.amount THEN 'paid'
                    WHEN (SELECT COALESCE(SUM(amount), 0) FROM payment WHERE invoice_id = i.invoice_id) > 0 THEN 'partial'
                    ELSE 'unpaid'
                END
                WHERE invoice_id = ?
            """;
            jdbcTemplate.update(statusSql, invoiceId);
        } catch (Exception e) {
            System.err.println("❌ Error updating invoice status: " + e.getMessage());
        }
    }
    
    private Long getLastPaymentId() {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT payment_id FROM payment WHERE ROWNUM = 1 ORDER BY payment_id DESC", 
                Long.class
            );
        } catch (Exception e) {
            return null;
        }
    }
}