import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Course, CreateCourseInput } from '@/types';

// Query keys
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: any) => [...courseKeys.lists(), { filters }] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  myCourses: () => [...courseKeys.all, 'my-courses'] as const,
};

// Get all courses
export const useCourses = () => {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: () => api.get<Course[]>('/courses'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get my courses
export const useMyCourses = () => {
  return useQuery({
    queryKey: courseKeys.myCourses(),
    queryFn: () => api.get<Course[]>('/courses/my'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get course by ID
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => api.get<Course>(`/courses/${id}`),
    enabled: !!id,
  });
};

// Create course mutation
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseData: CreateCourseInput) => 
      api.post<Course>('/courses', courseData),
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
      api.put<Course>(`/courses/${id}`, updates),
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
    mutationFn: (id: string) => api.delete(`/courses/${id}`),
    onSuccess: (_, deletedId) => {
      // Remove the course from the cache
      queryClient.removeQueries({ queryKey: courseKeys.detail(deletedId) });
      
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.myCourses() });
    },
  });
};