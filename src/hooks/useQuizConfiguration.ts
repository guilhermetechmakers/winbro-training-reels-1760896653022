import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCourseQuizConfigurations,
  getQuizConfiguration,
  getQuizConfigurationForQuiz,
  createQuizConfiguration,
  updateQuizConfiguration,
  deleteQuizConfiguration,
  getOrCreateDefaultQuizConfiguration,
  duplicateQuizConfiguration,
  getQuizConfigurationPresets,
  applyPresetToQuizConfiguration,
  getQuizConfigurationStats
} from '@/api/quiz-configuration';
import type { 
  QuizConfigurationInsert,
  QuizConfigurationUpdate
} from '@/types/quiz-configuration';

// Query keys
export const quizConfigurationKeys = {
  all: ['quiz-configurations'] as const,
  lists: () => [...quizConfigurationKeys.all, 'list'] as const,
  list: (courseId: string) => [...quizConfigurationKeys.lists(), { courseId }] as const,
  details: () => [...quizConfigurationKeys.all, 'detail'] as const,
  detail: (id: string) => [...quizConfigurationKeys.details(), id] as const,
  quiz: (quizId: string) => [...quizConfigurationKeys.all, 'quiz', quizId] as const,
  presets: () => [...quizConfigurationKeys.all, 'presets'] as const,
  stats: (courseId: string) => [...quizConfigurationKeys.all, 'stats', courseId] as const,
};

// Get quiz configurations for a course
export function useCourseQuizConfigurations(courseId: string) {
  return useQuery({
    queryKey: quizConfigurationKeys.list(courseId),
    queryFn: () => getCourseQuizConfigurations(courseId),
    enabled: !!courseId,
  });
}

// Get quiz configuration by ID
export function useQuizConfiguration(configurationId: string) {
  return useQuery({
    queryKey: quizConfigurationKeys.detail(configurationId),
    queryFn: () => getQuizConfiguration(configurationId),
    enabled: !!configurationId,
  });
}

// Get quiz configuration for a specific quiz
export function useQuizConfigurationForQuiz(quizId: string) {
  return useQuery({
    queryKey: quizConfigurationKeys.quiz(quizId),
    queryFn: () => getQuizConfigurationForQuiz(quizId),
    enabled: !!quizId,
  });
}

// Get or create default quiz configuration
export function useDefaultQuizConfiguration(courseId: string) {
  return useQuery({
    queryKey: [...quizConfigurationKeys.list(courseId), 'default'],
    queryFn: () => getOrCreateDefaultQuizConfiguration(courseId),
    enabled: !!courseId,
  });
}

// Get quiz configuration presets
export function useQuizConfigurationPresets() {
  return useQuery({
    queryKey: quizConfigurationKeys.presets(),
    queryFn: () => getQuizConfigurationPresets(),
  });
}

// Get quiz configuration statistics
export function useQuizConfigurationStats(courseId: string) {
  return useQuery({
    queryKey: quizConfigurationKeys.stats(courseId),
    queryFn: () => getQuizConfigurationStats(courseId),
    enabled: !!courseId,
  });
}

// Create quiz configuration mutation
export function useCreateQuizConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (configurationData: QuizConfigurationInsert) => createQuizConfiguration(configurationData),
    onSuccess: (data) => {
      // Invalidate and refetch configurations
      queryClient.invalidateQueries({ queryKey: quizConfigurationKeys.list(data.course_id) });
      queryClient.invalidateQueries({ queryKey: quizConfigurationKeys.stats(data.course_id) });
    },
  });
}

// Update quiz configuration mutation
export function useUpdateQuizConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: QuizConfigurationUpdate }) => 
      updateQuizConfiguration(id, updates),
    onSuccess: (data) => {
      // Update the configuration in cache
      queryClient.setQueryData(quizConfigurationKeys.detail(data.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quizConfigurationKeys.list(data.course_id) });
    },
  });
}

// Delete quiz configuration mutation
export function useDeleteQuizConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (configurationId: string) => deleteQuizConfiguration(configurationId),
    onSuccess: (_, configurationId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: quizConfigurationKeys.detail(configurationId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quizConfigurationKeys.lists() });
    },
  });
}

// Duplicate quiz configuration mutation
export function useDuplicateQuizConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      sourceId, 
      targetCourseId, 
      targetQuizId 
    }: { 
      sourceId: string; 
      targetCourseId: string; 
      targetQuizId?: string; 
    }) => duplicateQuizConfiguration(sourceId, targetCourseId, targetQuizId),
    onSuccess: (data) => {
      // Invalidate target course configurations
      queryClient.invalidateQueries({ queryKey: quizConfigurationKeys.list(data.course_id) });
    },
  });
}

// Apply preset to quiz configuration mutation
export function useApplyPresetToQuizConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      configurationId, 
      presetId 
    }: { 
      configurationId: string; 
      presetId: string; 
    }) => applyPresetToQuizConfiguration(configurationId, presetId),
    onSuccess: (data) => {
      // Update the configuration in cache
      queryClient.setQueryData(quizConfigurationKeys.detail(data.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quizConfigurationKeys.list(data.course_id) });
    },
  });
}
