/**
 * Quiz Configuration types for Winbro Training Reels
 * Based on quiz_configurations table structure
 */

// Quiz configuration interface
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
  time_limit?: number; // in seconds
  pass_threshold: number; // percentage
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

// Quiz configuration creation data
export interface QuizConfigurationInsert {
  id?: string;
  course_id: string;
  quiz_id?: string;
  allow_retake?: boolean;
  max_attempts?: number;
  show_correct_answers?: boolean;
  show_explanations?: boolean;
  randomize_questions?: boolean;
  randomize_answers?: boolean;
  time_limit?: number;
  pass_threshold?: number;
  require_all_questions?: boolean;
  allow_skip_questions?: boolean;
  show_progress?: boolean;
  show_timer?: boolean;
  auto_submit?: boolean;
  immediate_feedback?: boolean;
  show_score_breakdown?: boolean;
  custom_feedback?: string;
}

// Quiz configuration update data
export interface QuizConfigurationUpdate {
  allow_retake?: boolean;
  max_attempts?: number;
  show_correct_answers?: boolean;
  show_explanations?: boolean;
  randomize_questions?: boolean;
  randomize_answers?: boolean;
  time_limit?: number;
  pass_threshold?: number;
  require_all_questions?: boolean;
  allow_skip_questions?: boolean;
  show_progress?: boolean;
  show_timer?: boolean;
  auto_submit?: boolean;
  immediate_feedback?: boolean;
  show_score_breakdown?: boolean;
  custom_feedback?: string;
}

// Quiz configuration presets
export interface QuizConfigurationPreset {
  id: string;
  name: string;
  description: string;
  configuration: Partial<QuizConfiguration>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Quiz configuration validation
export interface QuizConfigurationValidation {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

// Quiz configuration component props
export interface QuizConfigurationFormProps {
  configuration: QuizConfiguration;
  onUpdate: (updates: QuizConfigurationUpdate) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

export interface QuizConfigurationCardProps {
  configuration: QuizConfiguration;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  showActions?: boolean;
}

export interface QuizConfigurationListProps {
  configurations: QuizConfiguration[];
  onEdit?: (configuration: QuizConfiguration) => void;
  onDelete?: (configuration: QuizConfiguration) => void;
  onDuplicate?: (configuration: QuizConfiguration) => void;
  isLoading?: boolean;
  error?: string;
}

// Quiz configuration API response types
export interface QuizConfigurationResponse {
  configuration: QuizConfiguration;
  success: boolean;
  message?: string;
}

export interface QuizConfigurationListResponse {
  configurations: QuizConfiguration[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface QuizConfigurationPresetResponse {
  presets: QuizConfigurationPreset[];
  success: boolean;
  message?: string;
}

// Supabase query result type
export type QuizConfigurationRow = QuizConfiguration;
