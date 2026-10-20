package com.eduportal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import com.eduportal.config.ApiLogger;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCourses() {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching all courses");
            ApiLogger.logApiCall("/courses", "GET", "", user);
            ApiLogger.logCourseView(user, "all_courses");
            
            String sql = """
                SELECT c.course_id, c.code, c.title, d.dept_name as department,
                       COUNT(DISTINCT co.offering_id) as active_offerings,
                       COUNT(DISTINCT e.student_id) as enrolled_students
                FROM course c
                JOIN department d ON c.department_id = d.dept_id
                LEFT JOIN course_offering co ON c.course_id = co.course_id
                LEFT JOIN enrollment e ON co.offering_id = e.offering_id AND e.status = 'active'
                GROUP BY c.course_id, c.code, c.title, d.dept_name
                ORDER BY c.code
                """;
            
            List<Map<String, Object>> courses = jdbcTemplate.queryForList(sql);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("courses", courses);
            response.put("count", courses.size());
            
            ApiLogger.logDatabaseChange("SELECT", "COURSE", 
                "Fetched all courses - Count: " + courses.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "COURSE_OFFERING", 
                "Fetched course offerings data", user);
            ApiLogger.logDatabaseChange("SELECT", "ENROLLMENT", 
                "Fetched enrollment counts for courses", user);
            
            System.out.println("✅ Successfully fetched " + courses.size() + " courses");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching courses: " + e.getMessage());
            ApiLogger.logError("GET_ALL_COURSES", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch courses");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<Map<String, Object>> getFacultyCourses(@PathVariable Long facultyId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching courses for faculty: " + facultyId);
            ApiLogger.logApiCall("/courses/faculty/" + facultyId, "GET", "", user);
            ApiLogger.logCourseView("faculty_" + facultyId, "faculty_courses");
            
            String sql = """
                SELECT co.offering_id, c.code, c.title, co.section, co.schedule, co.room,
                       t.name as term_name, co.capacity,
                       COUNT(e.student_id) as enrolled_students
                FROM course_offering co
                JOIN course c ON co.course_id = c.course_id
                JOIN term t ON co.term_id = t.term_id
                LEFT JOIN enrollment e ON co.offering_id = e.offering_id AND e.status = 'active'
                WHERE co.faculty_id = ?
                GROUP BY co.offering_id, c.code, c.title, co.section, co.schedule, co.room, t.name, co.capacity
                ORDER BY t.start_date DESC
                """;
            
            List<Map<String, Object>> courses = jdbcTemplate.queryForList(sql, facultyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("courses", courses);
            response.put("facultyId", facultyId);
            
            ApiLogger.logDatabaseChange("SELECT", "COURSE_OFFERING", 
                "Fetched faculty courses - FacultyID: " + facultyId + ", Count: " + courses.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "COURSE", 
                "Fetched course details for faculty", user);
            ApiLogger.logCourseManagement("System", "VIEW_FACULTY_COURSES", 
                "Faculty ID: " + facultyId, "Fetched " + courses.size() + " courses");
            
            System.out.println("✅ Successfully fetched " + courses.size() + " courses for faculty: " + facultyId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching faculty courses: " + e.getMessage());
            ApiLogger.logError("GET_FACULTY_COURSES", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch faculty courses");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/faculty/{facultyId}/courses")
    public ResponseEntity<Map<String, Object>> getFacultyCoursesByFacultyId(@PathVariable String facultyId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching courses for faculty ID: " + facultyId);
            ApiLogger.logApiCall("/courses/faculty/" + facultyId + "/courses", "GET", "", user);
            ApiLogger.logCourseView("faculty_" + facultyId, "faculty_courses_detailed");
            
            // Return mock faculty courses for demo
            List<Map<String, Object>> courses = Arrays.asList(
                createMockFacultyCourse("CS101", "Introduction to Computer Science", "Mon, Wed 10:00-11:30 AM", 45),
                createMockFacultyCourse("CS301", "Data Structures and Algorithms", "Tue, Thu 1:00-2:30 PM", 32),
                createMockFacultyCourse("CS450", "Advanced Database Systems", "Mon, Wed, Fri 9:00-10:00 AM", 28)
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("courses", courses);
            response.put("facultyId", facultyId);
            
            ApiLogger.logDatabaseChange("SELECT", "COURSE_OFFERING", 
                "Fetched detailed faculty courses - FacultyID: " + facultyId + ", Count: " + courses.size(), user);
            ApiLogger.logCourseManagement("System", "VIEW_FACULTY_COURSES_DETAILED", 
                "Faculty ID: " + facultyId, "Fetched " + courses.size() + " detailed courses");
            
            System.out.println("✅ Successfully fetched " + courses.size() + " detailed courses for faculty: " + facultyId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching faculty courses: " + e.getMessage());
            ApiLogger.logError("GET_FACULTY_COURSES_DETAILED", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch faculty courses");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/{courseId}/students")
    public ResponseEntity<Map<String, Object>> getCourseStudents(@PathVariable Long courseId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching students for course: " + courseId);
            ApiLogger.logApiCall("/courses/" + courseId + "/students", "GET", "", user);
            ApiLogger.logCourseView(user, "course_students");
            
            String sql = """
                SELECT s.student_id, u.first_name, u.last_name, u.email,
                       s.student_code, e.enrolled_at, e.status
                FROM enrollment e
                JOIN student s ON e.student_id = s.student_id
                JOIN app_user u ON s.user_id = u.user_id
                JOIN course_offering co ON e.offering_id = co.offering_id
                WHERE co.course_id = ? AND e.status = 'active'
                ORDER BY u.last_name, u.first_name
                """;
            
            List<Map<String, Object>> students = jdbcTemplate.queryForList(sql, courseId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("students", students);
            response.put("courseId", courseId);
            
            ApiLogger.logDatabaseChange("SELECT", "ENROLLMENT", 
                "Fetched students for course - CourseID: " + courseId + ", Count: " + students.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "STUDENT", 
                "Fetched student details for course", user);
            ApiLogger.logCourseManagement("System", "VIEW_COURSE_STUDENTS", 
                "Course ID: " + courseId, "Fetched " + students.size() + " enrolled students");
            
            System.out.println("✅ Successfully fetched " + students.size() + " students for course: " + courseId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching course students: " + e.getMessage());
            ApiLogger.logError("GET_COURSE_STUDENTS", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch course students");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/offerings")
    public ResponseEntity<Map<String, Object>> getAllCourseOfferings() {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching all course offerings");
            ApiLogger.logApiCall("/courses/offerings", "GET", "", user);
            ApiLogger.logCourseView(user, "all_offerings");
            
            String sql = """
                SELECT co.offering_id, c.code, c.title, co.section, co.schedule, co.room,
                       u.first_name || ' ' || u.last_name as faculty_name,
                       t.name as term_name, co.capacity,
                       COUNT(e.student_id) as enrolled_students,
                       d.dept_name as department
                FROM course_offering co
                JOIN course c ON co.course_id = c.course_id
                JOIN faculty f ON co.faculty_id = f.faculty_id
                JOIN app_user u ON f.user_id = u.user_id
                JOIN term t ON co.term_id = t.term_id
                JOIN department d ON c.department_id = d.dept_id
                LEFT JOIN enrollment e ON co.offering_id = e.offering_id AND e.status = 'active'
                GROUP BY co.offering_id, c.code, c.title, co.section, co.schedule, co.room, 
                         faculty_name, t.name, co.capacity, d.dept_name
                ORDER BY t.start_date DESC, c.code
                """;
            
            List<Map<String, Object>> offerings = jdbcTemplate.queryForList(sql);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("offerings", offerings);
            response.put("count", offerings.size());
            
            ApiLogger.logDatabaseChange("SELECT", "COURSE_OFFERING", 
                "Fetched all course offerings - Count: " + offerings.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "FACULTY", 
                "Fetched faculty details for offerings", user);
            ApiLogger.logDatabaseChange("SELECT", "ENROLLMENT", 
                "Fetched enrollment data for offerings", user);
            ApiLogger.logCourseManagement("System", "VIEW_ALL_OFFERINGS", 
                "All offerings", "Fetched " + offerings.size() + " course offerings");
            
            System.out.println("✅ Successfully fetched " + offerings.size() + " course offerings");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching course offerings: " + e.getMessage());
            ApiLogger.logError("GET_COURSE_OFFERINGS", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch course offerings");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentCourses(@PathVariable String studentId) {
        String user = "Unknown";
        try {
            System.out.println("🌐 Fetching courses for student: " + studentId);
            ApiLogger.logApiCall("/courses/students/" + studentId, "GET", "", user);
            ApiLogger.logCourseView("student_" + studentId, "student_courses");
            
            // Mock student courses for demo
            List<Map<String, Object>> courses = Arrays.asList(
                createMockStudentCourse(1, "CS101", "Introduction to Computer Science", "Dr. Sarah Chen", "Mon, Wed 10:00-11:30 AM", 3, 75),
                createMockStudentCourse(2, "MATH201", "Calculus II", "Prof. Michael Brown", "Tue, Thu 1:00-2:30 PM", 4, 60),
                createMockStudentCourse(3, "PHY101", "Physics Fundamentals", "Dr. Emily Wilson", "Mon, Wed, Fri 9:00-10:00 AM", 3, 85)
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("courses", courses);
            response.put("studentId", studentId);
            
            ApiLogger.logDatabaseChange("SELECT", "ENROLLMENT", 
                "Fetched student courses - StudentID: " + studentId + ", Count: " + courses.size(), user);
            ApiLogger.logDatabaseChange("SELECT", "COURSE", 
                "Fetched course details for student", user);
            ApiLogger.logCourseEnrollment(studentId, "Multiple Courses", "System");
            
            System.out.println("✅ Successfully fetched " + courses.size() + " courses for student: " + studentId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching student courses: " + e.getMessage());
            ApiLogger.logError("GET_STUDENT_COURSES", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch student courses");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/enroll")
    public ResponseEntity<Map<String, Object>> enrollStudent(@RequestBody Map<String, Object> enrollmentData) {
        String user = "Unknown";
        try {
            String studentId = enrollmentData.get("studentId").toString();
            String courseId = enrollmentData.get("courseId").toString();
            String offeringId = enrollmentData.get("offeringId").toString();
            
            System.out.println("🌐 Enrolling student " + studentId + " in course " + courseId);
            ApiLogger.logApiCall("/courses/enroll", "POST", 
                "studentId=" + studentId + ", courseId=" + courseId + ", offeringId=" + offeringId, user);
            
            // Mock enrollment - in real scenario, insert into enrollment table
            String sql = "INSERT INTO enrollment (student_id, offering_id, term_id, enrolled_at, status) VALUES (?, ?, ?, SYSDATE, 'active')";
            // Note: You would need to get the term_id from the offering or current term
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Student enrolled successfully");
            response.put("enrollmentId", (int)(Math.random() * 1000));
            
            ApiLogger.logCourseEnrollment(studentId, "Course ID: " + courseId, user);
            ApiLogger.logDatabaseChange("INSERT", "ENROLLMENT", 
                "New enrollment - Student: " + studentId + ", Course: " + courseId + ", Offering: " + offeringId, user);
            ApiLogger.logCourseManagement("System", "STUDENT_ENROLLMENT", 
                "Course ID: " + courseId, "Student " + studentId + " enrolled successfully");
            
            System.out.println("✅ Successfully enrolled student " + studentId + " in course " + courseId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error enrolling student: " + e.getMessage());
            ApiLogger.logError("ENROLL_STUDENT", e.getMessage(), user);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to enroll student");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Helper method for mock faculty courses
    private Map<String, Object> createMockFacultyCourse(String code, String title, String schedule, int students) {
        Map<String, Object> course = new HashMap<>();
        course.put("course_id", (int)(Math.random() * 1000));
        course.put("course_code", code);
        course.put("course_name", title);
        course.put("schedule", schedule);
        course.put("enrolled_students", students);
        course.put("status", "active");
        return course;
    }

    // Helper method for mock student courses
    private Map<String, Object> createMockStudentCourse(int courseId, String code, String title, String instructor, String schedule, int credits, int progress) {
        Map<String, Object> course = new HashMap<>();
        course.put("course_id", courseId);
        course.put("course_code", code);
        course.put("course_name", title);
        course.put("instructor", instructor);
        course.put("schedule", schedule);
        course.put("credits", credits);
        course.put("progress", progress);
        return course;
    }
}