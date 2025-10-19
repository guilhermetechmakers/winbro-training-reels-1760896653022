import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  ArrowLeft, 
  ArrowRight,
  Trophy,
  Lock,
  PlayCircle,
  Pause,
  Volume2,
  Settings,
  Maximize,
  Download,
  Share2,
  Bookmark,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Award,
  Target,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import MainLayout from '@/components/layout/MainLayout';
import { QuizCard } from '@/components/quiz/QuizCard';
import { useCourse } from '@/hooks/useCourses';
import { useCourseQuizzes } from '@/hooks/useQuiz';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function CoursePlayer() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [isModuleCompleted, setIsModuleCompleted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [notes, setNotes] = useState<string>('');
  const [showNotes, setShowNotes] = useState(false);

  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseId || '');
  const { data: quizzes, isLoading: quizzesLoading } = useCourseQuizzes(courseId || '');

  const currentModule = course?.modules?.[currentModuleIndex];
  const progress = course?.modules ? ((currentModuleIndex + 1) / course.modules.length) * 100 : 0;
  const totalDuration = course?.modules?.reduce((acc, module) => acc + (module.estimatedDuration || 0), 0) || 0;

  useEffect(() => {
    if (course?.modules) {
      // Reset completion state when course changes
      setIsModuleCompleted(false);
      setVideoProgress(0);
    }
  }, [course]);

  useEffect(() => {
    // Check if user is enrolled
    if (course && user) {
      // This would typically come from an API call
      // For now, assume enrolled
    }
  }, [course, user]);

  const handleModuleComplete = async (moduleId: string) => {
    try {
      // Mark module as completed
      setCompletedModules(prev => new Set([...prev, moduleId]));
      setIsModuleCompleted(true);
      
      // Update enrollment progress
      // const newProgress = Math.round(((completedModules.size + 1) / (course?.modules?.length || 1)) * 100);
      
      // This would typically call the API to update progress
      toast.success('Module completed!');
      
      // Auto-advance to next module after a short delay
      setTimeout(() => {
        if (currentModuleIndex < (course?.modules?.length || 0) - 1) {
          handleNextModule();
        }
      }, 1500);
    } catch (error) {
      toast.error('Failed to complete module');
      console.error('Error completing module:', error);
    }
  };

  // const handleEnroll = async () => {
  //   if (!course || !user) return;
  //   
  //   try {
  //     await enrollMutation.mutateAsync({
  //       courseId: course.id,
  //       userId: user.id
  //     });
  //     setIsEnrolled(true);
  //     toast.success('Successfully enrolled in course!');
  //   } catch (error) {
  //     toast.error('Failed to enroll in course');
  //     console.error('Error enrolling:', error);
  //   }
  // };


  const handleNextModule = () => {
    if (currentModuleIndex < (course?.modules?.length || 0) - 1) {
      setCurrentModuleIndex(prev => prev + 1);
      setIsModuleCompleted(false);
    } else {
      // Course completed
      toast.success('Congratulations! You have completed this course.');
      navigate(`/courses/${courseId}/results`);
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(prev => prev - 1);
      setIsModuleCompleted(false);
    }
  };

  const handleStartQuiz = (quizId: string) => {
    navigate(`/courses/${courseId}/quiz/${quizId}`);
  };

  const handleViewResults = (quizId: string) => {
    navigate(`/courses/${courseId}/quiz/${quizId}/results`);
  };

  const isModuleUnlocked = (index: number) => {
    if (index === 0) return true;
    return completedModules.has(course?.modules?.[index - 1]?.id || '');
  };

  if (courseLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto"></div>
            <p className="text-secondary-text text-lg">Loading course...</p>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  if (courseError || !course) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="h-12 w-12 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-primary-text mb-2">Course Not Found</h2>
              <p className="text-secondary-text">The requested course could not be found or you don't have access to it.</p>
            </div>
            <Button onClick={() => navigate('/dashboard')} className="btn-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-main-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="sm"
                className="hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-primary-text mb-2">{course.title}</h1>
                <p className="text-secondary-text text-lg">{course.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="card">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-accent-blue mr-2" />
                    <span className="text-sm font-medium text-secondary-text">Duration</span>
                  </div>
                  <p className="text-lg font-semibold text-primary-text">
                    {Math.floor(totalDuration / 60)}m
                  </p>
                </CardContent>
              </Card>
              <Card className="card">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BookOpen className="h-5 w-5 text-accent-blue mr-2" />
                    <span className="text-sm font-medium text-secondary-text">Modules</span>
                  </div>
                  <p className="text-lg font-semibold text-primary-text">
                    {course.modules?.length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="card">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-5 w-5 text-accent-blue mr-2" />
                    <span className="text-sm font-medium text-secondary-text">Progress</span>
                  </div>
                  <p className="text-lg font-semibold text-primary-text">
                    {Math.round(progress)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="card">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="h-5 w-5 text-accent-blue mr-2" />
                    <span className="text-sm font-medium text-secondary-text">Difficulty</span>
                  </div>
                  <p className="text-lg font-semibold text-primary-text capitalize">
                    {course.difficultyLevel}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <Card className="card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary-text">Course Progress</span>
                    <span className="text-sm text-secondary-text">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-secondary-text">
                    <span>Module {currentModuleIndex + 1} of {course.modules?.length || 0}</span>
                    <span>{completedModules.size} completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Course Sidebar */}
            <div className={`lg:col-span-1 ${!showSidebar ? 'hidden lg:block' : ''}`}>
              <Card className="card sticky top-8">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-accent-blue" />
                      Course Modules
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSidebar(!showSidebar)}
                      className="lg:hidden"
                    >
                      {showSidebar ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {course.modules?.map((module, index) => {
                    const isCompleted = completedModules.has(module.id);
                    const isCurrent = index === currentModuleIndex;
                    const isUnlocked = isModuleUnlocked(index);

                    return (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                          p-4 rounded-lg border cursor-pointer transition-all duration-200
                          ${isCurrent ? 'bg-accent-blue/10 border-accent-blue shadow-md' : ''}
                          ${isCompleted ? 'bg-status-green/10 border-status-green' : ''}
                          ${!isUnlocked ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' : ''}
                          ${isUnlocked && !isCurrent && !isCompleted ? 'hover:bg-gray-50 hover:shadow-sm' : ''}
                        `}
                        onClick={() => isUnlocked && setCurrentModuleIndex(index)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-status-green" />
                            ) : !isUnlocked ? (
                              <Lock className="h-5 w-5 text-icon-gray" />
                            ) : isCurrent ? (
                              <PlayCircle className="h-5 w-5 text-accent-blue" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-icon-gray" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-primary-text truncate">
                              {module.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-secondary-text mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  module.type === 'reel' ? 'border-blue-200 text-blue-700' :
                                  module.type === 'quiz' ? 'border-purple-200 text-purple-700' :
                                  'border-gray-200 text-gray-700'
                                }`}
                              >
                                {module.type.toUpperCase()}
                              </Badge>
                              {module.estimatedDuration > 0 && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {Math.floor(module.estimatedDuration / 60)}m
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {currentModule ? (
                <motion.div
                  key={currentModule.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Module Header */}
                  <Card className="card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl text-primary-text mb-2">
                            {currentModule.title}
                          </CardTitle>
                          <CardDescription className="text-lg text-secondary-text">
                            {currentModule.description || 'No description provided'}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline" 
                            className={`px-3 py-1 ${
                              currentModule.type === 'reel' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                              currentModule.type === 'quiz' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                              'border-gray-200 text-gray-700 bg-gray-50'
                            }`}
                          >
                            {currentModule.type.toUpperCase()}
                          </Badge>
                          {currentModule.estimatedDuration > 0 && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                              <Clock className="h-4 w-4" />
                              {Math.floor(currentModule.estimatedDuration / 60)}m
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Module Content */}
                  {currentModule.type === 'reel' && (
                    <Card className="card">
                      <CardContent className="p-0">
                        <div className="relative">
                          {/* Video Player Placeholder */}
                          <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="text-center z-10">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors"
                                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                              >
                                {isVideoPlaying ? (
                                  <Pause className="h-8 w-8 text-white" />
                                ) : (
                                  <Play className="h-8 w-8 text-white ml-1" />
                                )}
                              </motion.div>
                              <h3 className="text-white text-lg font-semibold mb-2">Video Player</h3>
                              <p className="text-white/80 text-sm">Click to play video content</p>
                            </div>
                            
                            {/* Video Progress Bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                              <motion.div
                                className="h-full bg-accent-blue"
                                style={{ width: `${videoProgress}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${videoProgress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                          </div>
                          
                          {/* Video Controls */}
                          <div className="p-4 bg-white border-t">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                                >
                                  {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Volume2 className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Maximize className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="text-sm text-secondary-text">
                                {Math.floor((videoProgress * (currentModule.estimatedDuration || 0)) / 100 / 60)}:
                                {String(Math.floor(((videoProgress * (currentModule.estimatedDuration || 0)) / 100) % 60)).padStart(2, '0')} / 
                                {Math.floor((currentModule.estimatedDuration || 0) / 60)}:
                                {String((currentModule.estimatedDuration || 0) % 60).padStart(2, '0')}
                              </div>
                            </div>
                            
                            {/* Completion Button */}
                            <Button
                              onClick={() => handleModuleComplete(currentModule.id)}
                              className="w-full"
                              disabled={isModuleCompleted}
                              size="lg"
                            >
                              {isModuleCompleted ? (
                                <>
                                  <CheckCircle className="h-5 w-5 mr-2" />
                                  Module Completed
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-5 w-5 mr-2" />
                                  Mark as Complete
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {currentModule.type === 'text' && (
                    <Card className="card">
                      <CardContent className="p-8">
                        <div className="prose max-w-none prose-lg">
                          <div className="text-primary-text leading-relaxed">
                            {currentModule.contentData?.text || 'Text content will be displayed here. This could include instructions, explanations, or supplementary material for the course.'}
                          </div>
                        </div>
                        
                        {/* Notes Section */}
                        <div className="mt-8 border-t pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-primary-text flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-accent-blue" />
                              Notes
                            </h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowNotes(!showNotes)}
                            >
                              {showNotes ? 'Hide' : 'Show'} Notes
                            </Button>
                          </div>
                          
                          {showNotes && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-4"
                            >
                              <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add your notes here..."
                                className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                              />
                              <div className="flex justify-end">
                                <Button size="sm" variant="outline">
                                  Save Notes
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                        
                        <div className="mt-8">
                          <Button
                            onClick={() => handleModuleComplete(currentModule.id)}
                            className="w-full"
                            disabled={isModuleCompleted}
                            size="lg"
                          >
                            {isModuleCompleted ? (
                              <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Module Completed
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Mark as Complete
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {currentModule.type === 'quiz' && (
                    <div className="space-y-6">
                      {/* Quiz Header */}
                      <Card className="card">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <HelpCircle className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-primary-text">Quiz Section</h3>
                              <p className="text-secondary-text">Test your knowledge with these questions</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-primary-text">{quizzes?.length || 0}</div>
                              <div className="text-sm text-secondary-text">Questions</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-primary-text">
                                {quizzes?.reduce((acc, q) => acc + (q.points || 1), 0) || 0}
                              </div>
                              <div className="text-sm text-secondary-text">Total Points</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-primary-text">
                                {Math.floor((quizzes?.reduce((acc, q) => acc + (q.timeLimit || 0), 0) || 0) / 60)}m
                              </div>
                              <div className="text-sm text-secondary-text">Time Limit</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-2xl font-bold text-primary-text">
                                {course.passThreshold || 80}%
                              </div>
                              <div className="text-sm text-secondary-text">Pass Rate</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Quiz Cards */}
                      {quizzesLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto mb-4"></div>
                          <p className="text-secondary-text">Loading quizzes...</p>
                        </div>
                      ) : (
                        <div className="grid gap-6">
                          {quizzes?.map((quiz, index) => (
                            <motion.div
                              key={quiz.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <QuizCard
                                quiz={quiz}
                                onStart={() => handleStartQuiz(quiz.id)}
                                onViewResults={() => handleViewResults(quiz.id)}
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation */}
                  <Card className="card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <Button
                          onClick={handlePreviousModule}
                          disabled={currentModuleIndex === 0}
                          variant="outline"
                          size="lg"
                          className="hover:bg-gray-50"
                        >
                          <ArrowLeft className="h-5 w-5 mr-2" />
                          Previous Module
                        </Button>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm text-secondary-text">Progress</div>
                            <div className="text-lg font-semibold text-primary-text">
                              {currentModuleIndex + 1} / {course.modules?.length || 0}
                            </div>
                          </div>
                          <div className="w-32">
                            <Progress value={progress} className="h-2" />
                          </div>
                        </div>

                        <Button
                          onClick={handleNextModule}
                          disabled={currentModuleIndex === (course.modules?.length || 0) - 1}
                          className="btn-primary"
                          size="lg"
                        >
                          {currentModuleIndex === (course.modules?.length || 0) - 1 ? (
                            <>
                              <Trophy className="h-5 w-5 mr-2" />
                              Complete Course
                            </>
                          ) : (
                            <>
                              Next Module
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="card">
                    <CardContent className="p-12 text-center">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="h-12 w-12 text-icon-gray" />
                      </div>
                      <h3 className="text-2xl font-semibold text-primary-text mb-3">No Modules Available</h3>
                      <p className="text-secondary-text text-lg mb-6 max-w-md mx-auto">
                        This course doesn't have any modules yet. The instructor may still be working on adding content.
                      </p>
                      <Button
                        onClick={() => navigate('/dashboard')}
                        variant="outline"
                        size="lg"
                      >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}