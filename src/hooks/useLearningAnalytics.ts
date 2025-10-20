import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  logLearningEvent,
  getLearningAnalytics,
  getLearningAnalyticsSummary,
  getCourseAnalytics,
  getUserLearningProfile,
  getQuizAnalytics,
  getLearningAnalyticsDashboard
} from '@/api/learning-analytics';
import type { 
  LearningAnalyticsInsert,
  LearningAnalyticsFilters
} from '@/types/learning-analytics';

// Query keys
export const learningAnalyticsKeys = {
  all: ['learning-analytics'] as const,
  events: () => [...learningAnalyticsKeys.all, 'events'] as const,
  eventsList: (filters: LearningAnalyticsFilters) => [...learningAnalyticsKeys.events(), { filters }] as const,
  summary: (filters: Partial<LearningAnalyticsFilters>) => [...learningAnalyticsKeys.all, 'summary', { filters }] as const,
  course: (courseId: string) => [...learningAnalyticsKeys.all, 'course', courseId] as const,
  user: (userId: string) => [...learningAnalyticsKeys.all, 'user', userId] as const,
  quiz: (quizId: string) => [...learningAnalyticsKeys.all, 'quiz', quizId] as const,
  dashboard: (filters: Partial<LearningAnalyticsFilters>) => [...learningAnalyticsKeys.all, 'dashboard', { filters }] as const,
};

// Log learning event mutation
export function useLogLearningEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData: LearningAnalyticsInsert) => logLearningEvent(eventData),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: learningAnalyticsKeys.events() });
      queryClient.invalidateQueries({ queryKey: learningAnalyticsKeys.summary({}) });
      queryClient.invalidateQueries({ queryKey: learningAnalyticsKeys.course(data.course_id) });
      queryClient.invalidateQueries({ queryKey: learningAnalyticsKeys.user(data.user_id) });
      if (data.quiz_id) {
        queryClient.invalidateQueries({ queryKey: learningAnalyticsKeys.quiz(data.quiz_id) });
      }
    },
  });
}

// Get learning analytics events
export function useLearningAnalytics(filters: LearningAnalyticsFilters = {}) {
  return useQuery({
    queryKey: learningAnalyticsKeys.eventsList(filters),
    queryFn: () => getLearningAnalytics(filters),
  });
}

// Get learning analytics summary
export function useLearningAnalyticsSummary(filters: Partial<LearningAnalyticsFilters> = {}) {
  return useQuery({
    queryKey: learningAnalyticsKeys.summary(filters),
    queryFn: () => getLearningAnalyticsSummary(filters),
  });
}

// Get course analytics
export function useCourseAnalytics(courseId: string) {
  return useQuery({
    queryKey: learningAnalyticsKeys.course(courseId),
    queryFn: () => getCourseAnalytics(courseId),
    enabled: !!courseId,
  });
}

// Get user learning profile
export function useUserLearningProfile(userId: string) {
  return useQuery({
    queryKey: learningAnalyticsKeys.user(userId),
    queryFn: () => getUserLearningProfile(userId),
    enabled: !!userId,
  });
}

// Get quiz analytics
export function useQuizAnalytics(quizId: string) {
  return useQuery({
    queryKey: learningAnalyticsKeys.quiz(quizId),
    queryFn: () => getQuizAnalytics(quizId),
    enabled: !!quizId,
  });
}

// Get learning analytics dashboard
export function useLearningAnalyticsDashboard(filters: Partial<LearningAnalyticsFilters> = {}) {
  return useQuery({
    queryKey: learningAnalyticsKeys.dashboard(filters),
    queryFn: () => getLearningAnalyticsDashboard(filters),
  });
}

// Hook for logging common events
export function useLogEvent() {
  const logEventMutation = useLogLearningEvent();

  const logEvent = (eventType: string, eventData: any = {}) => {
    const event: LearningAnalyticsInsert = {
      user_id: 'current-user', // Would get from auth context
      course_id: eventData.course_id || '',
      module_id: eventData.module_id,
      quiz_id: eventData.quiz_id,
      event_type: eventType as any,
      event_data: eventData,
      duration: eventData.duration || 0,
      score: eventData.score,
      progress_percentage: eventData.progress_percentage,
      session_id: eventData.session_id || 'current-session',
      device_type: eventData.device_type || 'desktop',
      browser_info: eventData.browser_info || navigator.userAgent
    };

    logEventMutation.mutate(event);
  };

  return {
    logEvent,
    isLoading: logEventMutation.isPending,
    error: logEventMutation.error
  };
}
