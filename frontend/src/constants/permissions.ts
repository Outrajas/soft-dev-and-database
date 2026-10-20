// src/constants/permissions.ts
export const ROLE_PERMISSIONS = {
  student: [
    'view_dashboard',
    'view_courses',
    'view_grades', 
    'view_attendance',
    'make_payments',
    'view_schedule',
    'view_profile',
    'view_notifications',
    'submit_assignments',
    'view_materials'
  ],
  faculty: [
    'view_dashboard',
    'manage_classes',
    'manage_grades',
    'track_attendance',
    'view_schedule',
    'view_students',
    'view_profile',
    'view_notifications',
    'create_assignments',
    'post_announcements',
    'upload_materials',
    'manage_course_content'
  ],
  admin: [
    'view_dashboard',
    'manage_users',
    'manage_courses',
    'manage_departments',
    'view_reports',
    'system_settings',
    'view_profile',
    'view_notifications',
    'manage_system',
    'view_analytics',
    'manage_permissions',
    'audit_logs'
  ],
  finance: [
    'view_dashboard',
    'manage_invoices',
    'track_payments',
    'view_financial_reports',
    'payment_approval',
    'view_profile',
    'view_notifications',
    'generate_reports',
    'manage_fees',
    'process_refunds'
  ],
  parent: [
    'view_dashboard',
    'view_children',
    'view_progress',
    'make_payments',
    'view_attendance',
    'view_profile',
    'view_notifications',
    'view_schedule',
    'communicate_teachers'
  ]
};