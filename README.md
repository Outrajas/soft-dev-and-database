# SoftDev: University Management System

A full-stack, monorepo Enterprise Resource Planning (ERP) system designed to manage university operations, including student records, attendance, fee management, and role-based access control.

## 🏗️ Architecture
This project is structured as a monorepo, containing both the frontend client and the backend API.

- **Backend:** Spring Boot, Spring Security (JWT), Java
- **Frontend:** React, Tailwind CSS, Vite
- **Database:** Oracle SQL
- **ORM:** Spring Data JPA / Hibernate

## ✨ Key Features
- **Role-Based Access Control (RBAC):** Separate dashboards and permissions for Admin, Faculty, and Students.
- **Authentication:** Secure JWT-based login and session management.
- **Attendance Management:** Faculty can mark and track student attendance.
- **Fee Management:** Students can view fee status; Admins can track payments.
- **Notifications:** System-wide alerts for updates and announcements.

## 📂 Directory Structure
- `backend/eduportal-backend`: The Spring Boot REST API.
- `frontend/`: The React single-page application.
- `database/`: Oracle SQL schema and seed scripts.

## 🚀 Local Setup

### 1. Database Setup
1. Ensure Oracle Database (XE 21c or higher) is running.
2. Run the SQL scripts in the `database/` folder to create the schema and tables.

### 2. Backend Setup
1. Navigate to the backend folder: `cd backend/eduportal-backend`
2. Copy `DatabaseConfig.java.example` to `DatabaseConfig.java`.
3. Open `DatabaseConfig.java` and update your local Oracle DB username and password.
4. Run the Spring Boot application: `./mvnw spring-boot:run`

### 3. Frontend Setup
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## 🔒 Security Note
Sensitive database credentials are ignored via `.gitignore`. Use the `.example` file as a template for your local environment.