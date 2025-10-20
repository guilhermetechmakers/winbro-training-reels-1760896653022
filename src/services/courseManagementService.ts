import { courseApi } from '@/api/courses';
import type { 
  Course, 
  CourseModule, 
  CourseQuiz, 
  CreateCourseInput,
  CourseBuilderState 
} from '@/types';

/**
 * Course Management Service
 * Provides high-level course management operations and business logic
 */
export class CourseManagementService {
  /**
   * Create a new course with initial setup
   */
  static async createCourse(courseData: CreateCourseInput): Promise<Course> {
    try {
      const course = await courseApi.createCourse(courseData);
      
      // Initialize course builder state
      const builderState: CourseBuilderState = {
        course: course,
        modules: course.modules || [],
        isDirty: false,
        isSaving: false,
        lastSaved: new Date().toISOString(),
      };
      
      await courseApi.saveCourseBuilderState(course.id, builderState);
      
      return course;
    } catch (error) {
      console.error('Error creating course:', error);
      throw new Error('Failed to create course');
    }
  }

  /**
   * Get course with full details including modules and quizzes
   */
  static async getCourseWithDetails(courseId: string): Promise<Course | null> {
    try {
      return await courseApi.getCourse(courseId);
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw new Error('Failed to fetch course details');
    }
  }

  /**
   * Update course metadata and settings
   */
  static async updateCourseMetadata(
    courseId: string, 
    updates: Partial<Course>
  ): Promise<Course> {
    try {
      const updatedCourse = await courseApi.updateCourse(courseId, updates);
      
      // Update builder state if course is being edited
      const builderState = await courseApi.loadCourseBuilderState(courseId);
      if (builderState) {
        builderState.course = { ...builderState.course, ...updates };
        builderState.isDirty = true;
        await courseApi.saveCourseBuilderState(courseId, builderState);
      }
      
      return updatedCourse;
    } catch (error) {
      console.error('Error updating course metadata:', error);
      throw new Error('Failed to update course metadata');
    }
  }

  /**
   * Add a module to a course
   */
  static async addModuleToCourse(
    courseId: string,
    moduleData: Omit<CourseModule, 'id' | 'courseId' | 'orderIndex' | 'createdAt' | 'updatedAt'>
  ): Promise<CourseModule> {
    try {
      // Get current module count for order index
      const modules = await courseApi.getCourseModules(courseId);
      const orderIndex = modules.length;

      const newModule = await courseApi.addCourseModule({
        ...moduleData,
        courseId,
        orderIndex,
      });

      // Update course total duration
      await this.updateCourseDuration(courseId);

      // Update builder state
      const builderState = await courseApi.loadCourseBuilderState(courseId);
      if (builderState) {
        builderState.modules.push(newModule);
        builderState.isDirty = true;
        await courseApi.saveCourseBuilderState(courseId, builderState);
      }

      return newModule;
    } catch (error) {
      console.error('Error adding module to course:', error);
      throw new Error('Failed to add module to course');
    }
  }

  /**
   * Update a course module
   */
  static async updateCourseModule(
    moduleId: string,
    updates: Partial<CourseModule>
  ): Promise<CourseModule> {
    try {
      const updatedModule = await courseApi.updateCourseModule(moduleId, updates);

      // Update course total duration
      if (updatedModule.courseId) {
        await this.updateCourseDuration(updatedModule.courseId);
      }

      // Update builder state
      if (updatedModule.courseId) {
        const builderState = await courseApi.loadCourseBuilderState(updatedModule.courseId);
        if (builderState) {
          const moduleIndex = builderState.modules.findIndex(m => m.id === moduleId);
          if (moduleIndex !== -1) {
            builderState.modules[moduleIndex] = { ...builderState.modules[moduleIndex], ...updates };
            builderState.isDirty = true;
            await courseApi.saveCourseBuilderState(updatedModule.courseId, builderState);
          }
        }
      }

      return updatedModule;
    } catch (error) {
      console.error('Error updating course module:', error);
      throw new Error('Failed to update course module');
    }
  }

  /**
   * Remove a module from a course
   */
  static async removeModuleFromCourse(moduleId: string): Promise<void> {
    try {
      // Get module details before deletion
      const modules = await courseApi.getCourseModules(moduleId);
      const moduleToDelete = modules.find(m => m.id === moduleId);
      
      await courseApi.deleteCourseModule(moduleId);

      // Update course total duration
      if (moduleToDelete?.courseId) {
        await this.updateCourseDuration(moduleToDelete.courseId);
      }

      // Update builder state
      if (moduleToDelete?.courseId) {
        const builderState = await courseApi.loadCourseBuilderState(moduleToDelete.courseId);
        if (builderState) {
          builderState.modules = builderState.modules.filter(m => m.id !== moduleId);
          builderState.isDirty = true;
          await courseApi.saveCourseBuilderState(moduleToDelete.courseId, builderState);
        }
      }
    } catch (error) {
      console.error('Error removing module from course:', error);
      throw new Error('Failed to remove module from course');
    }
  }

  /**
   * Reorder course modules
   */
  static async reorderCourseModules(
    courseId: string,
    moduleIds: string[]
  ): Promise<void> {
    try {
      await courseApi.reorderCourseModules(courseId, moduleIds);

      // Update builder state
      const builderState = await courseApi.loadCourseBuilderState(courseId);
      if (builderState) {
        // Reorder modules in builder state
        const reorderedModules = moduleIds.map(id => 
          builderState.modules.find(m => m.id === id)
        ).filter(Boolean) as CourseModule[];
        
        builderState.modules = reorderedModules;
        builderState.isDirty = true;
        await courseApi.saveCourseBuilderState(courseId, builderState);
      }
    } catch (error) {
      console.error('Error reordering course modules:', error);
      throw new Error('Failed to reorder course modules');
    }
  }

  /**
   * Add a quiz to a course
   */
  static async addQuizToCourse(
    courseId: string,
    quizData: Omit<CourseQuiz, 'id' | 'courseId' | 'orderIndex' | 'createdAt' | 'updatedAt'>
  ): Promise<CourseQuiz> {
    try {
      // Get current quiz count for order index
      const quizzes = await courseApi.getCourseQuizzes(courseId);
      const orderIndex = quizzes.length;

      const newQuiz = await courseApi.createCourseQuiz({
        ...quizData,
        courseId,
        orderIndex,
      });

      return newQuiz;
    } catch (error) {
      console.error('Error adding quiz to course:', error);
      throw new Error('Failed to add quiz to course');
    }
  }

  /**
   * Update a course quiz
   */
  static async updateCourseQuiz(
    quizId: string,
    updates: Partial<CourseQuiz>
  ): Promise<CourseQuiz> {
    try {
      return await courseApi.updateCourseQuiz(quizId, updates);
    } catch (error) {
      console.error('Error updating course quiz:', error);
      throw new Error('Failed to update course quiz');
    }
  }

  /**
   * Remove a quiz from a course
   */
  static async removeQuizFromCourse(quizId: string): Promise<void> {
    try {
      await courseApi.deleteCourseQuiz(quizId);
    } catch (error) {
      console.error('Error removing quiz from course:', error);
      throw new Error('Failed to remove quiz from course');
    }
  }

  /**
   * Publish a course
   */
  static async publishCourse(courseId: string): Promise<Course> {
    try {
      const course = await courseApi.updateCourse(courseId, {
        status: 'published',
        publishedAt: new Date().toISOString(),
      });

      // Clear builder state when publishing
      const builderState = await courseApi.loadCourseBuilderState(courseId);
      if (builderState) {
        builderState.isDirty = false;
        builderState.lastSaved = new Date().toISOString();
        await courseApi.saveCourseBuilderState(courseId, builderState);
      }

      return course;
    } catch (error) {
      console.error('Error publishing course:', error);
      throw new Error('Failed to publish course');
    }
  }

  /**
   * Unpublish a course
   */
  static async unpublishCourse(courseId: string): Promise<Course> {
    try {
      return await courseApi.updateCourse(courseId, {
        status: 'draft',
        publishedAt: undefined,
      });
    } catch (error) {
      console.error('Error unpublishing course:', error);
      throw new Error('Failed to unpublish course');
    }
  }

  /**
   * Archive a course
   */
  static async archiveCourse(courseId: string): Promise<Course> {
    try {
      return await courseApi.updateCourse(courseId, {
        status: 'archived',
        archivedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error archiving course:', error);
      throw new Error('Failed to archive course');
    }
  }

  /**
   * Clone a course
   */
  static async cloneCourse(
    courseId: string,
    newTitle: string,
    newDescription?: string
  ): Promise<Course> {
    try {
      const originalCourse = await courseApi.getCourse(courseId);
      if (!originalCourse) {
        throw new Error('Course not found');
      }

      const clonedCourse = await courseApi.createCourse({
        title: newTitle,
        description: newDescription || originalCourse.description,
        difficultyLevel: originalCourse.difficultyLevel,
        category: originalCourse.category,
        tags: originalCourse.tags,
        visibility: 'private', // Always start as private
        customerScope: originalCourse.customerScope,
        requiresApproval: originalCourse.requiresApproval,
        allowDownloads: originalCourse.allowDownloads,
        enableCertificates: originalCourse.enableCertificates,
        passThreshold: originalCourse.passThreshold,
        metadata: originalCourse.metadata,
        modules: originalCourse.modules?.map(module => ({
          title: module.title,
          description: module.description,
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
    } catch (error) {
      console.error('Error cloning course:', error);
      throw new Error('Failed to clone course');
    }
  }

  /**
   * Get course analytics
   */
  static async getCourseAnalytics(courseId: string) {
    try {
      const course = await courseApi.getCourse(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      const enrollments = await courseApi.getCourseEnrollments(courseId);
      
      const totalEnrollments = enrollments.length;
      const completedEnrollments = enrollments.filter(e => e.completedAt).length;
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

      return {
        course,
        totalEnrollments,
        completedEnrollments,
        completionRate,
        averageScore: enrollments.reduce((sum, e) => sum + (e.score || 0), 0) / totalEnrollments || 0,
      };
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw new Error('Failed to fetch course analytics');
    }
  }

  /**
   * Save course builder state
   */
  static async saveCourseBuilderState(
    courseId: string,
    state: CourseBuilderState
  ): Promise<void> {
    try {
      await courseApi.saveCourseBuilderState(courseId, state);
    } catch (error) {
      console.error('Error saving course builder state:', error);
      throw new Error('Failed to save course builder state');
    }
  }

  /**
   * Load course builder state
   */
  static async loadCourseBuilderState(courseId: string): Promise<CourseBuilderState | null> {
    try {
      return await courseApi.loadCourseBuilderState(courseId);
    } catch (error) {
      console.error('Error loading course builder state:', error);
      throw new Error('Failed to load course builder state');
    }
  }

  /**
   * Update course total duration based on modules
   */
  private static async updateCourseDuration(courseId: string): Promise<void> {
    try {
      const modules = await courseApi.getCourseModules(courseId);
      const totalDuration = modules.reduce((sum, module) => sum + (module.estimatedDuration || 0), 0);
      
      await courseApi.updateCourse(courseId, {
        totalDuration,
      });
    } catch (error) {
      console.error('Error updating course duration:', error);
      // Don't throw here as this is a background operation
    }
  }

  /**
   * Validate course before publishing
   */
  static validateCourseForPublishing(course: Course): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!course.title?.trim()) {
      errors.push('Course title is required');
    }

    if (!course.description?.trim()) {
      errors.push('Course description is required');
    }

    if (!course.modules || course.modules.length === 0) {
      errors.push('Course must have at least one module');
    }

    if (course.modules) {
      const requiredModules = course.modules.filter(m => m.isRequired);
      if (requiredModules.length === 0) {
        errors.push('Course must have at least one required module');
      }

      // Check for modules with missing content
      const incompleteModules = course.modules.filter(m => 
        m.type === 'reel' && !m.contentId
      );
      if (incompleteModules.length > 0) {
        errors.push('All reel modules must have content assigned');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
