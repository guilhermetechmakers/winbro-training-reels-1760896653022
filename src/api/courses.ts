import { supabase } from '@/lib/supabase';
import type { 
  Course, 
  CourseModule, 
  CourseQuiz, 
  CourseEnrollment, 
  CourseCompletion,
  CreateCourseInput,
  CourseBuilderState 
} from '@/types';

// Course API functions
export const courseApi = {
  // Get all courses
  async getCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        author:user_profiles!courses_user_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get courses by user
  async getMyCourses(userId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        author:user_profiles!courses_user_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get course by ID with modules
  async getCourse(id: string): Promise<Course | null> {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        author:user_profiles!courses_user_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (courseError) throw courseError;
    if (!course) return null;

    // Get course modules
    const { data: modules, error: modulesError } = await supabase
      .from('course_modules')
      .select(`
        *,
        reel:videos!course_modules_content_id_fkey(*),
        quiz:course_quizzes!course_modules_content_id_fkey(*)
      `)
      .eq('course_id', id)
      .order('order_index');

    if (modulesError) throw modulesError;

    return {
      ...course,
      modules: modules || [],
      author: course.author,
    };
  },

  // Create course
  async createCourse(courseData: CreateCourseInput): Promise<Course> {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        difficulty_level: courseData.difficultyLevel || 'beginner',
        category: courseData.category,
        tags: courseData.tags || [],
        visibility: courseData.visibility || 'private',
        customer_scope: courseData.customerScope || [],
        requires_approval: courseData.requiresApproval || false,
        allow_downloads: courseData.allowDownloads || false,
        enable_certificates: courseData.enableCertificates || true,
        pass_threshold: courseData.passThreshold || 80,
        metadata: courseData.metadata || {},
      })
      .select(`
        *,
        author:user_profiles!courses_user_id_fkey(*)
      `)
      .single();

    if (courseError) throw courseError;

    // Create modules if provided
    if (courseData.modules && courseData.modules.length > 0) {
      const moduleInserts = courseData.modules.map((module, index) => ({
        course_id: course.id,
        title: module.title,
        description: module.description,
        type: module.type,
        content_id: module.contentId,
        content_data: module.contentData || {},
        order_index: index,
        estimated_duration: module.estimatedDuration || 0,
        is_required: module.isRequired !== false,
        unlock_after_previous: module.unlockAfterPrevious !== false,
      }));

      const { error: modulesError } = await supabase
        .from('course_modules')
        .insert(moduleInserts);

      if (modulesError) throw modulesError;
    }

    return course;
  },

  // Update course
  async updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        difficulty_level: updates.difficultyLevel,
        category: updates.category,
        tags: updates.tags,
        visibility: updates.visibility,
        customer_scope: updates.customerScope,
        requires_approval: updates.requiresApproval,
        allow_downloads: updates.allowDownloads,
        enable_certificates: updates.enableCertificates,
        pass_threshold: updates.passThreshold,
        metadata: updates.metadata,
      })
      .eq('id', id)
      .select(`
        *,
        author:user_profiles!courses_user_id_fkey(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Delete course
  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Course modules
  async getCourseModules(courseId: string): Promise<CourseModule[]> {
    const { data, error } = await supabase
      .from('course_modules')
      .select(`
        *,
        reel:videos!course_modules_content_id_fkey(*),
        quiz:course_quizzes!course_modules_content_id_fkey(*)
      `)
      .eq('course_id', courseId)
      .order('order_index');

    if (error) throw error;
    return data || [];
  },

  async addCourseModule(moduleData: Omit<CourseModule, 'id' | 'createdAt' | 'updatedAt'>): Promise<CourseModule> {
    const { data, error } = await supabase
      .from('course_modules')
      .insert({
        course_id: moduleData.courseId,
        title: moduleData.title,
        description: moduleData.description,
        type: moduleData.type,
        content_id: moduleData.contentId,
        content_data: moduleData.contentData || {},
        order_index: moduleData.orderIndex,
        estimated_duration: moduleData.estimatedDuration || 0,
        is_required: moduleData.isRequired !== false,
        unlock_after_previous: moduleData.unlockAfterPrevious !== false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCourseModule(id: string, updates: Partial<CourseModule>): Promise<CourseModule> {
    const { data, error } = await supabase
      .from('course_modules')
      .update({
        title: updates.title,
        description: updates.description,
        type: updates.type,
        content_id: updates.contentId,
        content_data: updates.contentData,
        order_index: updates.orderIndex,
        estimated_duration: updates.estimatedDuration,
        is_required: updates.isRequired,
        unlock_after_previous: updates.unlockAfterPrevious,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCourseModule(id: string): Promise<void> {
    const { error } = await supabase
      .from('course_modules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reorderCourseModules(_courseId: string, moduleIds: string[]): Promise<void> {
    const updates = moduleIds.map((id, index) => ({
      id,
      order_index: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('course_modules')
        .update({ order_index: update.order_index })
        .eq('id', update.id);

      if (error) throw error;
    }
  },

  // Course quizzes
  async getCourseQuizzes(courseId: string): Promise<CourseQuiz[]> {
    const { data, error } = await supabase
      .from('course_quizzes')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (error) throw error;
    return data || [];
  },

  async createCourseQuiz(quizData: Omit<CourseQuiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<CourseQuiz> {
    const { data, error } = await supabase
      .from('course_quizzes')
      .insert({
        course_id: quizData.courseId,
        module_id: quizData.moduleId,
        question: quizData.question,
        type: quizData.type,
        options: quizData.options || [],
        correct_answer: quizData.correctAnswer,
        explanation: quizData.explanation,
        points: quizData.points || 1,
        time_limit: quizData.timeLimit,
        order_index: quizData.orderIndex || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCourseQuiz(id: string, updates: Partial<CourseQuiz>): Promise<CourseQuiz> {
    const { data, error } = await supabase
      .from('course_quizzes')
      .update({
        question: updates.question,
        type: updates.type,
        options: updates.options,
        correct_answer: updates.correctAnswer,
        explanation: updates.explanation,
        points: updates.points,
        time_limit: updates.timeLimit,
        order_index: updates.orderIndex,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCourseQuiz(id: string): Promise<void> {
    const { error } = await supabase
      .from('course_quizzes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Course enrollments
  async enrollInCourse(courseId: string, userId: string): Promise<CourseEnrollment> {
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
  },

  async getCourseEnrollments(courseId: string): Promise<CourseEnrollment[]> {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        user:user_profiles!course_enrollments_user_id_fkey(*)
      `)
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateCourseEnrollment(id: string, updates: Partial<CourseEnrollment>): Promise<CourseEnrollment> {
    const { data, error } = await supabase
      .from('course_enrollments')
      .update({
        completed_at: updates.completedAt,
        progress_percentage: updates.progressPercentage,
        score: updates.score,
        last_accessed_at: updates.lastAccessedAt,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Course completions
  async completeModule(enrollmentId: string, moduleId: string, score?: number, timeSpent?: number): Promise<CourseCompletion> {
    const { data, error } = await supabase
      .from('course_completions')
      .insert({
        enrollment_id: enrollmentId,
        module_id: moduleId,
        score: score || null,
        time_spent: timeSpent || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getModuleCompletions(enrollmentId: string): Promise<CourseCompletion[]> {
    const { data, error } = await supabase
      .from('course_completions')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .order('completed_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Course builder state management
  async saveCourseBuilderState(courseId: string, state: CourseBuilderState): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .update({
        metadata: {
          ...state.course.metadata,
          builderState: {
            modules: state.modules,
            isDirty: state.isDirty,
            lastSaved: new Date().toISOString(),
          },
        },
      })
      .eq('id', courseId);

    if (error) throw error;
  },

  async loadCourseBuilderState(courseId: string): Promise<CourseBuilderState | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('metadata')
      .eq('id', courseId)
      .single();

    if (error) throw error;
    if (!data?.metadata?.builderState) return null;

    return data.metadata.builderState;
  },
};
