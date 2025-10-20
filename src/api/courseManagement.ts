import { supabase } from '@/lib/supabase';
import type { Course, CourseModule, CreateCourseInput, CourseEnrollment, CourseCompletion } from '@/types';

// Re-export types for convenience
export type { Course, CourseModule, CreateCourseInput, CourseEnrollment, CourseCompletion };

// Course management functions
export async function createCourse(courseData: CreateCourseInput): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: courseData.title,
      description: courseData.description,
      difficulty_level: courseData.difficultyLevel || 'beginner',
      visibility: courseData.visibility || 'private',
      customer_scope: courseData.customerScope || [],
      requires_approval: courseData.requiresApproval || false,
      allow_downloads: courseData.allowDownloads || false,
      enable_certificates: courseData.enableCertificates !== false,
      pass_threshold: courseData.passThreshold || 80,
      tags: courseData.tags || [],
      category: courseData.category,
      metadata: courseData.metadata || {},
    })
    .select()
    .single();

  if (error) throw error;

  // Create course modules
  if (courseData.modules && courseData.modules.length > 0) {
    const moduleInserts = courseData.modules.map((module, index) => ({
      course_id: data.id,
      title: module.title,
      type: module.type,
      content_id: module.contentId,
      content_data: module.contentData || {},
      order_index: index,
      estimated_duration: module.estimatedDuration || 0,
      is_required: module.isRequired !== false,
      unlock_after_previous: module.unlockAfterPrevious !== false,
      description: module.description,
    }));

    const { error: modulesError } = await supabase
      .from('course_modules')
      .insert(moduleInserts);

    if (modulesError) {
      console.error('Error creating course modules:', modulesError);
    }
  }

  return data;
}

export async function getCourses(filters?: {
  status?: string;
  author?: string;
  category?: string;
  tags?: string[];
}): Promise<Course[]> {
  let query = supabase
    .from('courses')
    .select(`
      *,
      course_modules(*),
      author:users!courses_user_id_fkey(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.author) {
    query = query.eq('user_id', filters.author);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getCourse(id: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      course_modules(*),
      author:users!courses_user_id_fkey(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }

  return data;
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Course module management
export async function addCourseModule(
  courseId: string,
  module: Omit<CourseModule, 'id' | 'courseId' | 'orderIndex'>
): Promise<CourseModule> {
  // Get current module count for order index
  const { count } = await supabase
    .from('course_modules')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  const { data, error } = await supabase
    .from('course_modules')
    .insert({
      course_id: courseId,
      title: module.title,
      type: module.type,
      content_id: module.contentId,
      content_data: module.contentData || {},
      order_index: count || 0,
      estimated_duration: module.estimatedDuration || 0,
      is_required: module.isRequired !== false,
      unlock_after_previous: module.unlockAfterPrevious !== false,
      description: module.description,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCourseModule(
  moduleId: string,
  updates: Partial<CourseModule>
): Promise<CourseModule> {
  const { data, error } = await supabase
    .from('course_modules')
    .update(updates)
    .eq('id', moduleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCourseModule(moduleId: string): Promise<void> {
  const { error } = await supabase
    .from('course_modules')
    .delete()
    .eq('id', moduleId);

  if (error) throw error;
}

export async function reorderCourseModules(
  _courseId: string,
  moduleIds: string[]
): Promise<void> {
  // Update order index for each module
  const updates = moduleIds.map((moduleId, index) => ({
    id: moduleId,
    order_index: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('course_modules')
      .update({ order_index: update.order_index })
      .eq('id', update.id);

    if (error) throw error;
  }
}

// Course enrollment management
export async function enrollInCourse(
  courseId: string,
  userId: string
): Promise<CourseEnrollment> {
  const { data, error } = await supabase
    .from('course_enrollments')
    .insert({
      course_id: courseId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCourseEnrollments(
  courseId: string
): Promise<CourseEnrollment[]> {
  const { data, error } = await supabase
    .from('course_enrollments')
    .select(`
      *,
      user:users!course_enrollments_user_id_fkey(*)
    `)
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getUserEnrollments(
  userId: string
): Promise<CourseEnrollment[]> {
  const { data, error } = await supabase
    .from('course_enrollments')
    .select(`
      *,
      course:courses!course_enrollments_course_id_fkey(*)
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateEnrollmentProgress(
  enrollmentId: string,
  progress: {
    progressPercentage: number;
    modulesCompleted: string[];
    lastAccessedAt: string;
  }
): Promise<CourseEnrollment> {
  const { data, error } = await supabase
    .from('course_enrollments')
    .update(progress)
    .eq('id', enrollmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Course completion tracking
export async function completeModule(
  enrollmentId: string,
  moduleId: string,
  completionData: {
    score?: number;
    timeSpent: number;
    attempts: number;
  }
): Promise<CourseCompletion> {
  const { data, error } = await supabase
    .from('course_completions')
    .insert({
      enrollment_id: enrollmentId,
      module_id: moduleId,
      score: completionData.score,
      time_spent: completionData.timeSpent,
      attempts: completionData.attempts,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getModuleCompletions(
  enrollmentId: string
): Promise<CourseCompletion[]> {
  const { data, error } = await supabase
    .from('course_completions')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .order('completed_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Course analytics
export async function getCourseAnalytics(courseId: string) {
  const [
    { data: course, error: courseError },
    { data: enrollments, error: enrollmentsError },
    { data: completions, error: completionsError },
  ] = await Promise.all([
    supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single(),
    supabase
      .from('course_enrollments')
      .select('*')
      .eq('course_id', courseId),
    supabase
      .from('course_completions')
      .select(`
        *,
        enrollment:course_enrollments!course_completions_enrollment_id_fkey(*)
      `)
      .eq('enrollment.course_id', courseId),
  ]);

  if (courseError) throw courseError;
  if (enrollmentsError) throw enrollmentsError;
  if (completionsError) throw completionsError;

  const totalEnrollments = enrollments?.length || 0;
  const completedEnrollments = enrollments?.filter(e => e.completed_at).length || 0;
  const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

  return {
    course,
    totalEnrollments,
    completedEnrollments,
    completionRate,
    averageScore: completions?.reduce((sum, c) => sum + (c.score || 0), 0) / (completions?.length || 1),
    totalCompletions: completions?.length || 0,
  };
}

// Course search
export async function searchCourses(
  query: string,
  filters: {
    difficulty?: string;
    category?: string;
    tags?: string[];
    author?: string;
    status?: string;
  } = {}
) {
  let searchQuery = supabase
    .from('courses')
    .select(`
      *,
      author:users!courses_user_id_fkey(*),
      course_modules(count)
    `)
    .textSearch('title,description', query);

  if (filters.difficulty) {
    searchQuery = searchQuery.eq('difficulty_level', filters.difficulty);
  }

  if (filters.category) {
    searchQuery = searchQuery.eq('category', filters.category);
  }

  if (filters.tags && filters.tags.length > 0) {
    searchQuery = searchQuery.overlaps('tags', filters.tags);
  }

  if (filters.author) {
    searchQuery = searchQuery.eq('user_id', filters.author);
  }

  if (filters.status) {
    searchQuery = searchQuery.eq('status', filters.status);
  }

  const { data, error } = await searchQuery
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

// Course publishing
export async function publishCourse(courseId: string): Promise<Course> {
  return updateCourse(courseId, {
    status: 'published',
    publishedAt: new Date().toISOString(),
  });
}

export async function unpublishCourse(courseId: string): Promise<Course> {
  return updateCourse(courseId, {
    status: 'draft',
    publishedAt: undefined,
  });
}

export async function archiveCourse(courseId: string): Promise<Course> {
  return updateCourse(courseId, {
    status: 'archived',
    archivedAt: new Date().toISOString(),
  });
}

// Course cloning
export async function cloneCourse(
  courseId: string,
  newTitle: string,
  newDescription?: string
): Promise<Course> {
  const originalCourse = await getCourse(courseId);
  if (!originalCourse) throw new Error('Course not found');

  const clonedCourse = await createCourse({
    title: newTitle,
    description: newDescription || originalCourse.description,
    difficultyLevel: originalCourse.difficultyLevel,
    visibility: 'private', // Always start as private
    customerScope: originalCourse.customerScope,
    requiresApproval: originalCourse.requiresApproval,
    allowDownloads: originalCourse.allowDownloads,
    enableCertificates: originalCourse.enableCertificates,
    passThreshold: originalCourse.passThreshold,
    tags: originalCourse.tags,
    category: originalCourse.category,
    modules: originalCourse.modules?.map(module => ({
      title: module.title,
      type: module.type,
      content: module.content,
      order: module.order,
      contentId: module.contentId,
      contentData: module.contentData,
      estimatedDuration: module.estimatedDuration,
      isRequired: module.isRequired,
      unlockAfterPrevious: module.unlockAfterPrevious,
    })) || [],
  });

  return clonedCourse;
}