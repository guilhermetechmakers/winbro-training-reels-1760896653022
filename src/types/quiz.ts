/**
 * Quiz-related types for Winbro Training Reels
 * Based on course_quizzes table structure
 */

// Quiz question types
export type QuizQuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

// Quiz answer for different question types
export interface QuizAnswer {
  questionId: string;
  answer: string | string[]; // single answer or multiple answers
  isCorrect: boolean;
  timeSpent: number; // in seconds
  submittedAt: string;
}

// Quiz attempt tracking
export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  courseId: string;
  moduleId?: string;
  answers: QuizAnswer[];
  score: number; // percentage
  totalPoints: number;
  earnedPoints: number;
  timeSpent: number; // total time in seconds
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  status: 'in-progress' | 'completed' | 'abandoned';
}

// Quiz session state for UI
export interface QuizSession {
  quizId: string;
  courseId: string;
  moduleId?: string;
  questions: CourseQuiz[];
  currentQuestionIndex: number;
  answers: Map<string, QuizAnswer>;
  timeRemaining?: number; // in seconds
  isCompleted: boolean;
  isSubmitted: boolean;
  startedAt: string;
  completedAt?: string;
}

// Quiz result summary
export interface QuizResult {
  quizId: string;
  courseId: string;
  moduleId?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  passed: boolean;
  passThreshold: number;
  completedAt: string;
  answers: QuizAnswer[];
  feedback?: string;
}

// Quiz configuration for UI
export interface QuizConfig {
  allowRetake: boolean;
  maxAttempts: number;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  timeLimit?: number; // in seconds
  passThreshold: number; // percentage
}

// Quiz builder types
export interface QuizBuilderState {
  quiz: Partial<CourseQuiz>;
  questions: CourseQuiz[];
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: string;
}

// Quiz question form data
export interface QuizQuestionForm {
  question: string;
  type: QuizQuestionType;
  options: string[]; // for multiple choice
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit?: number;
}

// Quiz validation errors
export interface QuizValidationError {
  field: string;
  message: string;
}

// Quiz statistics for analytics
export interface QuizStats {
  quizId: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  mostMissedQuestions: string[];
  difficultyRating: number; // 1-5 scale
}

// Quiz export/import types
export interface QuizExport {
  quiz: CourseQuiz;
  questions: CourseQuiz[];
  metadata: {
    exportedAt: string;
    version: string;
    courseTitle: string;
  };
}

// Quiz component props
export interface QuizPlayerProps {
  quizId: string;
  courseId: string;
  moduleId?: string;
  onComplete: (result: QuizResult) => void;
  onExit?: () => void;
  config?: Partial<QuizConfig>;
}

export interface QuizQuestionProps {
  question: CourseQuiz;
  questionNumber: number;
  totalQuestions: number;
  answer?: QuizAnswer;
  onAnswer: (answer: QuizAnswer) => void;
  timeRemaining?: number;
  isSubmitted: boolean;
}

export interface QuizResultsProps {
  result: QuizResult;
  onRetake?: () => void;
  onContinue?: () => void;
  onExit?: () => void;
}

export interface QuizBuilderProps {
  courseId: string;
  moduleId?: string;
  quizId?: string;
  onSave: (quiz: CourseQuiz) => void;
  onCancel: () => void;
}

// Quiz hook return types
export interface UseQuizReturn {
  quiz: CourseQuiz | null;
  questions: CourseQuiz[];
  session: QuizSession | null;
  isLoading: boolean;
  error: string | null;
  startQuiz: () => void;
  submitAnswer: (questionId: string, answer: string | string[]) => void;
  submitQuiz: () => Promise<QuizResult>;
  retakeQuiz: () => void;
  exitQuiz: () => void;
}

export interface UseQuizBuilderReturn {
  quiz: CourseQuiz | null;
  questions: CourseQuiz[];
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  isSaving: boolean;
  addQuestion: (question: QuizQuestionForm) => Promise<void>;
  updateQuestion: (questionId: string, updates: Partial<QuizQuestionForm>) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  reorderQuestions: (questionIds: string[]) => Promise<void>;
  saveQuiz: () => Promise<void>;
  publishQuiz: () => Promise<void>;
  validateQuiz: () => QuizValidationError[];
}

// Quiz API response types
export interface QuizAttemptResponse {
  attempt: QuizAttempt;
  result: QuizResult;
  nextQuiz?: string; // if there's a next quiz in the course
}

export interface QuizStatsResponse {
  stats: QuizStats;
  recentAttempts: QuizAttempt[];
  topPerformers: Array<{
    userId: string;
    userName: string;
    bestScore: number;
    attempts: number;
  }>;
}

// Quiz validation error
export interface QuizValidationError {
  field: string;
  message: string;
}

// CourseQuiz type definition
export interface CourseQuiz {
  id: string;
  courseId: string;
  moduleId?: string;
  question: string;
  type: QuizQuestionType;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit?: number;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}
// Enhanced quiz features
export interface QuizConfiguration {
  id: string;
  course_id: string;
  quiz_id?: string;
  allow_retake: boolean;
  max_attempts: number;
  show_correct_answers: boolean;
  show_explanations: boolean;
  randomize_questions: boolean;
  randomize_answers: boolean;
  time_limit?: number;
  pass_threshold: number;
  require_all_questions: boolean;
  allow_skip_questions: boolean;
  show_progress: boolean;
  show_timer: boolean;
  auto_submit: boolean;
  immediate_feedback: boolean;
  show_score_breakdown: boolean;
  custom_feedback?: string;
  created_at: string;
  updated_at: string;
}

// Certificate interface
export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id: string;
  certificate_number: string;
  title: string;
  recipient_name: string;
  course_title: string;
  completion_date: string;
  score: number;
  template_id: string;
  issued_by: string;
  issuer_signature?: string;
  verification_code: string;
  status: 'active' | 'revoked' | 'expired';
  expires_at?: string;
  pdf_url?: string;
  thumbnail_url?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Learning analytics event
export interface LearningAnalyticsEvent {
  id: string;
  user_id: string;
  course_id: string;
  module_id?: string;
  quiz_id?: string;
  event_type: string;
  event_data: Record<string, any>;
  duration: number;
  score?: number;
  progress_percentage?: number;
  session_id?: string;
  device_type?: string;
  browser_info?: string;
  created_at: string;
}

// Enhanced quiz session with configuration
export interface EnhancedQuizSession extends QuizSession {
  configuration: QuizConfiguration;
  timeRemaining?: number;
  currentAttempt: number;
  maxAttempts: number;
  canRetake: boolean;
  showProgress: boolean;
  showTimer: boolean;
  immediateFeedback: boolean;
}

// Enhanced quiz result with certificate info
export interface EnhancedQuizResult extends QuizResult {
  certificate?: Certificate;
  canRetake: boolean;
  attemptsRemaining: number;
  nextRetakeDate?: string;
  feedback?: string;
}

// Quiz configuration form data
export interface QuizConfigurationForm {
  allow_retake: boolean;
  max_attempts: number;
  show_correct_answers: boolean;
  show_explanations: boolean;
  randomize_questions: boolean;
  randomize_answers: boolean;
  time_limit?: number;
  pass_threshold: number;
  require_all_questions: boolean;
  allow_skip_questions: boolean;
  show_progress: boolean;
  show_timer: boolean;
  auto_submit: boolean;
  immediate_feedback: boolean;
  show_score_breakdown: boolean;
  custom_feedback?: string;
}

// Quiz analytics
export interface QuizAnalytics {
  quiz_id: string;
  quiz_title: string;
  total_attempts: number;
  unique_attempts: number;
  average_score: number;
  pass_rate: number;
  average_time_spent: number;
  question_analytics: Array<{
    question_id: string;
    question_text: string;
    correct_rate: number;
    average_time: number;
    common_wrong_answers: string[];
  }>;
  difficulty_analysis: {
    easy_questions: number;
    medium_questions: number;
    hard_questions: number;
    overall_difficulty: number;
  };
  user_performance: Array<{
    user_id: string;
    user_name: string;
    best_score: number;
    attempts: number;
    last_attempt: string;
  }>;
}

// Enhanced quiz component props
export interface EnhancedQuizPlayerProps extends QuizPlayerProps {
  configuration?: QuizConfiguration;
  onCertificateEarned?: (certificate: Certificate) => void;
  onAnalyticsEvent?: (event: LearningAnalyticsEvent) => void;
}

export interface QuizConfigurationProps {
  courseId: string;
  quizId?: string;
  configuration?: QuizConfiguration;
  onSave: (configuration: QuizConfiguration) => void;
  onCancel: () => void;
}

export interface CertificateDisplayProps {
  certificate: Certificate;
  onDownload?: () => void;
  onShare?: () => void;
  onVerify?: () => void;
}

// Enhanced quiz hooks return types
export interface UseEnhancedQuizReturn extends UseQuizReturn {
  configuration: QuizConfiguration | null;
  certificate: Certificate | null;
  analytics: QuizAnalytics | null;
  startQuizWithConfig: (config: QuizConfiguration) => void;
  logAnalyticsEvent: (event: Omit<LearningAnalyticsEvent, 'id' | 'created_at'>) => void;
  generateCertificate: () => Promise<Certificate>;
}

export interface UseQuizConfigurationReturn {
  configuration: QuizConfiguration | null;
  isLoading: boolean;
  error: string | null;
  updateConfiguration: (updates: Partial<QuizConfiguration>) => Promise<void>;
  saveConfiguration: () => Promise<void>;
  resetConfiguration: () => void;
  validateConfiguration: () => QuizValidationError[];
}
