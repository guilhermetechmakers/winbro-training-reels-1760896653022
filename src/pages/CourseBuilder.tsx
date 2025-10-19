import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Eye, 
  Save, 
  Play, 
  Edit3, 
  Clock, 
  Users, 
  BookOpen, 
  Video,
  AlertCircle,
  HelpCircle,
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCourses, useCreateCourse, useUpdateCourse } from '@/hooks/useCourses';
import { useReels } from '@/hooks/useReels';
import { useCreateQuiz } from '@/hooks/useQuiz';
import type { Course, CourseModule, Reel, CreateCourseInput, CourseBuilderState } from '@/types';
import type { CourseQuiz, QuizQuestionForm } from '@/types/quiz';
import { toast } from 'sonner';
import CourseMetadataForm from '@/components/course-builder/CourseMetadataForm';
import DragDropTimeline from '@/components/course-builder/DragDropTimeline';
import PublishControlsComponent from '@/components/course-builder/PublishControls';
import { QuizCard } from '@/components/quiz/QuizCard';
import MainLayout from '@/components/layout/MainLayout';


// Reel Library Component
const ReelLibrary = ({ 
  reels, 
  onAddReel,
  searchQuery,
  onSearchChange
}: { 
  reels: Reel[]; 
  onAddReel: (reel: Reel) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) => {
  const filteredReels = reels.filter(reel =>
    reel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reel.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reel.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-accent-blue" />
          Reel Library
        </CardTitle>
        <CardDescription>Add reels to your course from your library</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search reels..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredReels.map((reel) => (
            <motion.div
              key={reel.id}
              whileHover={{ scale: 1.02 }}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onAddReel(reel)}
            >
              <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                {reel.thumbnailUrl ? (
                  <img 
                    src={reel.thumbnailUrl} 
                    alt={reel.title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <Video className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h4 className="font-medium text-sm mb-1 line-clamp-2">{reel.title}</h4>
              <p className="text-xs text-secondary-text mb-2 line-clamp-2">{reel.description}</p>
              <div className="flex items-center justify-between text-xs text-secondary-text">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.floor(reel.duration / 60)}m
                </span>
                <Badge variant="outline" className="text-xs">
                  {reel.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
        {filteredReels.length === 0 && (
          <div className="text-center py-8 text-secondary-text">
            <Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No reels found</p>
            <p className="text-sm">
              {searchQuery ? 'Try adjusting your search terms' : 'Upload some reels to get started'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};



export default function CourseBuilder() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reelSearchQuery, setReelSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'duration'>('newest');

  // API hooks
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: reels } = useReels();
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();

  // Course builder state
  const [courseBuilderState, setCourseBuilderState] = useState<CourseBuilderState>({
    course: {
      title: '',
      description: '',
      difficultyLevel: 'beginner',
      visibility: 'private',
      enableCertificates: true,
      passThreshold: 80,
      tags: [],
      category: '',
      requiresApproval: false,
      allowDownloads: false,
    },
    modules: [],
    isDirty: false,
    isSaving: false,
  });

  // Auto-save functionality
  useEffect(() => {
    if (courseBuilderState.isDirty && selectedCourse) {
      const timeoutId = setTimeout(() => {
        handleSaveDraft();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [courseBuilderState.isDirty, selectedCourse]);

  // Create new course
  const handleCreateCourse = useCallback(async () => {
    if (!courseBuilderState.course.title?.trim()) {
      toast.error('Please enter a course title');
      return;
    }

    try {
      const courseData: CreateCourseInput = {
        title: courseBuilderState.course.title,
        description: courseBuilderState.course.description || '',
        modules: courseBuilderState.modules.map(module => ({
          title: module.title,
          type: module.type,
          content: module.content,
          order: module.order,
          contentId: module.contentId,
          contentData: module.contentData,
          estimatedDuration: module.estimatedDuration,
          isRequired: module.isRequired,
          unlockAfterPrevious: module.unlockAfterPrevious,
        })),
        difficultyLevel: courseBuilderState.course.difficultyLevel || 'beginner',
        visibility: courseBuilderState.course.visibility || 'private',
        enableCertificates: courseBuilderState.course.enableCertificates !== false,
        passThreshold: courseBuilderState.course.passThreshold || 80,
        tags: courseBuilderState.course.tags || [],
        category: courseBuilderState.course.category,
        requiresApproval: courseBuilderState.course.requiresApproval || false,
        allowDownloads: courseBuilderState.course.allowDownloads || false,
      };

      const newCourse = await createCourseMutation.mutateAsync(courseData);
      setSelectedCourse(newCourse);
      setIsCreating(false);
      setCourseBuilderState(prev => ({ ...prev, isDirty: false }));
      toast.success('Course created successfully');
    } catch (error) {
      toast.error('Failed to create course');
      console.error('Error creating course:', error);
    }
  }, [courseBuilderState, createCourseMutation]);


  // Update course metadata
  const handleUpdateCourseMetadata = useCallback((updates: Partial<Course>) => {
    setCourseBuilderState(prev => ({
      ...prev,
      course: { ...prev.course, ...updates },
      isDirty: true,
    }));
  }, []);

  // Add module to course
  const handleAddModule = useCallback((module: Omit<CourseModule, 'id' | 'courseId' | 'orderIndex'>) => {
    const newModule: CourseModule = {
      ...module,
      id: `temp-${Date.now()}`,
      courseId: selectedCourse?.id || '',
      orderIndex: courseBuilderState.modules.length,
    };
    
    setCourseBuilderState(prev => ({
      ...prev,
      modules: [...prev.modules, newModule],
      isDirty: true,
    }));
  }, [selectedCourse, courseBuilderState.modules.length]);

  // Update module
  const handleUpdateModule = useCallback((moduleId: string, updates: Partial<CourseModule>) => {
    setCourseBuilderState(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId ? { ...module, ...updates } : module
      ),
      isDirty: true,
    }));
  }, []);

  // Delete module
  const handleDeleteModule = useCallback((moduleId: string) => {
    setCourseBuilderState(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId),
      isDirty: true,
    }));
  }, []);

  // Reorder modules
  const handleReorderModules = useCallback((moduleIds: string[]) => {
    setCourseBuilderState(prev => {
      const reorderedModules = moduleIds.map(id => 
        prev.modules.find(module => module.id === id)
      ).filter(Boolean) as CourseModule[];
      
      return {
        ...prev,
        modules: reorderedModules,
        isDirty: true,
      };
    });
  }, []);

  // Publish course
  const handlePublish = useCallback(async () => {
    if (!selectedCourse) return;
    
    setIsSaving(true);
    try {
      await updateCourseMutation.mutateAsync({
        id: selectedCourse.id,
        updates: {
          ...courseBuilderState.course,
          status: 'published',
        },
      });
      
      setCourseBuilderState(prev => ({ ...prev, isDirty: false }));
      toast.success('Course published successfully');
    } catch (error) {
      toast.error('Failed to publish course');
      console.error('Error publishing course:', error);
    } finally {
      setIsSaving(false);
    }
  }, [selectedCourse, courseBuilderState.course, updateCourseMutation]);

  // Save draft
  const handleSaveDraft = useCallback(async () => {
    if (!selectedCourse) return;
    
    setIsSaving(true);
    try {
      await updateCourseMutation.mutateAsync({
        id: selectedCourse.id,
        updates: {
          ...courseBuilderState.course,
          status: 'draft',
        },
      });
      
      setCourseBuilderState(prev => ({ ...prev, isDirty: false }));
      toast.success('Draft saved successfully');
    } catch (error) {
      toast.error('Failed to save draft');
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [selectedCourse, courseBuilderState.course, updateCourseMutation]);

  // Add reel to course
  const handleAddReel = useCallback((reel: Reel) => {
    handleAddModule({
      title: reel.title,
      type: 'reel',
      content: reel,
      order: courseBuilderState.modules.length,
      estimatedDuration: reel.duration,
      isRequired: true,
      unlockAfterPrevious: true,
      contentId: reel.id,
      contentData: {},
    });
  }, [handleAddModule, courseBuilderState.modules.length]);

  // Add quiz to course
  const handleAddQuiz = useCallback((quiz: CourseQuiz) => {
    handleAddModule({
      title: quiz.question,
      type: 'quiz',
      content: quiz,
      order: courseBuilderState.modules.length,
      estimatedDuration: 300, // 5 minutes default for quiz
      isRequired: true,
      unlockAfterPrevious: true,
      contentId: quiz.id,
      contentData: {},
    });
  }, [handleAddModule, courseBuilderState.modules.length]);

  // Create new quiz
  const createQuizMutation = useCreateQuiz();
  const handleCreateQuiz = useCallback(async (quizData: Omit<CourseQuiz, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newQuiz = await createQuizMutation.mutateAsync({
        ...quizData,
        courseId: selectedCourse?.id || '',
      });
      
      handleAddQuiz(newQuiz);
      toast.success('Quiz added to course');
    } catch (error) {
      toast.error('Failed to create quiz');
      console.error('Error creating quiz:', error);
    }
  }, [createQuizMutation, handleAddQuiz, selectedCourse]);






  // Filter and sort courses
  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'duration':
        return (b.totalDuration || 0) - (a.totalDuration || 0);
      default:
        return 0;
    }
  }) || [];

  if (isPreviewMode && selectedCourse) {
    return (
      <div className="min-h-screen bg-main-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-primary-text">Course Preview</h1>
            <Button onClick={() => setIsPreviewMode(false)} variant="outline">
              Back to Builder
            </Button>
          </div>
          <Card className="card">
            <CardHeader>
              <CardTitle>{selectedCourse.title}</CardTitle>
              <CardDescription>{selectedCourse.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-secondary-text" />
                    <span>{Math.floor(selectedCourse.totalDuration / 60)} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-secondary-text" />
                    <span>{selectedCourse.modules?.length || 0} modules</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-secondary-text" />
                    <span>{selectedCourse.enrolledUsers?.length || 0} enrolled</span>
                  </div>
                </div>
                <div className="pt-4">
                  <h3 className="font-semibold mb-2">Course Modules</h3>
                  <div className="space-y-2">
                    {courseBuilderState.modules.map((module, index) => (
                      <div key={module.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
                        <div className="flex-1">
                          <h4 className="font-medium">{module.title}</h4>
                          <p className="text-sm text-gray-500 capitalize">{module.type}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {module.estimatedDuration > 0 ? `${Math.floor(module.estimatedDuration / 60)}m` : 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-main-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-text mb-2">Course Builder</h1>
              <p className="text-secondary-text">Create structured training courses from reels and resources</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsCreating(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Course
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6">
          <Card className="card">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-icon-gray" />
                    <Input
                      placeholder="Search courses by title, description, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title A-Z</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course List or Builder */}
        {isCreating ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                <TabsTrigger value="publish">Publish</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <CourseMetadataForm
                  course={courseBuilderState.course}
                  onUpdate={handleUpdateCourseMetadata}
                />
              </TabsContent>
              
              <TabsContent value="content" className="space-y-6">
                <DragDropTimeline
                  modules={courseBuilderState.modules}
                  availableReels={[]}
                  onAddModule={handleAddModule}
                  onUpdateModule={handleUpdateModule}
                  onDeleteModule={handleDeleteModule}
                  onReorderModules={handleReorderModules}
                  isPreviewMode={false}
                />
                
                <ReelLibrary
                  reels={reels || []}
                  onAddReel={handleAddReel}
                  searchQuery={reelSearchQuery}
                  onSearchChange={setReelSearchQuery}
                />
              </TabsContent>
              
              <TabsContent value="quizzes" className="space-y-6">
                <QuizSection 
                  courseId={selectedCourse?.id || ''}
                  quizzes={courseBuilderState.modules.filter(m => m.type === 'quiz')}
                  onCreateQuiz={handleCreateQuiz}
                />
              </TabsContent>
              
              <TabsContent value="publish" className="space-y-6">
                <PublishControlsComponent
                  course={courseBuilderState.course}
                  modules={courseBuilderState.modules}
                  onPublish={handlePublish}
                  onSaveDraft={handleSaveDraft}
                  isPublishing={isSaving}
                  isSaving={isSaving}
                />
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-secondary-text">
                {courseBuilderState.isDirty && (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Unsaved changes
                  </span>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setIsPreviewMode(true)}
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={handleCreateCourse}
                  disabled={createCourseMutation.isPending || !courseBuilderState.course.title}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="card hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md hover:shadow-2xl">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-accent-blue transition-colors line-clamp-2">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="mt-2 line-clamp-2 text-sm">
                            {course.description || 'No description provided'}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCourse(course);
                              setIsCreating(true);
                            }}
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCourse(course);
                              setIsPreviewMode(true);
                            }}
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle more actions
                            }}
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={course.status === 'published' ? 'default' : 'secondary'}
                            className={`text-xs font-medium ${
                              course.status === 'published' 
                                ? 'bg-status-green text-white' 
                                : course.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {course.status === 'published' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {course.status === 'draft' && <Pause className="h-3 w-3 mr-1" />}
                            {course.status === 'archived' && <XCircle className="h-3 w-3 mr-1" />}
                            {course.status}
                          </Badge>
                          <span className="text-xs text-secondary-text capitalize font-medium">
                            {course.difficultyLevel}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-icon-gray" />
                            <span className="text-secondary-text font-medium">
                              {Math.floor((course.totalDuration || 0) / 60)}m
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-icon-gray" />
                            <span className="text-secondary-text font-medium">
                              {course.modules?.length || 0} modules
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-icon-gray" />
                            <span className="text-secondary-text">
                              {course.enrolledCount || 0} enrolled
                            </span>
                          </div>
                          <div className="text-xs text-secondary-text">
                            {new Date(course.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {course.tags && course.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {course.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs px-2 py-1">
                                {tag}
                              </Badge>
                            ))}
                            {course.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                +{course.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!isCreating && filteredCourses.length === 0 && !coursesLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="card">
              <CardContent className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="h-12 w-12 text-icon-gray" />
                </div>
                <h3 className="text-xl font-semibold text-primary-text mb-3">
                  {searchQuery || filterStatus !== 'all' ? 'No courses found' : 'No courses yet'}
                </h3>
                <p className="text-secondary-text mb-8 max-w-md mx-auto">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for'
                    : 'Create your first course to start building structured training content from your reels and resources'
                  }
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="btn-primary"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Course
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Loading State */}
        {coursesLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="card">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </div>
    </MainLayout>
  );
}

// Quiz Section Component
const QuizSection = ({ 
  courseId, 
  quizzes, 
  onCreateQuiz 
}: { 
  courseId: string; 
  quizzes: CourseModule[]; 
  onCreateQuiz: (quiz: Omit<CourseQuiz, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) => {
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [newQuizData, setNewQuizData] = useState<QuizQuestionForm>({
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    points: 1,
    timeLimit: undefined
  });

  const handleCreateQuiz = () => {
    if (!newQuizData.question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (newQuizData.type === 'multiple-choice' && newQuizData.options.filter(o => o.trim()).length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    if (!newQuizData.correctAnswer.trim()) {
      toast.error('Please provide a correct answer');
      return;
    }

    const quizData: Omit<CourseQuiz, 'id' | 'createdAt' | 'updatedAt'> = {
      courseId,
      question: newQuizData.question,
      type: newQuizData.type,
      options: newQuizData.options.filter(o => o.trim()),
      correctAnswer: newQuizData.correctAnswer,
      explanation: newQuizData.explanation,
      points: newQuizData.points,
      timeLimit: newQuizData.timeLimit,
      orderIndex: quizzes.length
    };

    onCreateQuiz(quizData);
    setIsCreatingQuiz(false);
    setNewQuizData({
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
      timeLimit: undefined
    });
  };

  return (
    <div className="space-y-6">
      {/* Quiz List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-accent-blue" />
                Course Quizzes
              </CardTitle>
              <CardDescription>Add interactive quizzes to test learner comprehension</CardDescription>
            </div>
            <Button
              onClick={() => setIsCreatingQuiz(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Quiz
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quizzes.length > 0 ? (
            <div className="space-y-4">
              {quizzes.map((module, _index) => (
                <QuizCard
                  key={module.id}
                  quiz={module.content as CourseQuiz}
                  onStart={() => {}}
                  onViewResults={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-text">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No quizzes yet</p>
              <p className="text-sm">Add quizzes to test learner comprehension</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Quiz Form */}
      {isCreatingQuiz && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Quiz</CardTitle>
            <CardDescription>Add a quiz question to your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question *</label>
              <Input
                value={newQuizData.question}
                onChange={(e) => setNewQuizData(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Enter your question here..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Question Type *</label>
              <select
                value={newQuizData.type}
                onChange={(e) => setNewQuizData(prev => ({ 
                  ...prev, 
                  type: e.target.value as any,
                  options: e.target.value === 'multiple-choice' ? ['', '', '', ''] : [],
                  correctAnswer: e.target.value === 'true-false' ? 'true' : ''
                }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="short-answer">Short Answer</option>
              </select>
            </div>

            {newQuizData.type === 'multiple-choice' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Answer Options *</label>
                {newQuizData.options.map((option, index) => (
                  <Input
                    key={index}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newQuizData.options];
                      newOptions[index] = e.target.value;
                      setNewQuizData(prev => ({ ...prev, options: newOptions }));
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Correct Answer *</label>
              {newQuizData.type === 'multiple-choice' ? (
                <select
                  value={newQuizData.correctAnswer}
                  onChange={(e) => setNewQuizData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select correct answer</option>
                  {newQuizData.options.filter(o => o.trim()).map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              ) : newQuizData.type === 'true-false' ? (
                <select
                  value={newQuizData.correctAnswer}
                  onChange={(e) => setNewQuizData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : (
                <Input
                  value={newQuizData.correctAnswer}
                  onChange={(e) => setNewQuizData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  placeholder="Enter correct answer..."
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Explanation (optional)</label>
              <Input
                value={newQuizData.explanation}
                onChange={(e) => setNewQuizData(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Explain why this is the correct answer..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Points</label>
                <Input
                  type="number"
                  min="1"
                  value={newQuizData.points}
                  onChange={(e) => setNewQuizData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Limit (seconds)</label>
                <Input
                  type="number"
                  min="1"
                  value={newQuizData.timeLimit || ''}
                  onChange={(e) => setNewQuizData(prev => ({ 
                    ...prev, 
                    timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="No limit"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setIsCreatingQuiz(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateQuiz}
                className="btn-primary"
              >
                Add Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};