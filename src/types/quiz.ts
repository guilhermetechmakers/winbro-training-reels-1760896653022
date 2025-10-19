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