/**
 * Course Builder specific types for Winbro Training Reels
 * Enhanced types for the course creation and management interface
 */

import type { Course, CourseModule, CourseQuiz } from './index';

// Course Builder State Management
export interface CourseBuilderState {
  course: Partial<Course>;
  modules: CourseModule[];
  quizzes: CourseQuiz[];
  isDirty: boolean;
  isSaving: boolean;
  isAutoSaving: boolean;
  lastSaved?: string;
  hasUnsavedChanges: boolean;
  currentStep: CourseBuilderStep;
  validationErrors: CourseBuilderValidationError[];
}

// Course Builder Steps
export type CourseBuilderStep = 
  | 'metadata'
  | 'timeline'
  | 'quizzes'
  | 'preview'
  | 'publish';

// Course Builder Validation
export interface CourseBuilderValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  step: CourseBuilderStep;
}

// Course Metadata Form
export interface CourseMetadataForm {
  title: string;
  description: string;
  targetRole: string;
  estimatedTime: number; // in minutes
  prerequisites: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  visibility: 'private' | 'public' | 'organization';
  customerScope: string[];
  requiresApproval: boolean;
  allowDownloads: boolean;
  enableCertificates: boolean;
  passThreshold: number;
}

// Timeline Item Types
export type TimelineItemType = 'reel' | 'text' | 'quiz' | 'resource';

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  title: string;
  description?: string;
  duration?: number; // in seconds
  thumbnail?: string;
  order: number;
  isRequired: boolean;
  unlockAfterPrevious: boolean;
  // Content references
  contentId?: string; // for reels and quizzes
  contentData?: Record<string, any>; // for text and resources
  // UI state
  isExpanded?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
}

// Drag and Drop Types
export interface DragDropItem {
  id: string;
  type: TimelineItemType;
  title: string;
  duration?: number;
  thumbnail?: string;
  source: 'library' | 'timeline' | 'quiz-builder';
  data: any;
}

export interface DragDropResult {
  sourceIndex: number;
  destinationIndex: number;
  item: DragDropItem;
  dropTarget: 'timeline' | 'trash' | 'quiz-builder';
}

// Text Content Types
export interface TextContent {
  id: string;
  title: string;
  content: string;
  format: 'markdown' | 'html' | 'plain';
  estimatedDuration: number;
  createdAt: string;
  updatedAt: string;
}

// Resource Types
export interface ResourceContent {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'image' | 'other';
  fileSize: number;
  thumbnailUrl?: string;
  estimatedDuration: number;
  createdAt: string;
  updatedAt: string;
}

// Quiz Builder Types
export interface QuizBuilderState {
  quiz: Partial<CourseQuiz>;
  questions: CourseQuiz[];
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: string;
  validationErrors: QuizValidationError[];
}

export interface QuizValidationError {
  field: string;
  message: string;
  questionId?: string;
}

export interface QuizQuestionForm {
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options: string[]; // for multiple choice
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit?: number;
  orderIndex: number;
}

// Preview Mode Types
export interface CoursePreview {
  course: Course;
  modules: CourseModule[];
  totalDuration: number;
  estimatedTime: string;
  moduleCount: number;
  quizCount: number;
  reelCount: number;
  textCount: number;
  resourceCount: number;
}

export interface PreviewSettings {
  showProgress: boolean;
  showTimer: boolean;
  allowSkip: boolean;
  autoAdvance: boolean;
  showHints: boolean;
  enableNotes: boolean;
}

// Publish Controls Types
export interface PublishSettings {
  visibility: 'private' | 'public' | 'organization';
  customerScope: string[];
  requiresApproval: boolean;
  scheduledPublish?: string;
  allowDownloads: boolean;
  enableCertificates: boolean;
  passThreshold: number;
  notifyUsers: boolean;
  notificationMessage?: string;
}

export interface CourseAssignment {
  id: string;
  courseId: string;
  userId?: string;
  groupId?: string;
  assignedAt: string;
  dueDate?: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue';
  assignedBy: string;
}

// Versioning Types
export interface CourseVersion {
  id: string;
  courseId: string;
  version: string;
  title: string;
  description: string;
  modules: CourseModule[];
  publishedAt?: string;
  createdBy: string;
  createdAt: string;
  changes: string[];
  isCurrent: boolean;
}

export interface VersionHistory {
  versions: CourseVersion[];
  currentVersion: string;
  canRevert: boolean;
  canCompare: boolean;
}

// Auto-save Types
export interface AutoSaveState {
  isEnabled: boolean;
  interval: number; // in milliseconds
  lastSaved: string;
  isSaving: boolean;
  hasError: boolean;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
}

// Course Builder Hooks Return Types
export interface UseCourseBuilderReturn {
  state: CourseBuilderState;
  metadata: CourseMetadataForm;
  timeline: TimelineItem[];
  quizzes: CourseQuiz[];
  preview: CoursePreview | null;
  publishSettings: PublishSettings;
  versionHistory: VersionHistory;
  autoSave: AutoSaveState;
  
  // Actions
  updateMetadata: (updates: Partial<CourseMetadataForm>) => void;
  addTimelineItem: (item: Omit<TimelineItem, 'id' | 'order'>) => void;
  updateTimelineItem: (id: string, updates: Partial<TimelineItem>) => void;
  removeTimelineItem: (id: string) => void;
  reorderTimelineItems: (itemIds: string[]) => void;
  addQuiz: (quiz: QuizQuestionForm) => void;
  updateQuiz: (id: string, updates: Partial<QuizQuestionForm>) => void;
  removeQuiz: (id: string) => void;
  reorderQuizzes: (quizIds: string[]) => void;
  updatePublishSettings: (updates: Partial<PublishSettings>) => void;
  
  // Course management
  saveCourse: () => Promise<void>;
  publishCourse: () => Promise<void>;
  unpublishCourse: () => Promise<void>;
  duplicateCourse: () => Promise<string>;
  deleteCourse: () => Promise<void>;
  
  // Preview and validation
  generatePreview: () => void;
  validateCourse: () => CourseBuilderValidationError[];
  clearValidationErrors: () => void;
  
  // Versioning
  createVersion: (description: string) => Promise<void>;
  revertToVersion: (versionId: string) => Promise<void>;
  compareVersions: (version1: string, version2: string) => void;
  
  // Auto-save
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  forceSave: () => Promise<void>;
  
  // Navigation
  goToStep: (step: CourseBuilderStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  canProceed: boolean;
  canGoBack: boolean;
}

// Course Builder Component Props
export interface CourseBuilderProps {
  courseId?: string;
  onSave?: (course: Course) => void;
  onPublish?: (course: Course) => void;
  onCancel?: () => void;
  initialStep?: CourseBuilderStep;
  readOnly?: boolean;
}

export interface CourseMetadataFormProps {
  metadata: CourseMetadataForm;
  onChange: (updates: Partial<CourseMetadataForm>) => void;
  errors: CourseBuilderValidationError[];
  onNext: () => void;
  onCancel: () => void;
}

export interface TimelineBuilderProps {
  items: TimelineItem[];
  onAddItem: (item: Omit<TimelineItem, 'id' | 'order'>) => void;
  onUpdateItem: (id: string, updates: Partial<TimelineItem>) => void;
  onRemoveItem: (id: string) => void;
  onReorderItems: (itemIds: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export interface QuizBuilderProps {
  quizzes: CourseQuiz[];
  onAddQuiz: (quiz: QuizQuestionForm) => void;
  onUpdateQuiz: (id: string, updates: Partial<QuizQuestionForm>) => void;
  onRemoveQuiz: (id: string) => void;
  onReorderQuizzes: (quizIds: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export interface CoursePreviewProps {
  preview: CoursePreview;
  settings: PreviewSettings;
  onSettingsChange: (settings: Partial<PreviewSettings>) => void;
  onPublish: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export interface PublishControlsProps {
  settings: PublishSettings;
  onSettingsChange: (settings: Partial<PublishSettings>) => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onCancel: () => void;
  isPublishing: boolean;
  isSaving: boolean;
}

// Course Builder Context
export interface CourseBuilderContextType {
  state: CourseBuilderState;
  actions: UseCourseBuilderReturn;
  dispatch: React.Dispatch<CourseBuilderAction>;
}

// Course Builder Actions
export type CourseBuilderAction =
  | { type: 'SET_METADATA'; payload: Partial<CourseMetadataForm> }
  | { type: 'ADD_TIMELINE_ITEM'; payload: TimelineItem }
  | { type: 'UPDATE_TIMELINE_ITEM'; payload: { id: string; updates: Partial<TimelineItem> } }
  | { type: 'REMOVE_TIMELINE_ITEM'; payload: string }
  | { type: 'REORDER_TIMELINE_ITEMS'; payload: string[] }
  | { type: 'ADD_QUIZ'; payload: CourseQuiz }
  | { type: 'UPDATE_QUIZ'; payload: { id: string; updates: Partial<CourseQuiz> } }
  | { type: 'REMOVE_QUIZ'; payload: string }
  | { type: 'REORDER_QUIZZES'; payload: string[] }
  | { type: 'SET_PUBLISH_SETTINGS'; payload: Partial<PublishSettings> }
  | { type: 'SET_CURRENT_STEP'; payload: CourseBuilderStep }
  | { type: 'SET_IS_DIRTY'; payload: boolean }
  | { type: 'SET_IS_SAVING'; payload: boolean }
  | { type: 'SET_IS_AUTO_SAVING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: string }
  | { type: 'SET_VALIDATION_ERRORS'; payload: CourseBuilderValidationError[] }
  | { type: 'CLEAR_VALIDATION_ERRORS' }
  | { type: 'RESET_STATE' }
  | { type: 'LOAD_COURSE'; payload: { course: Course; modules: CourseModule[]; quizzes: CourseQuiz[] } };

// Course Builder Utilities
export interface CourseBuilderUtils {
  calculateTotalDuration: (modules: CourseModule[]) => number;
  formatDuration: (seconds: number) => string;
  validateCourse: (course: Partial<Course>, modules: CourseModule[]) => CourseBuilderValidationError[];
  generatePreview: (course: Course, modules: CourseModule[]) => CoursePreview;
  exportCourse: (course: Course, modules: CourseModule[]) => string;
  importCourse: (data: string) => { course: Course; modules: CourseModule[] };
}

// Course Builder Analytics
export interface CourseBuilderAnalytics {
  courseId: string;
  timeSpent: number;
  stepsCompleted: CourseBuilderStep[];
  modulesCreated: number;
  quizzesCreated: number;
  savesCount: number;
  publishCount: number;
  errorsCount: number;
  lastActivity: string;
}

// Course Builder Settings
export interface CourseBuilderSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  showHints: boolean;
  enableVersioning: boolean;
  maxVersions: number;
  enableAnalytics: boolean;
  defaultVisibility: 'private' | 'public' | 'organization';
  defaultPassThreshold: number;
  enableNotifications: boolean;
}