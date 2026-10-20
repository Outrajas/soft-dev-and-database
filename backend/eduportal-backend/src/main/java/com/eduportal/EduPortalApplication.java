package com.eduportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EduPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(EduPortalApplication.class, args);
        System.out.println("🚀 EduPortal Backend Started Successfully!");
        System.out.println("📍 Server running on: http://localhost:8080");
        System.out.println("📚 API Base URL: http://localhost:8080/api");
        System.out.println("🔗 Frontend URL: http://localhost:5173");
        System.out.println("🎯 Demo Accounts Available:");
        System.out.println("   👨‍🎓 Student: student@university.edu / demo123");
        System.out.println("   👨‍🏫 Faculty: faculty@university.edu / demo123");
        System.out.println("   👨‍💼 Admin: admin@university.edu / demo123");
        System.out.println("   💰 Finance: finance@university.edu / demo123");
        System.out.println("   👨‍👧 Parent: parent@university.edu / demo123");
        System.out.println("==============================================");
    }
}