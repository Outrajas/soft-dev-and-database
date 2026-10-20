export interface User {
  userId: number;
  email: string;
  role: 'student' | 'faculty' | 'admin' | 'finance' | 'parent';
  firstName: string;
  lastName: string;
  studentId?: string;
  facultyId?: string;
  department?: string;
  programName?: string;
  admissionYear?: number;
  
  permissions: string[];
  lastLogin: string;
  isDemo: boolean;
}

export interface DemoAccount {
  email: string;
  password: string;
  role: string;
  name: string;
  firstName: string;
  lastName: string;
  facultyId?: string;
  studentId?: string;
  permissions: string[];
  isDemo?: boolean;
  programName?: string;
  department?: string;
  admissionYear?: number;
  description: string;
  features: string[];
  
  // Add all the optional properties you're using
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  gpa?: number;
  creditsCompleted?: number;
  enrollmentStatus?: string;
  officeLocation?: string;
  officeHours?: string;
  hireDate?: string;
  specialization?: string;
  officePhone?: string;
  employeeId?: string;
  securityLevel?: string;
  authorizedLimit?: number;
  occupation?: string;
  relationshipToStudent?: string;
  linkedStudents?: string[];
  notificationPreferences?: string[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
  currentUser: User | null;
  demoAccounts: DemoAccount[];
}

export interface StoredUserData {
  userId?: number;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  studentId?: string;
  facultyId?: string;
  department?: string;
  programName?: string;
  admissionYear?: number;
  lastLogin?: string;
  isDemo?: boolean;
}

export interface ApiError {
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

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;}
