@echo off
echo ===============================================
echo    EduPortal Database Setup Script
echo ===============================================
echo.

echo Step 1: Checking Oracle Services...
sc query OracleServiceXE | find "RUNNING" >nul
if errorlevel 1 (
    echo Starting OracleServiceXE...
    net start OracleServiceXE
) else (
    echo ✅ OracleServiceXE is running
)

sc query OracleXETNSListener | find "RUNNING" >nul
if errorlevel 1 (
    echo Starting OracleXETNSListener...
    net start OracleXETNSListener
) else (
    echo ✅ OracleXETNSListener is running
)

echo Step 2: Testing Oracle Connection...
sqlplus -s system/YOUR_DB_PASSWORD@XE "SELECT 'Oracle Connected: ' || TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM DUAL;" > temp_test.txt
if errorlevel 1 (
    echo.
    echo ❌ Cannot connect to Oracle Database!
    echo Please check:
    echo 1. Oracle services are running
    echo 2. Username: system, Password: YOUR_DB_PASSWORD
    echo 3. Database instance: XE
    echo.
    type temp_test.txt
    del temp_test.txt
    pause
    exit /b 1
)

echo ✅ Oracle connection successful!
del temp_test.txt

echo Step 3: Navigate to project directory...
cd /d "C:\Users\ojasa\Downloads\dbmsproject"

echo Step 4: Checking for required database scripts...
if not exist "pdatabase 1.txt" (
    echo.
    echo ❌ ERROR: pdatabase 1.txt not found!
    echo.
    dir *.txt
    echo.
    pause
    exit /b 1
)

echo Step 5: Creating simplified run script...
echo -- Simplified Database Setup > temp_run.sql
echo SET ECHO ON >> temp_run.sql
echo SET FEEDBACK ON >> temp_run.sql
echo SET SERVEROUTPUT ON >> temp_run.sql
echo. >> temp_run.sql
echo PROMPT Starting database setup... >> temp_run.sql
echo @"pdatabase 1.txt" >> temp_run.sql
echo. >> temp_run.sql
echo PROMPT Database setup completed! >> temp_run.sql
echo EXIT; >> temp_run.sql

echo.
echo ===============================================
echo    STARTING DATABASE SETUP
echo ===============================================
echo Please wait, this may take 1-2 minutes...
echo.

echo Step 6: Running Database Script...
sqlplus system/YOUR_DB_PASSWORD@XE @temp_run.sql

echo.
echo ===============================================
if %errorlevel% equ 0 (
    echo    ✅ DATABASE SETUP SUCCESSFUL!
    echo.
    echo    Next steps:
    echo    1. Start your Spring Boot backend
    echo    2. Test the API endpoints
    echo    3. Run the frontend application
) else (
    echo    ❌ Database Setup Failed!
    echo    Check the errors above.
)
echo ===============================================
echo.

echo Cleaning up...
del temp_run.sql

pause
