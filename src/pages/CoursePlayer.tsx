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
  Lock
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { QuizCard } from '@/components/quiz/QuizCard';
import { useCourse } from '@/hooks/useCourses';
import { useCourseQuizzes } from '@/hooks/useQuiz';
import { toast } from 'sonner';

export default function CoursePlayer() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [isModuleCompleted, setIsModuleCompleted] = useState(false);

  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseId || '');
  const { data: quizzes, isLoading: quizzesLoading } = useCourseQuizzes(courseId || '');

  const currentModule = course?.modules?.[currentModuleIndex];
  const progress = course?.modules ? ((currentModuleIndex + 1) / course.modules.length) * 100 : 0;

  useEffect(() => {
    if (course?.modules) {
      // Reset completion state when course changes
      setIsModuleCompleted(false);
    }
  }, [course]);

  const handleModuleComplete = (moduleId: string) => {
    setCompletedModules(prev => new Set([...prev, moduleId]));
    setIsModuleCompleted(true);
    toast.success('Module completed!');
  };


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
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (courseError || !course) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Course Not Found</h2>
            <p className="text-gray-600">The requested course could not be found.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600">{course.description}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Module {currentModuleIndex + 1} of {course.modules?.length || 0}</span>
                <span>{completedModules.size} completed</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Course Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Modules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {course.modules?.map((module, index) => {
                    const isCompleted = completedModules.has(module.id);
                    const isCurrent = index === currentModuleIndex;
                    const isUnlocked = isModuleUnlocked(index);

                    return (
                      <div
                        key={module.id}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-colors
                          ${isCurrent ? 'bg-blue-50 border-blue-200' : ''}
                          ${isCompleted ? 'bg-green-50 border-green-200' : ''}
                          ${!isUnlocked ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : ''}
                          ${isUnlocked && !isCurrent && !isCompleted ? 'hover:bg-gray-50' : ''}
                        `}
                        onClick={() => isUnlocked && setCurrentModuleIndex(index)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : !isUnlocked ? (
                              <Lock className="h-5 w-5 text-gray-400" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {module.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Badge variant="secondary" className="text-xs">
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
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {currentModule ? (
                <div className="space-y-6">
                  {/* Module Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">{currentModule.title}</CardTitle>
                          <CardDescription>{currentModule.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {currentModule.type.toUpperCase()}
                          </Badge>
                          {currentModule.estimatedDuration > 0 && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(currentModule.estimatedDuration / 60)}m
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Module Content */}
                  {currentModule.type === 'reel' && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center space-y-4">
                          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Play className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600">Video Player</p>
                              <p className="text-sm text-gray-500">Click to play video</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleModuleComplete(currentModule.id)}
                            className="w-full"
                            disabled={isModuleCompleted}
                          >
                            {isModuleCompleted ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Completed
                              </>
                            ) : (
                              'Mark as Complete'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {currentModule.type === 'text' && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="prose max-w-none">
                          <p className="text-gray-700">
                            {currentModule.contentData?.text || 'Text content will be displayed here.'}
                          </p>
                        </div>
                        <div className="mt-6">
                          <Button
                            onClick={() => handleModuleComplete(currentModule.id)}
                            className="w-full"
                            disabled={isModuleCompleted}
                          >
                            {isModuleCompleted ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Completed
                              </>
                            ) : (
                              'Mark as Complete'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {currentModule.type === 'quiz' && (
                    <div className="space-y-4">
                      {/* Quiz Cards */}
                      {quizzesLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-gray-600 mt-2">Loading quizzes...</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {quizzes?.map((quiz) => (
                            <QuizCard
                              key={quiz.id}
                              quiz={quiz}
                              onStart={() => handleStartQuiz(quiz.id)}
                              onViewResults={() => handleViewResults(quiz.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Button
                          onClick={handlePreviousModule}
                          disabled={currentModuleIndex === 0}
                          variant="outline"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Previous
                        </Button>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            Module {currentModuleIndex + 1} of {course.modules?.length || 0}
                          </span>
                        </div>

                        <Button
                          onClick={handleNextModule}
                          disabled={currentModuleIndex === (course.modules?.length || 0) - 1}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {currentModuleIndex === (course.modules?.length || 0) - 1 ? (
                            <>
                              <Trophy className="h-4 w-4 mr-2" />
                              Complete Course
                            </>
                          ) : (
                            <>
                              Next
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Modules Available</h3>
                    <p className="text-gray-600">This course doesn't have any modules yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}