import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  XCircle, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight,
  Trophy
} from 'lucide-react';
import type { 
  EnhancedQuizPlayerProps, 
  EnhancedQuizSession, 
  EnhancedQuizResult,
  Certificate
} from '@/types/quiz';

export function EnhancedQuizPlayer({
  quizId,
  courseId,
  moduleId,
  onComplete,
  onExit,
  configuration,
  onCertificateEarned,
  onAnalyticsEvent
}: EnhancedQuizPlayerProps) {
  const [session, setSession] = useState<EnhancedQuizSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<EnhancedQuizResult | null>(null);

  // Initialize quiz session
  useEffect(() => {
    if (configuration) {
      const newSession: EnhancedQuizSession = {
        quizId,
        courseId,
        moduleId,
        questions: [], // Would be loaded from API
        currentQuestionIndex: 0,
        answers: new Map(),
        isCompleted: false,
        isSubmitted: false,
        startedAt: new Date().toISOString(),
        configuration,
        timeRemaining: configuration.time_limit || undefined,
        currentAttempt: 1,
        maxAttempts: configuration.max_attempts,
        canRetake: configuration.allow_retake,
        showProgress: configuration.show_progress,
        showTimer: configuration.show_timer,
        immediateFeedback: configuration.immediate_feedback
      };
      setSession(newSession);
    }
  }, [quizId, courseId, moduleId, configuration]);

  // Timer effect
  useEffect(() => {
    if (!session?.showTimer || !timeRemaining) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.showTimer, timeRemaining]);

  // Log analytics event
  const logEvent = useCallback((eventType: string, eventData: any = {}) => {
    if (onAnalyticsEvent) {
      onAnalyticsEvent({
        id: 'event-' + Date.now(),
        user_id: 'current-user', // Would get from auth context
        course_id: courseId,
        module_id: moduleId,
        quiz_id: quizId,
        event_type: eventType as any,
        event_data: eventData,
        duration: 0,
        session_id: 'current-session', // Would get from session
        device_type: 'desktop', // Would detect from user agent
        browser_info: navigator.userAgent,
        created_at: new Date().toISOString()
      });
    }
  }, [courseId, moduleId, quizId, onAnalyticsEvent]);

  const handleAnswerSelect = (answer: string | string[]) => {
    setSelectedAnswer(answer);
    
    if (session?.immediateFeedback) {
      // Show immediate feedback
      logEvent('answer_selected', { answer, question_index: currentQuestionIndex });
    }
  };

  const handleNextQuestion = () => {
    if (!session) return;

    // Save current answer
    if (selectedAnswer) {
      const newAnswers = new Map(session.answers);
      newAnswers.set(session.questions[currentQuestionIndex].id, {
        questionId: session.questions[currentQuestionIndex].id,
        answer: selectedAnswer,
        isCorrect: false, // Will be calculated on submit
        timeSpent: 0, // Will be calculated
        submittedAt: new Date().toISOString()
      });
      
      setSession(prev => prev ? { ...prev, answers: newAnswers } : null);
    }

    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Load previous answer if exists
      const prevAnswer = session?.answers.get(session.questions[currentQuestionIndex - 1].id);
      setSelectedAnswer(prevAnswer?.answer || null);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!session) return;

    setIsSubmitting(true);
    logEvent('quiz_submitted', { 
      answers_count: session.answers.size,
      time_spent: timeRemaining ? (session.configuration.time_limit || 0) - timeRemaining : 0
    });

    try {
      // Calculate results
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;
      const answers = [];

      for (const question of session.questions) {
        const answer = session.answers.get(question.id);
        if (answer) {
          const isCorrect = checkAnswer(question, answer.answer);
          answers.push({
            ...answer,
            isCorrect
          });

          totalPoints += question.points;
          if (isCorrect) {
            correctAnswers++;
            earnedPoints += question.points;
          }
        }
      }

      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const passed = score >= session.configuration.pass_threshold;
      const timeSpent = timeRemaining ? (session.configuration.time_limit || 0) - timeRemaining : 0;

      const enhancedResult: EnhancedQuizResult = {
        quizId: session.quizId,
        courseId: session.courseId,
        moduleId: session.moduleId,
        score,
        totalQuestions: session.questions.length,
        correctAnswers,
        timeSpent,
        passed,
        passThreshold: session.configuration.pass_threshold,
        completedAt: new Date().toISOString(),
        answers,
        canRetake: session.canRetake && session.currentAttempt < session.maxAttempts,
        attemptsRemaining: Math.max(0, session.maxAttempts - session.currentAttempt),
        feedback: passed 
          ? 'Congratulations! You have successfully completed this quiz.'
          : `You need ${session.configuration.pass_threshold}% to pass. Consider reviewing the material and trying again.`
      };

      // Generate certificate if passed
      if (passed && onCertificateEarned) {
        const certificate: Certificate = {
          id: 'cert-' + Date.now(),
          user_id: 'current-user',
          course_id: courseId,
          enrollment_id: 'enrollment-' + Date.now(),
          certificate_number: 'CERT-' + Date.now(),
          title: 'Certificate of Completion',
          recipient_name: 'Current User',
          course_title: 'Sample Course',
          completion_date: new Date().toISOString(),
          score,
          template_id: 'default',
          issued_by: 'Winbro Training Reels',
          verification_code: 'VERIFY' + Math.random().toString(36).substr(2, 4).toUpperCase(),
          status: 'active',
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        onCertificateEarned(certificate);
      }

      setResult(enhancedResult);
      setShowResults(true);
      onComplete(enhancedResult);
      
      logEvent('quiz_completed', { 
        score, 
        passed, 
        time_spent: timeSpent,
        correct_answers: correctAnswers,
        total_questions: session.questions.length
      });

    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    if (session?.configuration.auto_submit) {
      handleSubmitQuiz();
    }
  };

  const handleRetake = () => {
    if (!session) return;
    
    setSession(prev => prev ? {
      ...prev,
      currentAttempt: prev.currentAttempt + 1,
      answers: new Map(),
      isCompleted: false,
      isSubmitted: false,
      startedAt: new Date().toISOString()
    } : null);
    
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setResult(null);
    setTimeRemaining(session.configuration.time_limit || null);
    
    logEvent('quiz_retake_started', { attempt: session.currentAttempt + 1 });
  };

  const checkAnswer = (question: any, userAnswer: string | string[]): boolean => {
    const correctAnswers = question.correctAnswer.split(',').map((a: string) => a.trim());
    
    if (Array.isArray(userAnswer)) {
      return userAnswer.length === correctAnswers.length &&
        userAnswer.every(answer => correctAnswers.includes(answer));
    }
    
    return correctAnswers.includes(userAnswer);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (showResults && result) {
    return (
      <Card className="p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          {result.passed ? (
            <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
              <Trophy className="h-12 w-12" />
              <h2 className="text-3xl font-bold">Congratulations!</h2>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
              <XCircle className="h-12 w-12" />
              <h2 className="text-3xl font-bold">Quiz Failed</h2>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-gray-900">
              Score: {result.score}%
            </p>
            <p className="text-gray-600">
              {result.correctAnswers} out of {result.totalQuestions} questions correct
            </p>
            <p className="text-sm text-gray-500">
              Time spent: {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
            </p>
          </div>
        </div>

        {result.feedback && (
          <Alert className="mb-6">
            <AlertDescription>{result.feedback}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-center gap-4">
          {result.canRetake && (
            <Button onClick={handleRetake} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz ({result.attemptsRemaining} attempts remaining)
            </Button>
          )}
          
          <Button onClick={onExit}>
            Continue
          </Button>
        </div>
      </Card>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quiz</h2>
            <p className="text-gray-600">Question {currentQuestionIndex + 1} of {session.questions.length}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {session.showProgress && (
              <div className="flex items-center gap-2">
                <Progress value={progress} className="w-32" />
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
            )}
            
            {session.showTimer && timeRemaining !== null && (
              <Badge variant={timeRemaining < 60 ? "destructive" : "secondary"}>
                <Clock className="h-4 w-4 mr-1" />
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </Badge>
            )}
          </div>
        </div>

        {session.configuration.require_all_questions && (
          <Alert>
            <AlertDescription>
              You must answer all questions to complete this quiz.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Question */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion?.question}
            </h3>
            
            {currentQuestion?.type === 'multiple-choice' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedAnswer === option ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={() => handleAnswerSelect(option)}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {currentQuestion?.type === 'true-false' && (
              <div className="space-y-3">
                {['True', 'False'].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedAnswer === option.toLowerCase() ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option.toLowerCase()}
                      checked={selectedAnswer === option.toLowerCase()}
                      onChange={() => handleAnswerSelect(option.toLowerCase())}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            )}
            
            {currentQuestion?.type === 'short-answer' && (
              <input
                type="text"
                value={selectedAnswer as string || ''}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                placeholder="Enter your answer..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {session.configuration.allow_skip_questions && (
              <Button
                onClick={handleNextQuestion}
                variant="outline"
                disabled={!selectedAnswer && session.configuration.require_all_questions}
              >
                Skip
              </Button>
            )}
            
            <Button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer && session.configuration.require_all_questions}
            >
              {currentQuestionIndex === session.questions.length - 1 ? 'Submit Quiz' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
