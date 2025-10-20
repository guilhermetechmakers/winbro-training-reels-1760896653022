import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  addCourseModule,
  updateCourseModule,
  deleteCourseModule,
  reorderCourseModules,
  enrollInCourse,
  getCourseEnrollments,
  getUserEnrollments,
  updateEnrollmentProgress,
  completeModule,
  getModuleCompletions,
  getCourseAnalytics,
  searchCourses,
  publishCourse,
  unpublishCourse,
  archiveCourse,
  cloneCourse,
  type Course,
  type CourseModule,
  type CreateCourseInput,
} from '@/api/courseManagement';

// Query keys
export const courseManagementKeys = {
  all: ['courseManagement'] as const,
  courses: (filters?: any) => [...courseManagementKeys.all, 'courses', filters] as const,
  course: (id: string) => [...courseManagementKeys.all, 'course', id] as const,
  enrollments: (courseId: string) => [...courseManagementKeys.all, 'enrollments', courseId] as const,
  userEnrollments: (userId: string) => [...courseManagementKeys.all, 'userEnrollments', userId] as const,
  analytics: (courseId: string) => [...courseManagementKeys.all, 'analytics', courseId] as const,
  search: (query: string, filters: any) => [...courseManagementKeys.all, 'search', query, filters] as const,
};

// Get courses
export function useCourses(filters?: any) {
  return useQuery({
    queryKey: courseManagementKeys.courses(filters),
    queryFn: () => getCourses(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get course by ID
export function useCourse(id: string) {
  return useQuery({
    queryKey: courseManagementKeys.course(id),
    queryFn: () => getCourse(id),
    enabled: !!id,
  });
}

// Create course mutation
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseData: CreateCourseInput) => createCourse(courseData),
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.courses(),
      });
      queryClient.setQueryData(courseManagementKeys.course(newCourse.id), newCourse);
      toast.success('Course created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create course');
      console.error('Error creating course:', error);
    },
  });
}

// Update course mutation
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Course> }) =>
      updateCourse(id, updates),
    onSuccess: (updatedCourse) => {
      queryClient.setQueryData(courseManagementKeys.course(updatedCourse.id), updatedCourse);
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.courses(),
      });
      toast.success('Course updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update course');
      console.error('Error updating course:', error);
    },
  });
}

// Delete course mutation
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({
        queryKey: courseManagementKeys.course(deletedId),
      });
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.courses(),
      });
      toast.success('Course deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete course');
      console.error('Error deleting course:', error);
    },
  });
}

// Add course module mutation
export function useAddCourseModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, module }: {
      courseId: string;
      module: Omit<CourseModule, 'id' | 'courseId' | 'orderIndex'>;
    }) => addCourseModule(courseId, module),
    onSuccess: (_newModule, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.course(variables.courseId),
      });
      toast.success('Module added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add module');
      console.error('Error adding module:', error);
    },
  });
}

// Update course module mutation
export function useUpdateCourseModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, updates }: {
      moduleId: string;
      updates: Partial<CourseModule>;
    }) => updateCourseModule(moduleId, updates),
    onSuccess: (_updatedModule) => {
      // Invalidate all course queries since we don't know which course this module belongs to
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.all,
        predicate: (query) => query.queryKey[1] === 'course',
      });
      toast.success('Module updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update module');
      console.error('Error updating module:', error);
    },
  });
}

// Delete course module mutation
export function useDeleteCourseModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => deleteCourseModule(moduleId),
    onSuccess: () => {
      // Invalidate all course queries since we don't know which course this module belongs to
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.all,
        predicate: (query) => query.queryKey[1] === 'course',
      });
      toast.success('Module deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete module');
      console.error('Error deleting module:', error);
    },
  });
}

// Reorder course modules mutation
export function useReorderCourseModules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, moduleIds }: {
      courseId: string;
      moduleIds: string[];
    }) => reorderCourseModules(courseId, moduleIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.course(variables.courseId),
      });
      toast.success('Modules reordered successfully');
    },
    onError: (error) => {
      toast.error('Failed to reorder modules');
      console.error('Error reordering modules:', error);
    },
  });
}

// Enroll in course mutation
export function useEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, userId }: {
      courseId: string;
      userId: string;
    }) => enrollInCourse(courseId, userId),
    onSuccess: (_enrollment, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.enrollments(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.userEnrollments(variables.userId),
      });
      toast.success('Successfully enrolled in course');
    },
    onError: (error) => {
      toast.error('Failed to enroll in course');
      console.error('Error enrolling in course:', error);
    },
  });
}

// Get course enrollments
export function useCourseEnrollments(courseId: string) {
  return useQuery({
    queryKey: courseManagementKeys.enrollments(courseId),
    queryFn: () => getCourseEnrollments(courseId),
    enabled: !!courseId,
  });
}

// Get user enrollments
export function useUserEnrollments(userId: string) {
  return useQuery({
    queryKey: courseManagementKeys.userEnrollments(userId),
    queryFn: () => getUserEnrollments(userId),
    enabled: !!userId,
  });
}

// Update enrollment progress mutation
export function useUpdateEnrollmentProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, progress }: {
      enrollmentId: string;
      progress: {
        progressPercentage: number;
        modulesCompleted: string[];
        lastAccessedAt: string;
      };
    }) => updateEnrollmentProgress(enrollmentId, progress),
    onSuccess: (_updatedEnrollment) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.all,
        predicate: (query) => 
          query.queryKey[1] === 'enrollments' || query.queryKey[1] === 'userEnrollments',
      });
    },
    onError: (error) => {
      console.error('Error updating enrollment progress:', error);
    },
  });
}

// Complete module mutation
export function useCompleteModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, moduleId, completionData }: {
      enrollmentId: string;
      moduleId: string;
      completionData: {
        score?: number;
        timeSpent: number;
        attempts: number;
      };
    }) => completeModule(enrollmentId, moduleId, completionData),
    onSuccess: () => {
      // Invalidate enrollment and analytics queries
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.all,
        predicate: (query) => 
          query.queryKey[1] === 'enrollments' || 
          query.queryKey[1] === 'userEnrollments' ||
          query.queryKey[1] === 'analytics',
      });
      toast.success('Module completed successfully');
    },
    onError: (error) => {
      toast.error('Failed to complete module');
      console.error('Error completing module:', error);
    },
  });
}

// Get module completions
export function useModuleCompletions(enrollmentId: string) {
  return useQuery({
    queryKey: ['moduleCompletions', enrollmentId],
    queryFn: () => getModuleCompletions(enrollmentId),
    enabled: !!enrollmentId,
  });
}

// Get course analytics
export function useCourseAnalytics(courseId: string) {
  return useQuery({
    queryKey: courseManagementKeys.analytics(courseId),
    queryFn: () => getCourseAnalytics(courseId),
    enabled: !!courseId,
  });
}

// Search courses
export function useSearchCourses(
  query: string,
  filters: any = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: courseManagementKeys.search(query, filters),
    queryFn: () => searchCourses(query, filters),
    enabled: enabled && !!query,
  });
}

// Publish course mutation
export function usePublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => publishCourse(courseId),
    onSuccess: (publishedCourse) => {
      queryClient.setQueryData(courseManagementKeys.course(publishedCourse.id), publishedCourse);
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.courses(),
      });
      toast.success('Course published successfully');
    },
    onError: (error) => {
      toast.error('Failed to publish course');
      console.error('Error publishing course:', error);
    },
  });
}

// Unpublish course mutation
export function useUnpublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => unpublishCourse(courseId),
    onSuccess: (unpublishedCourse) => {
      queryClient.setQueryData(courseManagementKeys.course(unpublishedCourse.id), unpublishedCourse);
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.courses(),
      });
      toast.success('Course unpublished successfully');
    },
    onError: (error) => {
      toast.error('Failed to unpublish course');
      console.error('Error unpublishing course:', error);
    },
  });
}

// Archive course mutation
export function useArchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => archiveCourse(courseId),
    onSuccess: (archivedCourse) => {
      queryClient.setQueryData(courseManagementKeys.course(archivedCourse.id), archivedCourse);
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.courses(),
      });
      toast.success('Course archived successfully');
    },
    onError: (error) => {
      toast.error('Failed to archive course');
      console.error('Error archiving course:', error);
    },
  });
}

// Clone course mutation
export function useCloneCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, newTitle, newDescription }: {
      courseId: string;
      newTitle: string;
      newDescription?: string;
    }) => cloneCourse(courseId, newTitle, newDescription),
    onSuccess: (clonedCourse) => {
      queryClient.invalidateQueries({
        queryKey: courseManagementKeys.courses(),
      });
      queryClient.setQueryData(courseManagementKeys.course(clonedCourse.id), clonedCourse);
      toast.success('Course cloned successfully');
    },
    onError: (error) => {
      toast.error('Failed to clone course');
      console.error('Error cloning course:', error);
    },
  });
}