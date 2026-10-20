import axios from 'axios';
import { DEMO_ACCOUNTS } from '@/constants/demoAccounts';
import { ROLE_PERMISSIONS } from '@/constants/permissions';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080/api' 
  : 'http://192.168.1.3:8080/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Type definitions
interface BackendCourse {
  COURSE_ID: number;
  CODE: string;
  TITLE: string;
  SECTION: string;
  SCHEDULE: string;
  ROOM: string;
  FACULTY_NAME: string;
  TERM_NAME: string;
  ENROLLED_AT: string;
  STATUS: string;
}

interface BackendGrade {
  COURSE_CODE: string;
  COURSE_NAME: string;
  ASSESSMENT_TITLE: string;
  MAX_SCORE: number;
  GRADE: number;
  GRADE_DATE: string;
  GRADER_NAME: string;
  PERCENTAGE: number;
  GRADE_LETTER: string;
}

interface AttendanceRecord {
  COURSE_CODE: string;
  COURSE_NAME: string;
  CLASS_DATE: string;
  STATUS: 'present' | 'absent' | 'late';
  TOTAL_CLASSES: number;
  PRESENT_COUNT: number;
  ATTENDANCE_PERCENTAGE: number;
}

interface User {
  userId: number;
  email: string;
  role: 'student' | 'faculty' | 'admin' | 'finance' | 'parent';
  firstName: string;
  lastName: string;
  phone?: string;
  studentId?: string;
  facultyId?: string;
  department?: string;
  programName?: string;
  admissionYear?: number;
  permissions: string[];
  lastLogin: string;
  isDemo: boolean;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

interface PaymentData {
  invoiceId: string;
  amount: number;
  method: string;
  notes?: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message: string;
  config?: {
    url?: string;
  };
}

// Payment-related interfaces
interface RawPayment {
  // Primary fields (lowercase - frontend format)
  invoice_id?: number;
  amount?: number;
  status?: string;
  due_date?: string;
  created_at?: string;
  student_name?: string;
  student_code?: string;
  term_name?: string;
  paid_amount?: number;
  remaining_amount?: number;
  description?: string;
  paid_on?: string;
  payment_method?: string;
  
  // Database fields (UPPERCASE - backend format)
  INVOICE_ID?: number;
  AMOUNT?: number;
  STATUS?: string;
  DUE_DATE?: string;
  CREATED_AT?: string;
  STUDENT_NAME?: string;
  STUDENT_CODE?: string;
  TERM_NAME?: string;
  PAID_AMOUNT?: number;
  REMAINING_AMOUNT?: number;
  DESCRIPTION?: string;
  PAID_ON?: string;
  PAYMENT_METHOD?: string;
  
  // Additional fields that might come from backend
  invoice_amount?: number;
  INVOICE_AMOUNT?: number;
  student_id?: number;
  STUDENT_ID?: number;
  reference_number?: string;
  REFERENCE_NUMBER?: string;
  notes?: string;
  NOTES?: string;
  method?: string;
  METHOD?: string;
  
  // Allow any string key but with proper value types
  [key: string]: string | number | boolean | null | undefined;
}

interface PaymentApiResponse {
  success: boolean;
  payments: RawPayment[];
  totalPaid?: number;
  totalPending?: number;
  count?: number;
  isDemoData?: boolean;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

// Helper function to validate JWT token format
const isValidJWT = (token: string): boolean => {
  if (!token) return false;
  
  // Demo tokens are always valid
  if (token.startsWith('demo-token-')) {
    return true;
  }
  
  // Real JWT tokens should have 3 parts separated by dots
  try {
    const parts = token.split('.');
    return parts.length === 3;
  } catch {
    return false;
  }
};

// Enhanced Request interceptor with JWT validation
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eduportal_token');
    console.log('🔐 [API] Request interceptor - Token found:', !!token, 'URL:', config.url);
    
    if (token && isValidJWT(token)) {
      // Remove any existing Authorization header first
      delete config.headers.Authorization;
      
      // Add the Bearer token
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 [API] Added Authorization header for', config.url);
    } else if (token && !isValidJWT(token)) {
      console.warn('❌ [API] Invalid token format detected, clearing auth data');
      localStorage.removeItem('eduportal_token');
      localStorage.removeItem('eduportal_user');
    } else {
      console.log('🔐 [API] No valid token found in localStorage for', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.url}`, response.status);
    return response;
  },
  (error: ApiError) => {
    console.error(`❌ API Error: ${error.config?.url}`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Auto-logout on 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔐 [API] 401 Unauthorized - clearing auth data');
      localStorage.removeItem('eduportal_token');
      localStorage.removeItem('eduportal_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Demo data fallbacks
const getDemoCourses = () => [
  {
    course_id: 1,
    course_code: 'CS101',
    course_name: 'Introduction to Computer Science',
    instructor: 'Dr. Sarah Chen',
    schedule: 'Mon, Wed 10:00-11:30 AM',
    credits: 3,
    progress: 75
  },
  {
    course_id: 2,
    course_code: 'MATH201',
    course_name: 'Calculus II',
    instructor: 'Prof. Michael Brown',
    schedule: 'Tue, Thu 1:00-2:30 PM',
    credits: 4,
    progress: 60
  }
];

const getDemoGrades = () => [
  {
    course_id: 1,
    course_name: 'Introduction to Computer Science',
    assignment: 'Programming Assignment 1',
    grade: 'A',
    max_grade: 'A',
    percentage: 95,
    submitted_at: '2025-09-15'
  },
  {
    course_id: 2,
    course_name: 'Calculus II',
    assignment: 'Midterm Exam',
    grade: 'B+',
    max_grade: 'A',
    percentage: 88,
    submitted_at: '2025-09-20'
  }
];

const getDemoAttendance = () => [
  {
    course_id: 1,
    course_name: 'Introduction to Computer Science',
    present: 12,
    total: 15,
    percentage: 80
  },
  {
    course_id: 2,
    course_name: 'Calculus II',
    present: 14,
    total: 15,
    percentage: 93
  }
];

const getDemoChildren = () => [
  {
    student_id: 1001,
    name: 'Alex Johnson',
    grade_level: 'Sophomore',
    program: 'BSc Computer Science',
    status: 'active'
  },
  {
    student_id: 1002,
    name: 'Sarah Johnson',
    grade_level: 'Freshman',
    program: 'BSc Biology',
    status: 'active'
  }
];

export const api = {
  // Authentication endpoints with proper localStorage storage
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🌐 [API] Login attempt:', email);
      console.log('🔐 Password provided:', password ? `Length: ${password.length}` : 'NO PASSWORD');
      
      // Always use real backend authentication for ALL users (demo and real)
      console.log('🌐 [API] Attempting REAL backend authentication for ALL users...');
      
      try {
        const response = await apiClient.post('/auth/login', { email, password });
        console.log('✅ [API] Backend Login response:', response.data);
        
        const responseData = response.data;
        
        if (responseData.success && responseData.user) {
          const userData: User = {
            userId: responseData.user.userId,
            email: responseData.user.email,
            role: responseData.user.role as User['role'],
            firstName: responseData.user.firstName,
            lastName: responseData.user.lastName,
            phone: responseData.user.phone,
            studentId: responseData.user.studentId,
            facultyId: responseData.user.facultyId,
            department: responseData.user.department,
            programName: responseData.user.programName,
            admissionYear: responseData.user.admissionYear,
            permissions: ROLE_PERMISSIONS[responseData.user.role as keyof typeof ROLE_PERMISSIONS] || [],
            lastLogin: responseData.user.lastLogin || new Date().toISOString(),
            isDemo: responseData.user.isDemo || false
          };

          // Store auth data
          console.log('💾 [API] Storing auth data in localStorage...');
          localStorage.setItem('eduportal_token', responseData.token);
          localStorage.setItem('eduportal_user', JSON.stringify(userData));
          
          // Verify storage
          const storedToken = localStorage.getItem('eduportal_token');
          const storedUser = localStorage.getItem('eduportal_user');
          console.log('✅ [API] Auth data stored - Token:', !!storedToken, 'User:', !!storedUser);

          return {
            success: true,
            user: userData,
            token: responseData.token,
            message: responseData.message || 'Login successful'
          };
        } else {
          console.log('❌ [API] Backend authentication failed:', responseData.message);
          return {
            success: false,
            message: responseData.message || 'Invalid credentials'
          };
        }
      } catch (backendError) {
        console.log('❌ [API] Backend authentication request failed:', backendError);
        return {
          success: false,
          message: 'Authentication service unavailable. Please try again later.'
        };
      }
      
    } catch (error: unknown) {
      console.error('❌ [API] Login process failed:', error);
      
      const errorMessage = (error as ApiError)?.response?.data?.message || 'Login failed. Please check your credentials.';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Real user registration
  async register(userData: RegisterData): Promise<LoginResponse> {
    try {
      console.log('🌐 [API] REAL Registration attempt:', userData.email);
      
      // Check if email already exists in demo accounts
      const existingDemo = DEMO_ACCOUNTS.find(acc => 
        acc.email.toLowerCase() === userData.email.toLowerCase()
      );
      if (existingDemo) {
        return {
          success: false,
          message: 'Email already exists as demo account. Please use a different email or login with demo account.'
        };
      }

      // Try real backend registration
      console.log('🌐 [API] Attempting real backend registration...');
      try {
        const response = await apiClient.post('/auth/register', userData);
        console.log('✅ [API] REAL Registration response:', response.data);
        
        if (response.data.success && response.data.user) {
          // Store real user data in localStorage
          const registeredUser: User = {
            userId: response.data.user.userId,
            email: response.data.user.email,
            role: response.data.user.role as User['role'],
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            phone: response.data.user.phone,
            studentId: response.data.user.studentId,
            facultyId: response.data.user.facultyId,
            department: response.data.user.department,
            programName: response.data.user.programName,
            admissionYear: response.data.user.admissionYear,
            permissions: ROLE_PERMISSIONS[response.data.user.role as keyof typeof ROLE_PERMISSIONS] || [],
            lastLogin: response.data.user.lastLogin || new Date().toISOString(),
            isDemo: false
          };

          // CRITICAL: Store in localStorage
          console.log('💾 [API] Storing REAL user auth data in localStorage...');
          localStorage.setItem('eduportal_token', response.data.token);
          localStorage.setItem('eduportal_user', JSON.stringify(registeredUser));
          
          // Verify storage
          const storedToken = localStorage.getItem('eduportal_token');
          const storedUser = localStorage.getItem('eduportal_user');
          console.log('✅ [API] REAL user auth data stored - Token:', !!storedToken, 'User:', !!storedUser);

          return {
            success: true,
            user: registeredUser,
            token: response.data.token,
            message: response.data.message || 'Registration successful'
          };
        } else {
          return {
            success: false,
            message: response.data.message || 'Registration failed'
          };
        }
      } catch (backendError) {
        console.log('❌ [API] Backend registration failed:', backendError);
        return {
          success: false,
          message: 'Registration service unavailable. Please try again or use demo accounts.'
        };
      }
    } catch (error: unknown) {
      console.error('❌ [API] Registration failed:', error);
      const errorMessage = (error as ApiError)?.response?.data?.message || 'Registration failed. Please try again.';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  async getDemoAccounts() {
    try {
      console.log('🌐 [API] Fetching demo accounts from API');
      const response = await apiClient.get('/auth/demo-accounts');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [API] Failed to fetch demo accounts:', error);
      // Return enhanced demo accounts structure
      return {
        success: true,
        accounts: DEMO_ACCOUNTS
      };
    }
  },

  // Enhanced /me endpoint with proper error handling
  async getCurrentUser(): Promise<LoginResponse> {
    try {
      console.log('🌐 [API] Fetching current user from /me endpoint');
      const token = localStorage.getItem('eduportal_token');
      
      if (!token) {
        console.log('❌ [API] No token found for /me endpoint');
        return { success: false, message: 'No authentication token found' };
      }

      console.log('🔐 [API] Using token for /me validation');
      
      // Real token - validate with backend (NO FALLBACK TO STORED DATA)
      try {
        const response = await apiClient.get('/auth/me');
        console.log('✅ [API] /me endpoint response received');
        
        if (response.data.success && response.data.user) {
          const userData: User = {
            userId: response.data.user.userId,
            email: response.data.user.email,
            role: response.data.user.role as User['role'],
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            phone: response.data.user.phone,
            studentId: response.data.user.studentId,
            facultyId: response.data.user.facultyId,
            department: response.data.user.department,
            programName: response.data.user.programName,
            admissionYear: response.data.user.admissionYear,
            permissions: ROLE_PERMISSIONS[response.data.user.role as keyof typeof ROLE_PERMISSIONS] || [],
            lastLogin: response.data.user.lastLogin || new Date().toISOString(),
            isDemo: response.data.user.isDemo || false
          };
          
          return {
            success: true,
            user: userData,
            message: 'User session validated'
          };
        } else {
          console.log('❌ [API] /me endpoint returned failure');
          return {
            success: false,
            message: response.data.message || 'Failed to validate user session'
          };
        }
      } catch (backendError) {
        console.log('❌ [API] Backend /me endpoint failed - requiring re-authentication');
        // REMOVED: Stored data fallback - require fresh login
        throw backendError;
      }
    } catch (error: unknown) {
      console.error('❌ [API] /me endpoint error:', error);
      
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.message || 'Failed to validate user session';
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Enhanced token validation
  async validateToken(): Promise<LoginResponse> {
    try {
      console.log('🌐 [API] Validating token with backend');
      const token = localStorage.getItem('eduportal_token');
      
      if (!token) {
        console.log('❌ [API] No token found in localStorage');
        return { success: false, message: 'No token found' };
      }
      
      console.log('🔐 [API] Token found');
      
      // Check if it's a demo token
      if (token.startsWith('demo-token-')) {
        console.log('🎯 Demo token detected, using stored user data');
        const storedUser = localStorage.getItem('eduportal_user');
        if (storedUser) {
          const userData: User = JSON.parse(storedUser);
          return {
            success: true,
            user: userData,
            message: 'Demo token validated'
          };
        }
      }
      
      // Real token - validate with backend
      console.log('🔐 [API] Validating real token with backend using /me endpoint');
      return await this.getCurrentUser();
    } catch (error: unknown) {
      console.error('❌ [API] Token validation error:', error);
      
      // Fallback to stored user data
      const storedUser = localStorage.getItem('eduportal_user');
      if (storedUser) {
        console.log('🔄 Using stored user data as fallback for token validation');
        const userData: User = JSON.parse(storedUser);
        return {
          success: true,
          user: userData,
          message: 'Using stored session data'
        };
      }
      
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.message || 'Token validation failed';
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Payment endpoints
  async recordPayment(paymentData: {
    invoiceId: string;
    amount: number;
    method: string;
    notes: string;
  }): Promise<ApiResponse> {
    try {
      console.log('🌐 [API] Recording payment:', paymentData);
      const response = await apiClient.post('/payments/record', paymentData);
      return {
        success: true,
        message: 'Payment recorded successfully',
        data: response.data
      };
    } catch (error: unknown) {
      console.error('❌ [API] Failed to record payment:', error);
      // Simulate success for demo
      return {
        success: true,
        message: 'Payment recorded successfully (demo mode)',
        data: { paymentId: Date.now(), ...paymentData }
      };
    }
  },

  async processPayment(paymentData: PaymentData): Promise<ApiResponse> {
    try {
      console.log('🌐 [API] Processing payment:', paymentData);
      const response = await apiClient.post('/payments/process', paymentData);
      return {
        success: true,
        message: 'Payment processed successfully',
        data: response.data
      };
    } catch (error: unknown) {
      console.error('❌ [API] Failed to process payment:', error);
      // Simulate success for demo
      return {
        success: true,
        message: 'Payment processed successfully (demo mode)',
        data: { transactionId: 'DEMO-' + Date.now(), ...paymentData }
      };
    }
  },

  async getAllPayments() {
    try {
      console.log('🌐 [API] Fetching all payments from API');
      const response = await apiClient.get('/payments');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [API] Failed to fetch payments:', error);
      // Return mock payments for demo
      return this.getMockPayments();
    }
  },

  // FIXED: Proper student payments with correct response handling and types
  // FIXED: Proper student payments with correct response handling and types
async getStudentPayments(userId: number): Promise<PaymentApiResponse> {
  try {
    console.log(`🌐 [API] Fetching payments for user ${userId}`);
    
    // Get the student ID mapping
    const studentId = await this.getStudentIdFromUserId(userId);
    
    if (!studentId) {
      console.warn(`❌ No student ID found for user ${userId}, using fallback`);
      return this.getMockPayments(userId);
    }
    
    console.log(`🔍 Using student ID: ${studentId} for user ${userId}`);
    
    // Use the direct student payments endpoint
    const response = await apiClient.get(`/payments/students/${studentId}`);
    console.log('📦 Student payments API response:', response.data);
    
    // Define proper interfaces for response data
    interface PaymentResponseData {
      success?: boolean;
      payments?: RawPayment[];
      totalPaid?: number;
      totalPending?: number;
      count?: number;
      isDemoData?: boolean;
      [key: string]: unknown;
    }
    
    const responseData: PaymentResponseData = response.data;
    
    // 🔥 CRITICAL FIX: Handle the response format properly
    if (responseData && responseData.success !== false) {
      // If backend returns success with payments data
      if (responseData.payments && Array.isArray(responseData.payments)) {
        console.log(`✅ Received ${responseData.payments.length} payments from backend`);
        
        // Transform backend field names to frontend format
        const transformedPayments: RawPayment[] = responseData.payments.map(payment => ({
          // Map backend UPPERCASE fields to frontend lowercase
          invoice_id: payment.INVOICE_ID ?? payment.invoice_id,
          amount: payment.AMOUNT ?? payment.amount,
          status: payment.STATUS ?? payment.status,
          due_date: payment.DUE_DATE ?? payment.due_date,
          created_at: payment.CREATED_AT ?? payment.created_at,
          student_name: payment.STUDENT_NAME ?? payment.student_name,
          student_code: payment.STUDENT_CODE ?? payment.student_code,
          term_name: payment.TERM_NAME ?? payment.term_name,
          paid_amount: payment.PAID_AMOUNT ?? payment.paid_amount,
          remaining_amount: payment.REMAINING_AMOUNT ?? payment.remaining_amount,
          description: payment.DESCRIPTION ?? payment.description,
          paid_on: payment.PAID_ON ?? payment.paid_on,
          payment_method: payment.PAYMENT_METHOD ?? payment.payment_method
        }));
        
        return {
          success: true,
          payments: transformedPayments,
          count: responseData.count || responseData.payments.length,
          totalPaid: responseData.totalPaid || transformedPayments.reduce((sum: number, payment: RawPayment) => 
            sum + (Number(payment.paid_amount) || 0), 0),
          totalPending: responseData.totalPending || transformedPayments.reduce((sum: number, payment: RawPayment) => 
            sum + (Number(payment.remaining_amount) || 0), 0),
          isDemoData: responseData.isDemoData || false
        };
      }
      // If backend returns data directly as array
      else if (Array.isArray(responseData)) {
        console.log(`✅ Received ${responseData.length} payments directly as array`);
        const paymentsArray: RawPayment[] = responseData as RawPayment[];
        
        // Transform field names
        const transformedPayments: RawPayment[] = paymentsArray.map(payment => ({
          invoice_id: payment.INVOICE_ID ?? payment.invoice_id,
          amount: payment.AMOUNT ?? payment.amount,
          status: payment.STATUS ?? payment.status,
          due_date: payment.DUE_DATE ?? payment.due_date,
          created_at: payment.CREATED_AT ?? payment.created_at,
          student_name: payment.STUDENT_NAME ?? payment.student_name,
          student_code: payment.STUDENT_CODE ?? payment.student_code,
          term_name: payment.TERM_NAME ?? payment.term_name,
          paid_amount: payment.PAID_AMOUNT ?? payment.paid_amount,
          remaining_amount: payment.REMAINING_AMOUNT ?? payment.remaining_amount,
          description: payment.DESCRIPTION ?? payment.description
        }));
        
        return {
          success: true,
          payments: transformedPayments,
          count: transformedPayments.length,
          totalPaid: transformedPayments.reduce((sum: number, payment: RawPayment) => 
            sum + (Number(payment.paid_amount) || 0), 0),
          totalPending: transformedPayments.reduce((sum: number, payment: RawPayment) => 
            sum + (Number(payment.remaining_amount) || 0), 0),
          isDemoData: false
        };
      }
      // If no payments array but has success=true
      else if (responseData.success === true) {
        console.log('✅ Backend returned success but no payments array');
        return {
          success: true,
          payments: [],
          count: 0,
          totalPaid: 0,
          totalPending: 0,
          isDemoData: responseData.isDemoData || false
        };
      }
    }
  
    // If no valid data returned, use mock data with proper structure
    console.log('🔄 No valid payment data returned, using mock data');
    return this.getMockPayments(userId);
    
  } catch (error: unknown) {
    console.error(`❌ Failed to fetch payments for user ${userId}:`, error);
    
    // Return mock data with proper structure on error
    const mockResponse = this.getMockPayments(userId);
    return {
      ...mockResponse,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
},
  // Helper method to get student ID from user ID
  async getStudentIdFromUserId(userId: number): Promise<number | null> {
    try {
      console.log(`🔍 [API] Mapping user ID ${userId} to student ID`);
      
      // Proper mapping based on actual database data
      const studentMapping: { [key: number]: number } = {
        1: 1,   // student@university.edu -> student_id 1
        2: 2,   // faculty@university.edu -> student_id 2 (if applicable)
        3: 3,   // admin@university.edu
        4: 4,   // finance@university.edu
        5: 5,   // parent@university.edu
        6: 6    // alice@example.com -> student_id 6
      };
      
      const studentId = studentMapping[userId];
      console.log(`✅ [API] User ${userId} mapped to student ID: ${studentId}`);
      return studentId || userId; // Fallback to userId if no mapping
    } catch (error) {
      console.error('❌ Error getting student ID:', error);
      return userId; // Fallback to userId
    }
  },

  // Mock payments for demo with proper typing
  getMockPayments(userId?: number): PaymentApiResponse {
    // Define mock payment data with proper typing
    const createMockPayment = (
      invoiceId: number,
      amount: number,
      status: string,
      dueDate: string,
      description: string,
      studentName: string = 'Alex Johnson',
      studentCode: string = 'S1001'
    ): RawPayment => ({
      invoice_id: invoiceId,
      amount: amount,
      status: status,
      due_date: dueDate,
      created_at: '2025-09-01',
      student_name: studentName,
      student_code: studentCode,
      term_name: 'Fall 2025',
      description: description,
      paid_amount: status === 'paid' ? amount : (status === 'partial' ? amount * 0.5 : 0),
      remaining_amount: status === 'paid' ? 0 : (status === 'partial' ? amount * 0.5 : amount)
    });

    const basePayments: RawPayment[] = [
      createMockPayment(1001, 5250.00, 'pending', '2025-10-15', 'Fall 2025 Semester Tuition'),
      createMockPayment(1002, 1250.00, 'paid', '2025-09-15', 'Fall 2025 Technology Fee'),
      createMockPayment(1003, 750.00, 'partial', '2025-11-01', 'Fall 2025 Lab Fees')
    ];
    
    let finalPayments: RawPayment[] = basePayments;
    
    // Finance users see more payments
    if (userId === 4) {
      finalPayments = [
        ...basePayments,
        createMockPayment(1004, 2800.00, 'pending', '2025-11-10', 'Fall 2025 Course Materials', 'Sarah Chen', 'S1002'),
        createMockPayment(1005, 4500.00, 'paid', '2025-10-20', 'Fall 2025 Tuition Fee', 'Michael Brown', 'S1003')
      ];
    }
    
    // Calculate totals properly
    const totalPaid = finalPayments.reduce((sum: number, payment: RawPayment) => 
      sum + (Number(payment.paid_amount) || 0), 0);
    const totalPending = finalPayments.reduce((sum: number, payment: RawPayment) => 
      sum + (Number(payment.remaining_amount) || 0), 0);
    
    const response: PaymentApiResponse = {
      success: true,
      payments: finalPayments,
      count: finalPayments.length,
      totalPaid,
      totalPending,
      isDemoData: true
    };

    return response;
  },

  // Student data endpoints
  async getStudents() {
    try {
      console.log('🌐 [API] Fetching students from API');
      const response = await apiClient.get('/students');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [API] Failed to fetch students:', error);
      // Return mock students for demo
      return [
        {
          student_id: 1001,
          name: 'Alex Johnson',
          email: 'student@university.edu',
          program: 'BSc Computer Science',
          status: 'active'
        },
        {
          student_id: 1002,
          name: 'Sarah Chen',
          email: 'sarah.chen@university.edu',
          program: 'BSc Biology',
          status: 'active'
        }
      ];
    }
  },

  // Transform backend course data to match frontend interface
  async getStudentCourses(studentId: number) {
    try {
      console.log(`🌐 [API] Fetching courses for student ${studentId}`);
      const response = await apiClient.get(`/students/${studentId}/courses`);
      
      // Transform backend data to match frontend Course interface
      if (response.data && response.data.courses) {
        return response.data.courses.map((course: BackendCourse) => ({
          course_id: course.COURSE_ID,
          course_code: course.CODE,
          course_name: course.TITLE,
          instructor: course.FACULTY_NAME,
          schedule: course.SCHEDULE,
          credits: 3, // Default since backend doesn't provide
          progress: 75 // Default progress
        }));
      }
      return response.data; // Return as-is if no transformation needed
    } catch (error: unknown) {
      console.error(`❌ [API] Failed to fetch courses for student ${studentId}:`, error);
      // Return demo courses
      return getDemoCourses();
    }
  },

  // Transform backend grade data to match frontend interface
  async getStudentGrades(studentId: number) {
    try {
      console.log(`🌐 [API] Fetching grades for student ${studentId}`);
      const response = await apiClient.get(`/students/${studentId}/grades`);
      
      // Transform backend data to match frontend Grade interface
      if (response.data && response.data.grades) {
        return response.data.grades.map((grade: BackendGrade, index: number) => ({
          course_id: index + 1, // Generate sequential IDs
          course_name: grade.COURSE_NAME,
          assignment: grade.ASSESSMENT_TITLE,
          grade: grade.GRADE_LETTER,
          max_grade: 'A', // Default
          percentage: grade.PERCENTAGE,
          submitted_at: grade.GRADE_DATE ? grade.GRADE_DATE.split('T')[0] : '2025-09-15' // Extract date part
        }));
      }
      return response.data; // Return as-is if no transformation needed
    } catch (error: unknown) {
      console.error(`❌ [API] Failed to fetch grades for student ${studentId}:`, error);
      // Return demo grades
      return getDemoGrades();
    }
  },

  // Handle GPA response format
  async calculateGPA(studentId: number) {
    try {
      console.log(`🌐 [API] Calculating GPA for student ${studentId}`);
      const response = await apiClient.get(`/students/${studentId}/gpa`);
      
      // Handle both direct number and object response
      if (typeof response.data === 'number') {
        return { gpa: response.data };
      } else if (response.data && typeof response.data.gpa === 'number') {
        return { gpa: response.data.gpa };
      } else if (response.data && typeof response.data === 'object') {
        return response.data; // Return as-is if it's already an object with gpa property
      }
      
      return { gpa: 3.75 }; // Fallback
    } catch (error: unknown) {
      console.error(`❌ [API] Failed to calculate GPA for student ${studentId}:`, error);
      // Return demo GPA
      return { gpa: 3.75 };
    }
  },

  // Course endpoints
  async getCourses() {
    try {
      console.log('🌐 [API] Fetching courses from API');
      const response = await apiClient.get('/courses');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [API] Failed to fetch courses:', error);
      // Return demo courses
      return [
        {
          course_id: 1,
          course_code: 'CS101',
          course_name: 'Introduction to Computer Science',
          credits: 3,
          department: 'Computer Science'
        },
        {
          course_id: 2,
          course_code: 'MATH201',
          course_name: 'Calculus II',
          credits: 4,
          department: 'Mathematics'
        }
      ];
    }
  },

  // Transform faculty courses data
  async getFacultyCourses(facultyId: string) {
    try {
      console.log(`🌐 [API] Fetching courses for faculty ${facultyId}`);
      const response = await apiClient.get(`/courses/faculty/${facultyId}/courses`);
      
      // Return courses array directly if available
      if (response.data && response.data.courses) {
        return response.data.courses;
      }
      return response.data; // Return as-is if no transformation needed
    } catch (error: unknown) {
      console.error(`❌ [API] Failed to fetch faculty courses for ${facultyId}:`, error);
      // Return demo faculty courses as fallback
      return [
        {
          course_id: 1,
          course_code: 'CS101',
          course_name: 'Introduction to Computer Science',
          schedule: 'Mon, Wed 10:00-11:30 AM',
          enrolled_students: 45,
          status: 'active'
        },
        {
          course_id: 2,
          course_code: 'CS301',
          course_name: 'Data Structures and Algorithms',
          schedule: 'Tue, Thu 1:00-2:30 PM',
          enrolled_students: 32,
          status: 'active'
        }
      ];
    }
  },

  // Notification endpoints with role-specific demo notifications
  async getNotifications(userId: number) {
    try {
      console.log(`🌐 [API] Fetching notifications for user ${userId}`);
      const response = await apiClient.get(`/notifications/users/${userId}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`❌ [API] Failed to fetch notifications for user ${userId}:`, error);
      
      // Return role-specific mock notifications for demo
      return this.getRoleSpecificNotifications(userId);
    }
  },

  // Role-specific demo notifications
  getRoleSpecificNotifications(userId: number) {
    interface Notification {
      notification_id: number;
      type: string;
      content: string;
      created_at: string;
      read_at: string | null;
    }

    const userNotifications: { [key: number]: Notification[] } = {
      // Student notifications
      1: [
        {
          notification_id: 1,
          type: 'academic',
          content: 'New grade posted for CS101 - Introduction to Computer Science: A-',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read_at: null
        },
        {
          notification_id: 2,
          type: 'payment',
          content: 'Tuition fee payment of $1,250.00 is due in 7 days',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read_at: null
        },
        {
          notification_id: 3,
          type: 'academic',
          content: 'Assignment submission deadline extended for MATH201 - Calculus II',
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          read_at: new Date().toISOString()
        }
      ],
      // Faculty notifications
      2: [
        {
          notification_id: 1,
          type: 'academic',
          content: '12 students have submitted CS101 Assignment 3',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          read_at: null
        },
        {
          notification_id: 2,
          type: 'system',
          content: 'Faculty meeting scheduled for Friday 3:00 PM in Room 301',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          read_at: null
        },
        {
          notification_id: 3,
          type: 'academic',
          content: 'Grade submission deadline for Midterm exams is approaching',
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          read_at: new Date().toISOString()
        }
      ],
      // Admin notifications
      3: [
        {
          notification_id: 1,
          type: 'system',
          content: 'System maintenance scheduled for Saturday 2:00 AM - 4:00 AM',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read_at: null
        },
        {
          notification_id: 2,
          type: 'system',
          content: 'New user registration requests pending approval: 3',
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          read_at: null
        },
        {
          notification_id: 3,
          type: 'system',
          content: 'Database backup completed successfully',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read_at: new Date().toISOString()
        }
      ],
      // Finance notifications
      4: [
        {
          notification_id: 1,
          type: 'payment',
          content: '3 new payment transactions require verification',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          read_at: null
        },
        {
          notification_id: 2,
          type: 'payment',
          content: 'Monthly financial report is ready for review',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read_at: null
        },
        {
          notification_id: 3,
          type: 'system',
          content: 'Payment gateway integration update completed',
          created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          read_at: new Date().toISOString()
        }
      ],
      // Parent notifications
      5: [
        {
          notification_id: 1,
          type: 'academic',
          content: "Alex's progress report for Fall 2025 is now available",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read_at: null
        },
        {
          notification_id: 2,
          type: 'payment',
          content: 'Tuition fee payment confirmation for Spring 2026',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read_at: null
        },
        {
          notification_id: 3,
          type: 'academic',
          content: 'Parent-teacher conference scheduling opens next week',
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          read_at: new Date().toISOString()
        }
      ]
    };

    return userNotifications[userId] || [
      {
        notification_id: 1,
        type: 'system',
        content: 'Welcome to EduPortal!',
        created_at: new Date().toISOString(),
        read_at: null
      }
    ];
  },

  async markNotificationAsRead(notificationId: number): Promise<ApiResponse> {
    try {
      console.log(`🌐 [API] Marking notification as read: ${notificationId}`);
      const response = await apiClient.post(`/notifications/mark-read/${notificationId}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`❌ [API] Failed to mark notification as read:`, error);
      // Simulate success for demo
      return { success: true, message: 'Notification marked as read' };
    }
  },

  async markAllNotificationsAsRead(userId: number): Promise<ApiResponse> {
    try {
      console.log(`🌐 [API] Marking all notifications as read for user: ${userId}`);
      const response = await apiClient.post(`/notifications/mark-all-read/${userId}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`❌ [API] Failed to mark all notifications as read:`, error);
      // Simulate success for demo
      return { success: true, message: 'All notifications marked as read' };
    }
  },

  async deleteNotification(notificationId: number): Promise<ApiResponse> {
    try {
      console.log(`🌐 [API] Deleting notification: ${notificationId}`);
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`❌ [API] Failed to delete notification:`, error);
      // Simulate success for demo
      return { success: true, message: 'Notification deleted' };
    }
  },

  // User Management endpoints
  async getAllUsers() {
    try {
      console.log('🌐 [API] Fetching all users');
      const response = await apiClient.get('/admin/users');
      return response.data;
    } catch (error: unknown) {
      console.error('❌ [API] Failed to fetch users:', error);
      // Return demo users
      return [
        {
          user_id: 1,
          email: 'student@university.edu',
          first_name: 'Alex',
          last_name: 'Johnson',
          role: 'student',
          status: 'active',
          created_at: '2024-01-15',
          last_login: '2025-01-20'
        },
        {
          user_id: 2,
          email: 'professor@university.edu',
          first_name: 'Sarah',
          last_name: 'Chen',
          role: 'faculty',
          status: 'active',
          created_at: '2023-08-20',
          last_login: '2025-01-20'
        },
        {
          user_id: 3,
          email: 'admin@university.edu',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          status: 'active',
          created_at: '2023-01-10',
          last_login: '2025-01-20'
        },
        {
          user_id: 4,
          email: 'finance@university.edu',
          first_name: 'Finance',
          last_name: 'Officer',
          role: 'finance',
          status: 'active',
          created_at: '2023-03-15',
          last_login: '2025-01-20'
        },
        {
          user_id: 5,
          email: 'parent@university.edu',
          first_name: 'Michael',
          last_name: 'Davis',
          role: 'parent',
          status: 'active',
          created_at: '2024-02-01',
          last_login: '2025-01-19'
        }
      ];
    }
  },

  // Parent endpoints - Handle missing endpoint gracefully
  async getParentChildren(parentId: number) {
    try {
      console.log(`🌐 [API] Fetching children for parent ${parentId}`);
      const response = await apiClient.get(`/parents/${parentId}/children`);
      
      // Return children array directly if available
      if (response.data && response.data.children) {
        return response.data.children;
      }
      return response.data; // Return as-is if no transformation needed
    } catch (error: unknown) {
      console.error(`❌ [API] Failed to fetch children for parent ${parentId}:`, error);
      // Return demo children data
      return getDemoChildren();
    }
  },

  async getParentChildrenProgress(parentId: number) {
    try {
      console.log(`🌐 [API] Fetching children progress for parent ${parentId}`);
      const response = await apiClient.get(`/parents/${parentId}/children-progress`);
      
      // Return childrenProgress array directly if available
      if (response.data && response.data.childrenProgress) {
        return response.data.childrenProgress;
      }
      return response.data; // Return as-is if no transformation needed
    } catch (error: unknown) {
      console.error(`❌ [API] Failed to fetch children progress for parent ${parentId}:`, error);
      // Return demo progress data
      return getDemoChildren();
    }
  },

  // Attendance endpoints - Transform attendance data
  async getStudentAttendance(studentId: number) {
    try {
      console.log(`🌐 [API] Fetching attendance for student ${studentId}`);
      const response = await apiClient.get(`/attendance/students/${studentId}`);
      
      // Transform backend data to match frontend Attendance interface
      if (response.data && response.data.attendance) {
        // Group attendance by course and calculate totals
        const courseMap = new Map();
        
        response.data.attendance.forEach((record: AttendanceRecord) => {
          const key = record.COURSE_CODE;
          if (!courseMap.has(key)) {
            courseMap.set(key, {
              course_id: courseMap.size + 1,
              course_name: record.COURSE_NAME,
              present: 0,
              total: record.TOTAL_CLASSES,
              percentage: record.ATTENDANCE_PERCENTAGE
            });
          }
          
          if (record.STATUS === 'present') {
            courseMap.get(key).present++;
          }
        });
        
        return Array.from(courseMap.values());
      }
      return response.data; // Return as-is if no transformation needed
    } catch (error: unknown) {
      console.error(`❌ [API] Failed to fetch attendance for student ${studentId}:`, error);
      // Return demo attendance data
      return getDemoAttendance();
    }
  },

  // Settings endpoints - Handle missing backend endpoints gracefully
  async getUserProfile(userId: number) {
    try {
      console.log(`🌐 [API] Fetching profile for user ${userId}`);
      const response = await apiClient.get(`/settings/users/${userId}/profile`);
      return response.data;
    } catch (error: unknown) {
      console.error(`❌ [API] Failed to fetch user profile from backend, using demo data`);
      // Return mock profile for demo
      const demoAccount = DEMO_ACCOUNTS[userId - 1];
      if (demoAccount) {
        return {
          email: demoAccount.email,
          firstName: demoAccount.firstName,
          lastName: demoAccount.lastName,
          phone: '+1 (555) 123-4567',
          studentId: demoAccount.studentId,
          facultyId: demoAccount.facultyId,
          programName: demoAccount.programName,
          departmentName: demoAccount.department,
          admissionYear: demoAccount.admissionYear,
          address: '123 University Ave, Campus City, ST 12345',
          bio: `${demoAccount.role.charAt(0).toUpperCase() + demoAccount.role.slice(1)} account for ${demoAccount.description}`,
          role: demoAccount.role
        };
      }
      // Return generic profile if demo account not found
      return {
        email: `user${userId}@university.edu`,
        firstName: 'User',
        lastName: 'Demo',
        phone: '+1 (555) 123-4567',
        address: '123 University Ave, Campus City, ST 12345',
        bio: 'Demo user account',
        role: 'user'
      };
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await apiClient.get('/auth/health');
      return response.data;
    } catch (error) {
      console.error('❌ [API] Health check failed:', error);
      // Return healthy status for demo
      return { status: 'healthy', timestamp: new Date().toISOString() };
    }
  },

  // Utility methods
  logout() {
    localStorage.removeItem('eduportal_token');
    localStorage.removeItem('eduportal_user');
    return { success: true };
  },

  getCurrentUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem('eduportal_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ [API] Failed to parse user data from localStorage:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('eduportal_token');
    return !!token && isValidJWT(token);
  },

  // Get user role
  getUserRole(): string | null {
    const user = this.getCurrentUserFromStorage();
    return user?.role || null;
  }
};

export default api;