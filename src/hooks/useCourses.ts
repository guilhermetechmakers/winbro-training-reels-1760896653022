import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/api/courses';
import type { 
  Course, 
  CourseModule, 
  CourseQuiz, 
  CourseEnrollment, 
  CourseBuilderState 
} from '@/types';

// Query keys
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: any) => [...courseKeys.lists(), { filters }] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  myCourses: () => [...courseKeys.all, 'my-courses'] as const,
  modules: (courseId: string) => [...courseKeys.detail(courseId), 'modules'] as const,
  quizzes: (courseId: string) => [...courseKeys.detail(courseId), 'quizzes'] as const,
  enrollments: (courseId: string) => [...courseKeys.detail(courseId), 'enrollments'] as const,
  completions: (enrollmentId: string) => [...courseKeys.all, 'completions', enrollmentId] as const,
  builderState: (courseId: string) => [...courseKeys.detail(courseId), 'builder-state'] as const,
};

// Get all courses
export const useCourses = () => {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: courseApi.getCourses,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get my courses
export const useMyCourses = (userId: string) => {
  return useQuery({
    queryKey: courseKeys.myCourses(),
    queryFn: () => courseApi.getMyCourses(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get course by ID
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseApi.getCourse(id),
    enabled: !!id,
  });
};

// Get course modules
export const useCourseModules = (courseId: string) => {
  return useQuery({
    queryKey: courseKeys.modules(courseId),
    queryFn: () => courseApi.getCourseModules(courseId),
    enabled: !!courseId,
  });
};

// Get course quizzes
export const useCourseQuizzes = (courseId: string) => {
  return useQuery({
    queryKey: courseKeys.quizzes(courseId),
    queryFn: () => courseApi.getCourseQuizzes(courseId),
    enabled: !!courseId,
  });
};

// Get course enrollments
export const useCourseEnrollments = (courseId: string) => {
  return useQuery({
    queryKey: courseKeys.enrollments(courseId),
    queryFn: () => courseApi.getCourseEnrollments(courseId),
    enabled: !!courseId,
  });
};

// Get module completions
export const useModuleCompletions = (enrollmentId: string) => {
  return useQuery({
    queryKey: courseKeys.completions(enrollmentId),
    queryFn: () => courseApi.getModuleCompletions(enrollmentId),
    enabled: !!enrollmentId,
  });
};

// Get course builder state
export const useCourseBuilderState = (courseId: string) => {
  return useQuery({
    queryKey: courseKeys.builderState(courseId),
    queryFn: () => courseApi.loadCourseBuilderState(courseId),
    enabled: !!courseId,
  });
};

// Create course mutation
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.createCourse,
    onSuccess: (newCourse) => {
      // Invalidate and refetch courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.myCourses() });
      
      // Add the new course to the cache
      queryClient.setQueryData(courseKeys.detail(newCourse.id), newCourse);
    },
  });
};

// Update course mutation
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Course> }) =>
      courseApi.updateCourse(id, updates),
    onSuccess: (updatedCourse) => {
      // Update the course in the cache
      queryClient.setQueryData(courseKeys.detail(updatedCourse.id), updatedCourse);
      
      // Invalidate courses list to ensure consistency
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.myCourses() });
    },
  });
};

// Delete course mutation
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.deleteCourse,
    onSuccess: (_, deletedId) => {
      // Remove the course from the cache
      queryClient.removeQueries({ queryKey: courseKeys.detail(deletedId) });
      
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.myCourses() });
    },
  });
};

// Course module mutations
export const useAddCourseModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.addCourseModule,
    onSuccess: (newModule) => {
      // Invalidate course modules
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.modules(newModule.courseId) 
      });
      // Invalidate course detail to update total duration
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.detail(newModule.courseId) 
      });
    },
  });
};

export const useUpdateCourseModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CourseModule> }) =>
      courseApi.updateCourseModule(id, updates),
    onSuccess: (updatedModule) => {
      // Invalidate course modules
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.modules(updatedModule.courseId) 
      });
      // Invalidate course detail to update total duration
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.detail(updatedModule.courseId) 
      });
    },
  });
};

export const useDeleteCourseModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.deleteCourseModule,
    onSuccess: () => {
      // Invalidate all course modules queries
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};

export const useReorderCourseModules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, moduleIds }: { courseId: string; moduleIds: string[] }) =>
      courseApi.reorderCourseModules(courseId, moduleIds),
    onSuccess: (_, { courseId }) => {
      // Invalidate course modules
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.modules(courseId) 
      });
    },
  });
};

// Course quiz mutations
export const useCreateCourseQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.createCourseQuiz,
    onSuccess: (newQuiz) => {
      // Invalidate course quizzes
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.quizzes(newQuiz.courseId) 
      });
    },
  });
};

export const useUpdateCourseQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CourseQuiz> }) =>
      courseApi.updateCourseQuiz(id, updates),
    onSuccess: (updatedQuiz) => {
      // Invalidate course quizzes
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.quizzes(updatedQuiz.courseId) 
      });
    },
  });
};

export const useDeleteCourseQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.deleteCourseQuiz,
    onSuccess: () => {
      // Invalidate all course quizzes queries
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
};

// Course enrollment mutations
export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, userId }: { courseId: string; userId: string }) =>
      courseApi.enrollInCourse(courseId, userId),
    onSuccess: (enrollment) => {
      // Invalidate course enrollments
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.enrollments(enrollment.courseId) 
      });
      // Invalidate course detail to update enrolled count
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.detail(enrollment.courseId) 
      });
    },
  });
};

export const useUpdateCourseEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CourseEnrollment> }) =>
      courseApi.updateCourseEnrollment(id, updates),
    onSuccess: (updatedEnrollment) => {
      // Invalidate course enrollments
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.enrollments(updatedEnrollment.courseId) 
      });
    },
  });
};

// Course completion mutations
export const useCompleteModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      enrollmentId, 
      moduleId, 
      score, 
      timeSpent 
    }: { 
      enrollmentId: string; 
      moduleId: string; 
      score?: number; 
      timeSpent?: number; 
    }) => courseApi.completeModule(enrollmentId, moduleId, score, timeSpent),
    onSuccess: (completion) => {
      // Invalidate module completions
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.completions(completion.enrollmentId) 
      });
    },
  });
};

// Course builder state mutations
export const useSaveCourseBuilderState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, state }: { courseId: string; state: CourseBuilderState }) =>
      courseApi.saveCourseBuilderState(courseId, state),
    onSuccess: (_, { courseId }) => {
      // Invalidate builder state
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.builderState(courseId) 
      });
    },
  });
};