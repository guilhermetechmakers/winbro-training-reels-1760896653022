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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCourses, useCreateCourse, useUpdateCourse } from '@/hooks/useCourses';
import { useReels } from '@/hooks/useReels';
import type { Course, CourseModule, Reel, CreateCourseInput, CourseBuilderState } from '@/types';
import { toast } from 'sonner';
import CourseMetadataForm from '@/components/course-builder/CourseMetadataForm';
import DragDropTimeline from '@/components/course-builder/DragDropTimeline';
import QuizBuilderComponent from '@/components/course-builder/QuizBuilder';
import PublishControlsComponent from '@/components/course-builder/PublishControls';


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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reelSearchQuery, setReelSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

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


  // Save draft
  const handleSaveDraft = useCallback(async () => {
    if (!selectedCourse) return;

    try {
      await updateCourseMutation.mutateAsync({
        id: selectedCourse.id,
        updates: {
          ...courseBuilderState.course,
          modules: courseBuilderState.modules,
        },
      });
      
      setCourseBuilderState(prev => ({ ...prev, isDirty: false, isSaving: false }));
      toast.success('Draft saved successfully');
    } catch (error) {
      toast.error('Failed to save draft');
      console.error('Error saving draft:', error);
    }
  }, [selectedCourse, courseBuilderState, updateCourseMutation]);




  // Filter courses based on search
  const filteredCourses = courses?.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
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
                <DragDropTimeline />
                
                <ReelLibrary
                  reels={reels || []}
                  onAddReel={handleAddReel}
                  searchQuery={reelSearchQuery}
                  onSearchChange={setReelSearchQuery}
                />
              </TabsContent>
              
              <TabsContent value="quizzes" className="space-y-6">
                <QuizBuilderComponent />
              </TabsContent>
              
              <TabsContent value="publish" className="space-y-6">
                <PublishControlsComponent />
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
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="card hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-accent-blue transition-colors">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {course.description || 'No description'}
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
                            className="h-8 w-8 p-0"
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
                            className="h-8 w-8 p-0"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={course.status === 'published' ? 'default' : 'secondary'}
                            className={course.status === 'published' ? 'bg-status-green' : ''}
                          >
                            {course.status}
                          </Badge>
                          <span className="text-xs text-secondary-text capitalize">
                            {course.difficultyLevel}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-secondary-text" />
                            <span className="text-secondary-text">
                              {Math.floor(course.totalDuration / 60)}m
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-secondary-text" />
                            <span className="text-secondary-text">
                              {course.modules?.length || 0} modules
                            </span>
                          </div>
                        </div>
                        
                        {course.tags && course.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {course.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {course.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
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
          <Card className="card">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-primary-text mb-2">
                {searchQuery ? 'No courses found' : 'No courses yet'}
              </h3>
              <p className="text-secondary-text mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first course to get started'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setIsCreating(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}