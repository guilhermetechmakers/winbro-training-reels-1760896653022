import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import type { 
  QuizPlayerProps, 
  QuizSession, 
  QuizResult, 
  QuizAnswer,
  CourseQuiz 
} from '@/types/quiz';

export function QuizPlayer({
  quizId,
  courseId,
  moduleId,
  onComplete,
  onExit,
  config = {}
}: QuizPlayerProps) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>();

  // Default config
  const quizConfig = {
    allowRetake: true,
    maxAttempts: 3,
    showCorrectAnswers: true,
    showExplanations: true,
    randomizeQuestions: false,
    randomizeAnswers: false,
    timeLimit: undefined,
    passThreshold: 80,
    ...config
  };

  // Initialize quiz session
  const initializeQuiz = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Fetch quiz questions from API
      // For now, using mock data
      const mockQuestions: CourseQuiz[] = [
        {
          id: '1',
          courseId,
          moduleId,
          question: 'What is the primary purpose of Winbro Training Reels?',
          type: 'multiple-choice',
          options: [
            'To replace traditional paper manuals',
            'To create entertainment content',
            'To manage customer relationships',
            'To track employee attendance'
          ],
          correctAnswer: 'To replace traditional paper manuals',
          explanation: 'Winbro Training Reels is designed to transform how process knowledge and machine operation information is shared and retained.',
          points: 1,
          timeLimit: 30,
          orderIndex: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          courseId,
          moduleId,
          question: 'True or False: Video reels should be 20-30 seconds long.',
          type: 'true-false',
          options: [],
          correctAnswer: 'true',
          explanation: 'The platform is specifically designed for ultra-short 20-30 second instructional videos.',
          points: 1,
          timeLimit: 15,
          orderIndex: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const newSession: QuizSession = {
        quizId,
        courseId,
        moduleId,
        questions: mockQuestions,
        currentQuestionIndex: 0,
        answers: new Map(),
        timeRemaining: quizConfig.timeLimit,
        isCompleted: false,
        isSubmitted: false,
        startedAt: new Date().toISOString()
      };

      setSession(newSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize quiz');
    } finally {
      setIsLoading(false);
    }
  }, [quizId, courseId, moduleId, quizConfig.timeLimit]);

  // Timer effect
  useEffect(() => {
    if (!session || !timeRemaining || session.isCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === undefined || prev <= 1) {
          // Time's up - auto-submit
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, timeRemaining]);

  // Handle answer submission
  const handleAnswer = useCallback((answer: QuizAnswer) => {
    if (!session) return;

    const newAnswers = new Map(session.answers);
    newAnswers.set(answer.questionId, answer);

    setSession(prev => prev ? {
      ...prev,
      answers: newAnswers
    } : null);
  }, [session]);

  // Navigate to next question
  const handleNext = useCallback(() => {
    if (!session) return;

    const nextIndex = session.currentQuestionIndex + 1;
    if (nextIndex < session.questions.length) {
      setSession(prev => prev ? {
        ...prev,
        currentQuestionIndex: nextIndex
      } : null);
    } else {
      handleSubmitQuiz();
    }
  }, [session]);

  // Navigate to previous question
  const handlePrevious = useCallback(() => {
    if (!session) return;

    const prevIndex = session.currentQuestionIndex - 1;
    if (prevIndex >= 0) {
      setSession(prev => prev ? {
        ...prev,
        currentQuestionIndex: prevIndex
      } : null);
    }
  }, [session]);

  // Submit quiz
  const handleSubmitQuiz = useCallback(async () => {
    if (!session) return;

    try {
      // Calculate results
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;
      const answers: QuizAnswer[] = [];

      session.questions.forEach(question => {
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
      });

      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const passed = score >= quizConfig.passThreshold;
      const timeSpent = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);

      const result: QuizResult = {
        quizId: session.quizId,
        courseId: session.courseId,
        moduleId: session.moduleId,
        score,
        totalQuestions: session.questions.length,
        correctAnswers,
        timeSpent,
        passed,
        passThreshold: quizConfig.passThreshold,
        completedAt: new Date().toISOString(),
        answers,
        feedback: passed 
          ? 'Great job! You have successfully completed this quiz.'
          : `You need ${quizConfig.passThreshold}% to pass. Consider reviewing the material and trying again.`
      };

      setSession(prev => prev ? {
        ...prev,
        isCompleted: true,
        isSubmitted: true,
        completedAt: new Date().toISOString()
      } : null);

      onComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    }
  }, [session, quizConfig.passThreshold, onComplete]);

  // Check if answer is correct
  const checkAnswer = (question: CourseQuiz, userAnswer: string | string[]): boolean => {
    const correctAnswers = question.correctAnswer.split(',').map(a => a.trim());
    
    if (Array.isArray(userAnswer)) {
      return userAnswer.length === correctAnswers.length &&
        userAnswer.every(answer => correctAnswers.includes(answer));
    }
    
    return correctAnswers.includes(userAnswer);
  };

  // Retake quiz
  const handleRetake = useCallback(() => {
    initializeQuiz();
  }, [initializeQuiz]);

  // Initialize on mount
  useEffect(() => {
    initializeQuiz();
  }, [initializeQuiz]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="text-red-600 text-lg font-semibold">Error</div>
          <p className="text-gray-600">{error}</p>
          <Button onClick={initializeQuiz} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="text-gray-600">Quiz not found</div>
          <Button onClick={onExit} variant="outline">
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  // Show results if completed
  if (session.isCompleted) {
    const result: QuizResult = {
      quizId: session.quizId,
      courseId: session.courseId,
      moduleId: session.moduleId,
      score: 0, // Will be calculated
      totalQuestions: session.questions.length,
      correctAnswers: 0, // Will be calculated
      timeSpent: 0, // Will be calculated
      passed: false, // Will be calculated
      passThreshold: quizConfig.passThreshold,
      completedAt: session.completedAt || new Date().toISOString(),
      answers: Array.from(session.answers.values())
    };

    return (
      <QuizResults
        result={result}
        onRetake={quizConfig.allowRetake ? handleRetake : undefined}
        onContinue={() => onComplete(result)}
        onExit={onExit}
      />
    );
  }

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const currentAnswer = session.answers.get(currentQuestion.id);
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1;
  const isFirstQuestion = session.currentQuestionIndex === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onExit}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>
            <div className="text-sm text-gray-600">
              Quiz: {quizId}
            </div>
          </div>
          
          {timeRemaining !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Question */}
      <QuizQuestion
        question={currentQuestion}
        questionNumber={session.currentQuestionIndex + 1}
        totalQuestions={session.questions.length}
        answer={currentAnswer}
        onAnswer={handleAnswer}
        timeRemaining={timeRemaining}
        isSubmitted={false}
      />

      {/* Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {session.answers.size} of {session.questions.length} answered
            </span>
          </div>

          <Button
            onClick={isLastQuestion ? handleSubmitQuiz : handleNext}
            className={cn(
              isLastQuestion 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {isLastQuestion ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Quiz
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}