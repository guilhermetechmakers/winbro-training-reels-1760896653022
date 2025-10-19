import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Eye, Save, Play, Edit3, Clock, Users, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCourses, useCreateCourse } from '@/hooks/useCourses';
import { useReels } from '@/hooks/useReels';
import type { Course, CourseModule, Reel, CreateCourseInput } from '@/types';
import { toast } from 'sonner';

// Placeholder components - these would be implemented as separate components in a real app
const CourseMetadataForm = ({ course, onUpdate }: { course: Partial<Course>; onUpdate: (updates: Partial<Course>) => void }) => (
  <Card className="card">
    <CardHeader>
      <CardTitle>Course Details</CardTitle>
      <CardDescription>Basic information about your course</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input
          value={course.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Enter course title"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={course.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Enter course description"
        />
      </div>
    </CardContent>
  </Card>
);

const ModuleTimeline = ({ 
  modules, 
  onRemoveModule
}: { 
  modules: CourseModule[]; 
  onRemoveModule: (id: string) => void; 
}) => (
  <Card className="card">
    <CardHeader>
      <CardTitle>Course Modules</CardTitle>
      <CardDescription>Organize your course content</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {modules.map((module, index) => (
          <div key={module.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
            <div className="flex-1">
              <h4 className="font-medium">{module.title}</h4>
              <p className="text-sm text-gray-500 capitalize">{module.type}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemoveModule(module.id)}
            >
              Remove
            </Button>
          </div>
        ))}
        {modules.length === 0 && (
          <p className="text-center text-gray-500 py-4">No modules added yet</p>
        )}
      </div>
    </CardContent>
  </Card>
);

const ReelLibrary = ({ 
  reels, 
  onAddReel 
}: { 
  reels: Reel[]; 
  onAddReel: (reel: Reel) => void; 
}) => (
  <Card className="card">
    <CardHeader>
      <CardTitle>Reel Library</CardTitle>
      <CardDescription>Add reels to your course</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reels.map((reel) => (
          <div key={reel.id} className="border rounded-lg p-4">
            <h4 className="font-medium">{reel.title}</h4>
            <p className="text-sm text-gray-500 mb-2">{reel.description}</p>
            <Button
              size="sm"
              onClick={() => onAddReel(reel)}
            >
              Add to Course
            </Button>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const QuizBuilder = () => (
  <Card className="card">
    <CardHeader>
      <CardTitle>Quiz Builder</CardTitle>
      <CardDescription>Add quizzes to your course</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-gray-500">Quiz builder functionality would be implemented here</p>
    </CardContent>
  </Card>
);

export default function CourseBuilder() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');

  // API hooks
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: reels } = useReels();
  const createCourseMutation = useCreateCourse();

  // Course builder state
  const [courseBuilderState, setCourseBuilderState] = useState<{
    course: Partial<Course>;
    modules: CourseModule[];
    isDirty: boolean;
    isSaving: boolean;
  }>({
    course: {
      title: '',
      description: '',
      difficultyLevel: 'beginner',
      visibility: 'private',
      enableCertificates: true,
      passThreshold: 80,
    },
    modules: [],
    isDirty: false,
    isSaving: false,
  });

  // Create new course
  const handleCreateCourse = useCallback(async () => {
    if (!newCourseTitle.trim()) {
      toast.error('Please enter a course title');
      return;
    }

    try {
      const courseData: CreateCourseInput = {
        title: newCourseTitle,
        description: newCourseDescription,
        modules: [],
        difficultyLevel: 'beginner',
        visibility: 'private',
        enableCertificates: true,
        passThreshold: 80,
      };

      const newCourse = await createCourseMutation.mutateAsync(courseData);
      setSelectedCourse(newCourse);
      setIsCreating(false);
      setNewCourseTitle('');
      setNewCourseDescription('');
      toast.success('Course created successfully');
    } catch (error) {
      toast.error('Failed to create course');
      console.error('Error creating course:', error);
    }
  }, [newCourseTitle, newCourseDescription, createCourseMutation]);


  // Update course metadata
  const handleUpdateCourseMetadata = useCallback((updates: Partial<Course>) => {
    setCourseBuilderState(prev => ({
      ...prev,
      course: { ...prev.course, ...updates },
      isDirty: true,
    }));
  }, []);

  // Add module to course
  const handleAddModule = useCallback((module: Omit<CourseModule, 'id'>) => {
    const newModule: CourseModule = {
      ...module,
      id: `temp-${Date.now()}`,
    };
    
    setCourseBuilderState(prev => ({
      ...prev,
      modules: [...prev.modules, newModule],
      isDirty: true,
    }));
  }, []);


  // Remove module from course
  const handleRemoveModule = useCallback((moduleId: string) => {
    setCourseBuilderState(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId),
      isDirty: true,
    }));
  }, []);

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
            {/* Course Metadata Form */}
            <CourseMetadataForm
              course={courseBuilderState.course}
              onUpdate={handleUpdateCourseMetadata}
            />

            {/* Module Timeline */}
            <ModuleTimeline
              modules={courseBuilderState.modules}
              onRemoveModule={handleRemoveModule}
            />

            {/* Reel Library */}
            <ReelLibrary
              reels={reels || []}
              onAddReel={(reel) => handleAddModule({
                title: reel.title,
                type: 'reel',
                content: reel,
                order: courseBuilderState.modules.length,
                estimatedDuration: reel.duration,
                isRequired: true,
                unlockAfterPrevious: true,
              })}
            />

            {/* Quiz Builder */}
            <QuizBuilder />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
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
                disabled={createCourseMutation.isPending}
                className="btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
              </Button>
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
                  <Card className="card hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {course.description || 'No description'}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedCourse(course)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedCourse(course);
                              setIsPreviewMode(true);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-secondary-text">
                          <span>Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.status === 'published' 
                              ? 'bg-status-green text-white' 
                              : course.status === 'draft'
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-status-gray text-gray-600'
                          }`}>
                            {course.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-secondary-text">
                          <span>Duration</span>
                          <span>{Math.floor(course.totalDuration / 60)}m</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-secondary-text">
                          <span>Modules</span>
                          <span>{course.modules?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-secondary-text">
                          <span>Difficulty</span>
                          <span className="capitalize">{course.difficultyLevel}</span>
                        </div>
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