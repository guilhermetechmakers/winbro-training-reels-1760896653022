/**
 * Quiz Configuration API functions for Winbro Training Reels
 */

import { supabase } from '@/lib/supabase';
import type { 
  QuizConfiguration,
  QuizConfigurationInsert,
  QuizConfigurationUpdate,
  QuizConfigurationPreset
} from '@/types/quiz-configuration';

// Get quiz configurations for a course
export async function getCourseQuizConfigurations(courseId: string): Promise<QuizConfiguration[]> {
  const { data, error } = await supabase
    .from('quiz_configurations')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as QuizConfiguration[];
}

// Get quiz configuration by ID
export async function getQuizConfiguration(configurationId: string): Promise<QuizConfiguration> {
  const { data, error } = await supabase
    .from('quiz_configurations')
    .select('*')
    .eq('id', configurationId)
    .single();

  if (error) throw error;
  return data as QuizConfiguration;
}

// Get quiz configuration for a specific quiz
export async function getQuizConfigurationForQuiz(quizId: string): Promise<QuizConfiguration | null> {
  const { data, error } = await supabase
    .from('quiz_configurations')
    .select('*')
    .eq('quiz_id', quizId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data as QuizConfiguration | null;
}

// Create quiz configuration
export async function createQuizConfiguration(configurationData: QuizConfigurationInsert): Promise<QuizConfiguration> {
  const { data, error } = await supabase
    .from('quiz_configurations')
    .insert(configurationData)
    .select()
    .single();

  if (error) throw error;
  return data as QuizConfiguration;
}

// Update quiz configuration
export async function updateQuizConfiguration(
  configurationId: string, 
  updates: QuizConfigurationUpdate
): Promise<QuizConfiguration> {
  const { data, error } = await supabase
    .from('quiz_configurations')
    .update(updates)
    .eq('id', configurationId)
    .select()
    .single();

  if (error) throw error;
  return data as QuizConfiguration;
}

// Delete quiz configuration
export async function deleteQuizConfiguration(configurationId: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_configurations')
    .delete()
    .eq('id', configurationId);

  if (error) throw error;
}

// Get or create default quiz configuration for a course
export async function getOrCreateDefaultQuizConfiguration(courseId: string): Promise<QuizConfiguration> {
  // Try to get existing configuration
  const existing = await getCourseQuizConfigurations(courseId);
  if (existing.length > 0) {
    return existing[0];
  }

  // Create default configuration
  const defaultConfiguration: QuizConfigurationInsert = {
    course_id: courseId,
    allow_retake: true,
    max_attempts: 3,
    show_correct_answers: true,
    show_explanations: true,
    randomize_questions: false,
    randomize_answers: false,
    time_limit: undefined,
    pass_threshold: 80,
    require_all_questions: true,
    allow_skip_questions: false,
    show_progress: true,
    show_timer: true,
    auto_submit: false,
    immediate_feedback: false,
    show_score_breakdown: true,
    custom_feedback: undefined
  };

  return await createQuizConfiguration(defaultConfiguration);
}

// Duplicate quiz configuration
export async function duplicateQuizConfiguration(
  sourceConfigurationId: string,
  targetCourseId: string,
  targetQuizId?: string
): Promise<QuizConfiguration> {
  const sourceConfiguration = await getQuizConfiguration(sourceConfigurationId);
  
  const duplicateData: QuizConfigurationInsert = {
    course_id: targetCourseId,
    quiz_id: targetQuizId,
    allow_retake: sourceConfiguration.allow_retake,
    max_attempts: sourceConfiguration.max_attempts,
    show_correct_answers: sourceConfiguration.show_correct_answers,
    show_explanations: sourceConfiguration.show_explanations,
    randomize_questions: sourceConfiguration.randomize_questions,
    randomize_answers: sourceConfiguration.randomize_answers,
    time_limit: sourceConfiguration.time_limit,
    pass_threshold: sourceConfiguration.pass_threshold,
    require_all_questions: sourceConfiguration.require_all_questions,
    allow_skip_questions: sourceConfiguration.allow_skip_questions,
    show_progress: sourceConfiguration.show_progress,
    show_timer: sourceConfiguration.show_timer,
    auto_submit: sourceConfiguration.auto_submit,
    immediate_feedback: sourceConfiguration.immediate_feedback,
    show_score_breakdown: sourceConfiguration.show_score_breakdown,
    custom_feedback: sourceConfiguration.custom_feedback
  };

  return await createQuizConfiguration(duplicateData);
}

// Get quiz configuration presets
export async function getQuizConfigurationPresets(): Promise<QuizConfigurationPreset[]> {
  // For now, return hardcoded presets
  // In a real implementation, these would be stored in the database
  const presets: QuizConfigurationPreset[] = [
    {
      id: 'default',
      name: 'Default Configuration',
      description: 'Standard quiz settings with moderate restrictions',
      configuration: {
        allow_retake: true,
        max_attempts: 3,
        show_correct_answers: true,
        show_explanations: true,
        randomize_questions: false,
        randomize_answers: false,
        pass_threshold: 80,
        require_all_questions: true,
        allow_skip_questions: false,
        show_progress: true,
        show_timer: true,
        auto_submit: false,
        immediate_feedback: false,
        show_score_breakdown: true
      },
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'strict',
      name: 'Strict Configuration',
      description: 'High security settings with limited attempts and no retakes',
      configuration: {
        allow_retake: false,
        max_attempts: 1,
        show_correct_answers: false,
        show_explanations: false,
        randomize_questions: true,
        randomize_answers: true,
        pass_threshold: 90,
        require_all_questions: true,
        allow_skip_questions: false,
        show_progress: false,
        show_timer: true,
        auto_submit: true,
        immediate_feedback: false,
        show_score_breakdown: false
      },
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'learning',
      name: 'Learning Configuration',
      description: 'Educational settings with immediate feedback and multiple attempts',
      configuration: {
        allow_retake: true,
        max_attempts: 5,
        show_correct_answers: true,
        show_explanations: true,
        randomize_questions: false,
        randomize_answers: false,
        pass_threshold: 70,
        require_all_questions: false,
        allow_skip_questions: true,
        show_progress: true,
        show_timer: false,
        auto_submit: false,
        immediate_feedback: true,
        show_score_breakdown: true
      },
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'assessment',
      name: 'Assessment Configuration',
      description: 'Formal assessment settings with time limits and controlled environment',
      configuration: {
        allow_retake: false,
        max_attempts: 2,
        show_correct_answers: false,
        show_explanations: false,
        randomize_questions: true,
        randomize_answers: true,
        time_limit: 1800, // 30 minutes
        pass_threshold: 85,
        require_all_questions: true,
        allow_skip_questions: false,
        show_progress: true,
        show_timer: true,
        auto_submit: true,
        immediate_feedback: false,
        show_score_breakdown: true
      },
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return presets;
}

// Apply preset to quiz configuration
export async function applyPresetToQuizConfiguration(
  configurationId: string,
  presetId: string
): Promise<QuizConfiguration> {
  const presets = await getQuizConfigurationPresets();
  const preset = presets.find(p => p.id === presetId);
  
  if (!preset) {
    throw new Error('Preset not found');
  }

  const updates: QuizConfigurationUpdate = {
    allow_retake: preset.configuration.allow_retake,
    max_attempts: preset.configuration.max_attempts,
    show_correct_answers: preset.configuration.show_correct_answers,
    show_explanations: preset.configuration.show_explanations,
    randomize_questions: preset.configuration.randomize_questions,
    randomize_answers: preset.configuration.randomize_answers,
    time_limit: preset.configuration.time_limit,
    pass_threshold: preset.configuration.pass_threshold,
    require_all_questions: preset.configuration.require_all_questions,
    allow_skip_questions: preset.configuration.allow_skip_questions,
    show_progress: preset.configuration.show_progress,
    show_timer: preset.configuration.show_timer,
    auto_submit: preset.configuration.auto_submit,
    immediate_feedback: preset.configuration.immediate_feedback,
    show_score_breakdown: preset.configuration.show_score_breakdown,
    custom_feedback: preset.configuration.custom_feedback
  };

  return await updateQuizConfiguration(configurationId, updates);
}

// Validate quiz configuration
export function validateQuizConfiguration(configuration: Partial<QuizConfiguration>): {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
} {
  const errors: Array<{ field: string; message: string }> = [];

  if (configuration.max_attempts !== undefined && configuration.max_attempts < 1) {
    errors.push({
      field: 'max_attempts',
      message: 'Maximum attempts must be at least 1'
    });
  }

  if (configuration.pass_threshold !== undefined && 
      (configuration.pass_threshold < 0 || configuration.pass_threshold > 100)) {
    errors.push({
      field: 'pass_threshold',
      message: 'Pass threshold must be between 0 and 100'
    });
  }

  if (configuration.time_limit !== undefined && configuration.time_limit < 1) {
    errors.push({
      field: 'time_limit',
      message: 'Time limit must be at least 1 second'
    });
  }

  if (configuration.custom_feedback !== undefined && 
      configuration.custom_feedback.length > 1000) {
    errors.push({
      field: 'custom_feedback',
      message: 'Custom feedback must be less than 1000 characters'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Get quiz configuration statistics
export async function getQuizConfigurationStats(courseId: string): Promise<{
  total_configurations: number;
  configurations_by_type: Array<{
    type: string;
    count: number;
  }>;
  average_settings: Partial<QuizConfiguration>;
}> {
  const configurations = await getCourseQuizConfigurations(courseId);
  
  const totalConfigurations = configurations.length;
  
  // Group by configuration type (simplified)
  const configurationsByType = [
    { type: 'Default', count: configurations.filter(c => !c.quiz_id).length },
    { type: 'Quiz-specific', count: configurations.filter(c => c.quiz_id).length }
  ];

  // Calculate average settings
  const averageSettings: Partial<QuizConfiguration> = {
    max_attempts: Math.round(
      configurations.reduce((sum, c) => sum + c.max_attempts, 0) / totalConfigurations
    ),
    pass_threshold: Math.round(
      configurations.reduce((sum, c) => sum + c.pass_threshold, 0) / totalConfigurations
    ),
    allow_retake: configurations.filter(c => c.allow_retake).length > totalConfigurations / 2,
    show_correct_answers: configurations.filter(c => c.show_correct_answers).length > totalConfigurations / 2,
    show_explanations: configurations.filter(c => c.show_explanations).length > totalConfigurations / 2,
    randomize_questions: configurations.filter(c => c.randomize_questions).length > totalConfigurations / 2,
    randomize_answers: configurations.filter(c => c.randomize_answers).length > totalConfigurations / 2,
    immediate_feedback: configurations.filter(c => c.immediate_feedback).length > totalConfigurations / 2
  };

  return {
    total_configurations: totalConfigurations,
    configurations_by_type: configurationsByType,
    average_settings: averageSettings
  };
}
