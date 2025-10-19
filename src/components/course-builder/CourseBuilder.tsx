import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Eye, 
  Play, 
  Plus, 
  Settings, 
  BookOpen, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  useCourse, 
  useCreateCourse, 
  useUpdateCourse, 
  useSaveCourseBuilderState,
  useCourseModules,
  useAddCourseModule,
  useUpdateCourseModule,
  useDeleteCourseModule,
  useReorderCourseModules
} from '@/hooks/useCourses';
import { useReels } from '@/hooks/useReels';
import CourseMetadataForm from './CourseMetadataForm';
import DragDropTimeline from './DragDropTimeline';
import QuizBuilder from './QuizBuilder';
import PublishControls from './PublishControls';
import type { Course, CourseModule, CourseBuilderState, DragDropItem } from '@/types';

interface CourseBuilderProps {
  courseId?: string;
  isNewCourse?: boolean;
}

export default function CourseBuilder({ courseId, isNewCourse = false }: CourseBuilderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timeline');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [builderState, setBuilderState] = useState<CourseBuilderState>({
    course: {},
    modules: [],
    isDirty: false,
    isSaving: false,
  });

  // Queries
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseId || '');
  const { data: modules, isLoading: modulesLoading } = useCourseModules(courseId || '');
  const { data: reels } = useReels();

  // Mutations
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const saveBuilderStateMutation = useSaveCourseBuilderState();
  const addModuleMutation = useAddCourseModule();
  const updateModuleMutation = useUpdateCourseModule();
  const deleteModuleMutation = useDeleteCourseModule();
  const reorderModulesMutation = useReorderCourseModules();

  // Initialize builder state
  useEffect(() => {
    if (course) {
      setBuilderState(prev => ({
        ...prev,
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          difficultyLevel: course.difficultyLevel,
          category: course.category,
          tags: course.tags,
          visibility: course.visibility,
          requiresApproval: course.requiresApproval,
          allowDownloads: course.allowDownloads,
          enableCertificates: course.enableCertificates,
          passThreshold: course.passThreshold,
          metadata: course.metadata,
        },
        isDirty: false,
      }));
    }
  }, [course]);

  useEffect(() => {
    if (modules) {
      setBuilderState(prev => ({
        ...prev,
        modules: modules.map(module => ({
          id: module.id,
          title: module.title,
          description: module.description,
          type: module.type,
          content: module.content,
          order: module.order,
          contentId: module.contentId,
          contentData: module.contentData,
          orderIndex: module.orderIndex,
          estimatedDuration: module.estimatedDuration,
          isRequired: module.isRequired,
          unlockAfterPrevious: module.unlockAfterPrevious,
          courseId: module.courseId,
        })),
      }));
    }
  }, [modules]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && courseId && !isNewCourse) {
      const timeoutId = setTimeout(() => {
        handleSaveDraft();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [isDirty, courseId, isNewCourse]);

  const handleCourseUpdate = useCallback((updates: Partial<Course>) => {
    setBuilderState(prev => ({
      ...prev,
      course: { ...prev.course, ...updates },
      isDirty: true,
    }));
    setIsDirty(true);
  }, []);

  const handleAddModule = useCallback((module: Omit<CourseModule, 'id' | 'courseId' | 'orderIndex'>) => {
    if (!courseId) return;

    const newModule = {
      ...module,
      courseId,
      orderIndex: builderState.modules.length,
    };

    addModuleMutation.mutate(newModule, {
      onSuccess: () => {
        toast.success('Module added successfully');
        setIsDirty(true);
      },
      onError: (error) => {
        toast.error('Failed to add module');
        console.error('Error adding module:', error);
      },
    });
  }, [courseId, builderState.modules.length, addModuleMutation]);

  const handleUpdateModule = useCallback((moduleId: string, updates: Partial<CourseModule>) => {
    updateModuleMutation.mutate(
      { id: moduleId, updates },
      {
        onSuccess: () => {
          toast.success('Module updated successfully');
          setIsDirty(true);
        },
        onError: (error) => {
          toast.error('Failed to update module');
          console.error('Error updating module:', error);
        },
      }
    );
  }, [updateModuleMutation]);

  const handleDeleteModule = useCallback((moduleId: string) => {
    deleteModuleMutation.mutate(moduleId, {
      onSuccess: () => {
        toast.success('Module deleted successfully');
        setIsDirty(true);
      },
      onError: (error) => {
        toast.error('Failed to delete module');
        console.error('Error deleting module:', error);
      },
    });
  }, [deleteModuleMutation]);

  const handleReorderModules = useCallback((moduleIds: string[]) => {
    if (!courseId) return;

    reorderModulesMutation.mutate(
      { courseId, moduleIds },
      {
        onSuccess: () => {
          toast.success('Modules reordered successfully');
          setIsDirty(true);
        },
        onError: (error) => {
          toast.error('Failed to reorder modules');
          console.error('Error reordering modules:', error);
        },
      }
    );
  }, [courseId, reorderModulesMutation]);

  const handleSaveDraft = useCallback(async () => {
    if (!courseId || isNewCourse) return;

    setIsSaving(true);
    try {
      await updateCourseMutation.mutateAsync({
        id: courseId,
        updates: {
          ...builderState.course,
          status: 'draft',
        },
      });
      
      await saveBuilderStateMutation.mutateAsync({
        courseId,
        state: builderState,
      });

      setIsDirty(false);
      toast.success('Draft saved successfully');
    } catch (error) {
      toast.error('Failed to save draft');
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [courseId, isNewCourse, builderState, updateCourseMutation, saveBuilderStateMutation]);

  const handlePublish = useCallback(async () => {
    if (!courseId) return;

    setIsSaving(true);
    try {
      await updateCourseMutation.mutateAsync({
        id: courseId,
        updates: {
          ...builderState.course,
          status: 'published',
        },
      });

      setIsDirty(false);
      toast.success('Course published successfully');
      navigate(`/courses/${courseId}`);
    } catch (error) {
      toast.error('Failed to publish course');
      console.error('Error publishing course:', error);
    } finally {
      setIsSaving(false);
    }
  }, [courseId, builderState.course, updateCourseMutation, navigate]);

  const handleCreateCourse = useCallback(async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const newCourse = await createCourseMutation.mutateAsync({
        title: builderState.course.title || 'Untitled Course',
        description: builderState.course.description || '',
        modules: builderState.modules,
        difficultyLevel: builderState.course.difficultyLevel || 'beginner',
        category: builderState.course.category,
        tags: builderState.course.tags || [],
        visibility: builderState.course.visibility || 'private',
        customerScope: builderState.course.customerScope || [],
        requiresApproval: builderState.course.requiresApproval || false,
        allowDownloads: builderState.course.allowDownloads || false,
        enableCertificates: builderState.course.enableCertificates !== false,
        passThreshold: builderState.course.passThreshold || 80,
        metadata: builderState.course.metadata || {},
      });

      toast.success('Course created successfully');
      navigate(`/courses/${newCourse.id}/builder`);
    } catch (error) {
      toast.error('Failed to create course');
      console.error('Error creating course:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, builderState, createCourseMutation, navigate]);

  const handlePreview = useCallback(() => {
    setIsPreviewMode(!isPreviewMode);
  }, [isPreviewMode]);

  // Loading state
  if (courseLoading || modulesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-accent-blue" />
          <span className="text-secondary-text">Loading course builder...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (courseError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-primary-text mb-2">Error Loading Course</h3>
          <p className="text-secondary-text mb-4">Failed to load the course builder</p>
          <Button onClick={() => navigate('/courses')} variant="outline">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const availableReels: DragDropItem[] = (reels || [])
    .filter(reel => reel.status === 'published')
    .map(reel => ({
      id: reel.id,
      type: 'reel' as const,
      title: reel.title,
      duration: reel.duration,
      thumbnail: reel.thumbnailUrl,
    }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/courses')}
                className="text-secondary-text hover:text-primary-text"
              >
                ← Back to Courses
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-primary-text">
                  {isNewCourse ? 'Create New Course' : 'Course Builder'}
                </h1>
                {course && (
                  <p className="text-sm text-secondary-text">
                    {course.title || 'Untitled Course'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status indicators */}
              <div className="flex items-center gap-2">
                {isDirty && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unsaved changes
                  </Badge>
                )}
                {isSaving && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Saving...
                  </Badge>
                )}
                {!isDirty && !isSaving && course && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Saved
                  </Badge>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  disabled={isSaving}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                
                {isNewCourse ? (
                  <Button
                    onClick={handleCreateCourse}
                    disabled={isSaving || !builderState.course.title}
                    className="bg-accent-blue hover:bg-accent-blue/90"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Create Course
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveDraft}
                      disabled={isSaving || !isDirty}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button
                      onClick={handlePublish}
                      disabled={isSaving || !builderState.course.title || builderState.modules.length === 0}
                      className="bg-accent-blue hover:bg-accent-blue/90"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Publish
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="metadata" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="publish" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Publish
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DragDropTimeline
                modules={builderState.modules}
                availableReels={availableReels}
                onAddModule={handleAddModule}
                onUpdateModule={handleUpdateModule}
                onDeleteModule={handleDeleteModule}
                onReorderModules={handleReorderModules}
                isPreviewMode={isPreviewMode}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-6">
            <CourseMetadataForm
              course={builderState.course}
              onUpdate={handleCourseUpdate}
              isEditing={!isNewCourse}
            />
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <QuizBuilder
                courseId={courseId}
                quizzes={[]} // TODO: Implement quiz management
                onAddQuiz={() => {}} // TODO: Implement
                onEditQuiz={() => {}} // TODO: Implement
                onDeleteQuiz={() => {}} // TODO: Implement
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="publish" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PublishControls
                course={builderState.course}
                modules={builderState.modules}
                onPublish={handlePublish}
                onSaveDraft={handleSaveDraft}
                isPublishing={isSaving}
                isSaving={isSaving}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}