// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin' | 'trainer' | 'learner';
  company: string;
  createdAt: string;
  updatedAt: string;
}

// Reel types
export interface Reel {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  thumbnailUrl: string;
  videoUrl: string;
  transcript: TranscriptSegment[];
  tags: string[];
  author: User;
  status: 'draft' | 'pending' | 'published' | 'archived';
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptSegment {
  time: number; // in seconds
  text: string;
}

export interface CreateReelInput {
  title: string;
  description: string;
  videoFile: File;
  tags: string[];
  machineModel?: string;
  process?: string;
  tooling?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
  author: User;
  status: 'draft' | 'published' | 'archived';
  totalDuration: number; // in seconds
  enrolledUsers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  title: string;
  type: 'reel' | 'text' | 'quiz';
  content: Reel | TextContent | Quiz;
  order: number;
}

export interface TextContent {
  text: string;
}

export interface Quiz {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  modules: Omit<CourseModule, 'id'>[];
}

// Analytics types
export interface Analytics {
  totalReels: number;
  totalCourses: number;
  totalUsers: number;
  totalViews: number;
  completionRate: number;
  topReels: Reel[];
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'view' | 'complete' | 'bookmark' | 'upload';
  userId: string;
  resourceId: string;
  resourceType: 'reel' | 'course';
  timestamp: string;
}

// Search types
export interface SearchResult {
  id: string;
  title: string;
  type: 'reel' | 'course' | 'transcript';
  description?: string;
  thumbnail?: string;
  duration?: string;
  score: number;
}

export interface SearchFilters {
  type?: 'reel' | 'course' | 'all';
  tags?: string[];
  author?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  duration?: {
    min: number;
    max: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupForm {
  company: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTOS: boolean;
  acceptMarketing: boolean;
}

export interface DemoRequestForm {
  name: string;
  company: string;
  email: string;
  machines: string;
}