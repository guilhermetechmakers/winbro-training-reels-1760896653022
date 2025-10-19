import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Settings, 
  BookOpen,
  CheckCircle2,
  Lock,
  Clock,
  Download,
  Bookmark,
  Share2,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  useCourse, 
  useCourseModules, 
  useEnrollInCourse,
  useUpdateCourseEnrollment,
  useCompleteModule
} from '@/hooks/useCourses';
import type { CourseEnrollment } from '@/types';

interface CoursePlayerProps {
  courseId: string;
  enrollmentId?: string;
}

export default function CoursePlayer({ courseId, enrollmentId }: CoursePlayerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);

  // Queries
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseId);
  const { data: modules, isLoading: modulesLoading } = useCourseModules(courseId);

  // Mutations
  const enrollMutation = useEnrollInCourse();
  const updateEnrollmentMutation = useUpdateCourseEnrollment();
  const completeModuleMutation = useCompleteModule();

  const currentModule = modules?.[currentModuleIndex];
  const progress = modules ? ((currentModuleIndex + 1) / modules.length) * 100 : 0;

  // Auto-enroll if not enrolled
  useEffect(() => {
    if (course && user && !isEnrolled && !enrollmentId) {
      handleEnroll();
    }
  }, [course, user, isEnrolled, enrollmentId]);

  const handleEnroll = useCallback(async () => {
    if (!user || !course) return;

    try {
      const newEnrollment = await enrollMutation.mutateAsync({
        courseId: course.id,
        userId: user.id,
      });
      setEnrollment(newEnrollment);
      setIsEnrolled(true);
      toast.success('Successfully enrolled in course');
    } catch (error) {
      toast.error('Failed to enroll in course');
      console.error('Error enrolling:', error);
    }
  }, [user, course, enrollMutation]);

  const handleModuleComplete = useCallback(async (moduleId: string, score?: number) => {
    if (!enrollment) return;

    try {
      await completeModuleMutation.mutateAsync({
        enrollmentId: enrollment.id,
        moduleId,
        score,
        timeSpent: duration - currentTime,
      });

      setCompletedModules(prev => new Set([...prev, moduleId]));
      
      // Update enrollment progress
      const newProgress = Math.round(((completedModules.size + 1) / (modules?.length || 1)) * 100);
      await updateEnrollmentMutation.mutateAsync({
        id: enrollment.id,
        updates: {
          progressPercentage: newProgress,
          lastAccessedAt: new Date().toISOString(),
        },
      });

      toast.success('Module completed!');
    } catch (error) {
      toast.error('Failed to mark module as complete');
      console.error('Error completing module:', error);
    }
  }, [enrollment, completeModuleMutation, updateEnrollmentMutation, modules, completedModules, duration, currentTime]);

  const handleNextModule = useCallback(() => {
    if (modules && currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [modules, currentModuleIndex]);

  const handlePreviousModule = useCallback(() => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(prev => prev - 1);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [currentModuleIndex]);

  const handleModuleSelect = useCallback((index: number) => {
    setCurrentModuleIndex(index);
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // const handleSeek = useCallback((time: number) => {
  //   setCurrentTime(time);
  // }, []);

  const handleVolumeToggle = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isModuleCompleted = (moduleId: string) => completedModules.has(moduleId);
  const isModuleLocked = (index: number) => {
    if (index === 0) return false;
    const previousModule = modules?.[index - 1];
    return previousModule?.unlockAfterPrevious && !isModuleCompleted(previousModule.id);
  };

  // Loading state
  if (courseLoading || modulesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-secondary-text">Loading course...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (courseError || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">
            <BookOpen className="h-full w-full" />
          </div>
          <h3 className="text-lg font-semibold text-primary-text mb-2">Course Not Found</h3>
          <p className="text-secondary-text mb-4">The course you're looking for doesn't exist or is not accessible.</p>
          <Button onClick={() => navigate('/courses')} variant="outline">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

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
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-primary-text">{course.title}</h1>
                <p className="text-sm text-secondary-text">
                  {course.difficultyLevel} • {modules?.length || 0} modules
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {showSidebar ? 'Hide' : 'Show'} Modules
              </Button>
              
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmark
              </Button>
              
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border-r border-gray-200 overflow-hidden"
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold text-primary-text">Course Modules</h3>
                <div className="mt-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-secondary-text mt-1">
                    {currentModuleIndex + 1} of {modules?.length || 0} modules
                  </p>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                {modules?.map((module, index) => (
                  <div
                    key={module.id}
                    className={`
                      p-4 border-b border-gray-100 cursor-pointer transition-colors
                      ${index === currentModuleIndex 
                        ? 'bg-accent-blue/10 border-accent-blue/20' 
                        : 'hover:bg-gray-50'
                      }
                      ${isModuleLocked(index) ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => !isModuleLocked(index) && handleModuleSelect(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {isModuleCompleted(module.id) ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : isModuleLocked(index) ? (
                          <Lock className="h-5 w-5 text-gray-400" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-primary-text text-sm mb-1">
                          {module.title}
                        </h4>
                        <p className="text-xs text-secondary-text mb-2 line-clamp-2">
                          {module.description}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-secondary-text">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor((module.estimatedDuration || 0) / 60)}m
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {module.type}
                          </Badge>
                          {module.isRequired && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Video Player Area */}
          <div className="bg-black aspect-video relative">
            {currentModule ? (
              <div className="w-full h-full flex items-center justify-center">
                {currentModule.type === 'reel' ? (
                  <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Video Player</p>
                      <p className="text-sm opacity-75">
                        {currentModule.title} - {formatTime(duration)}
                      </p>
                    </div>
                  </div>
                ) : currentModule.type === 'text' ? (
                  <div className="w-full h-full bg-white p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-2xl font-bold text-primary-text mb-4">
                        {currentModule.title}
                      </h2>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-secondary-text">
                          {currentModule.contentData?.text || 'No content available.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : currentModule.type === 'quiz' ? (
                  <div className="w-full h-full bg-white p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                      <h2 className="text-2xl font-bold text-primary-text mb-4">
                        Quiz: {currentModule.title}
                      </h2>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <p className="text-lg text-primary-text mb-6">
                          Quiz content would be displayed here
                        </p>
                        <Button className="bg-accent-blue hover:bg-accent-blue/90">
                          Start Quiz
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No modules available</p>
                </div>
              </div>
            )}

            {/* Video Controls Overlay */}
            {currentModule?.type === 'reel' && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <div className="flex-1">
                    <div className="w-full bg-white/30 rounded-full h-1">
                      <div 
                        className="bg-white h-1 rounded-full transition-all"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <span className="text-white text-sm font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVolumeToggle}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Module Navigation */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousModule}
                  disabled={currentModuleIndex === 0}
                >
                  <SkipBack className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextModule}
                  disabled={!modules || currentModuleIndex === modules.length - 1}
                >
                  Next
                  <SkipForward className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {currentModule && !isModuleCompleted(currentModule.id) && (
                  <Button
                    onClick={() => handleModuleComplete(currentModule.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
                
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          {/* Module Details */}
          {currentModule && (
            <div className="bg-white border-t border-gray-200 p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-primary-text mb-2">
                  {currentModule.title}
                </h2>
                <p className="text-secondary-text mb-4">
                  {currentModule.description}
                </p>
                
                <div className="flex items-center gap-6 text-sm text-secondary-text">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.floor((currentModule.estimatedDuration || 0) / 60)} minutes
                  </div>
                  <Badge variant="secondary">
                    {currentModule.type}
                  </Badge>
                  {currentModule.isRequired && (
                    <Badge variant="outline" className="text-orange-600">
                      Required
                    </Badge>
                  )}
                  {isModuleCompleted(currentModule.id) && (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}