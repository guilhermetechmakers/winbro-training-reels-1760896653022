// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin' | 'trainer' | 'learner';
  company: string;
  emailVerified: boolean;
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
  // Additional course properties
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  tags: string[];
  visibility: 'private' | 'public' | 'organization';
  customerScope: string[];
  requiresApproval: boolean;
  allowDownloads: boolean;
  enableCertificates: boolean;
  passThreshold: number; // percentage for completion
  metadata: Record<string, any>;
  // Database fields
  userId: string;
  enrolledCount: number;
}

export interface CourseModule {
  id: string;
  title: string;
  type: 'reel' | 'text' | 'quiz';
  content: Reel | TextContent | Quiz;
  order: number;
  // Additional module properties
  description?: string;
  estimatedDuration: number; // in seconds
  isRequired: boolean;
  unlockAfterPrevious: boolean;
  contentId?: string; // references videos.id for reels, course_quizzes.id for quizzes
  contentData?: Record<string, any>; // for text modules and other content
  // Database fields
  courseId: string;
  orderIndex: number;
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
  // Additional quiz properties
  points: number;
  timeLimit?: number; // in seconds, null for no limit
  courseId: string;
  moduleId?: string;
  // Database fields
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

// Course Quiz type (for database)
export interface CourseQuiz {
  id: string;
  courseId: string;
  moduleId?: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit?: number;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  modules: Omit<CourseModule, 'id' | 'courseId' | 'orderIndex'>[];
  // Additional course creation properties
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  tags?: string[];
  visibility?: 'private' | 'public' | 'organization';
  customerScope?: string[];
  requiresApproval?: boolean;
  allowDownloads?: boolean;
  enableCertificates?: boolean;
  passThreshold?: number;
  metadata?: Record<string, any>;
}

// Course enrollment and progress types
export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  completedAt?: string;
  progressPercentage: number;
  score?: number;
  modulesCompleted: string[];
  lastAccessedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseCompletion {
  id: string;
  enrollmentId: string;
  moduleId: string;
  completedAt: string;
  score?: number;
  timeSpent: number; // in seconds
  attempts: number;
  createdAt: string;
}

// Course builder specific types
export interface CourseBuilderState {
  course: Partial<Course>;
  modules: CourseModule[];
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: string;
}

export interface DragDropItem {
  id: string;
  type: 'reel' | 'text' | 'quiz';
  title: string;
  duration?: number;
  thumbnail?: string;
}

export interface CoursePreview {
  course: Course;
  modules: CourseModule[];
  totalDuration: number;
  estimatedTime: string;
  moduleCount: number;
  quizCount: number;
  reelCount: number;
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

// Re-export video types
export * from './video';

// Re-export auth types
export * from './auth';

// Re-export quiz types
export * from './quiz';