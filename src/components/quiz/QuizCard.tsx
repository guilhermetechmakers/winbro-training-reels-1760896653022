import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CourseQuiz, QuizAttempt } from '@/types/quiz';

interface QuizCardProps {
  quiz: CourseQuiz;
  attempt?: QuizAttempt;
  onStart?: () => void;
  onRetake?: () => void;
  onViewResults?: () => void;
  className?: string;
}

export function QuizCard({
  quiz,
  attempt,
  onStart,
  onRetake,
  onViewResults,
  className
}: QuizCardProps) {
  const isCompleted = attempt?.status === 'completed';
  const isPassed = attempt && attempt.score >= 80; // Assuming 80% pass threshold
  const hasAttempt = !!attempt;

  return (
    <Card className={cn(
      "p-6 transition-all duration-200 hover:shadow-lg",
      "border border-gray-200 bg-white",
      className
    )}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {quiz.question}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {quiz.type.replace('-', ' ').toUpperCase()}
              </Badge>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {quiz.points} point{quiz.points !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {isCompleted && (
            <div className="flex items-center gap-1">
              {isPassed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-red-500" />
              )}
            </div>
          )}
        </div>

        {/* Quiz Details */}
        <div className="space-y-2 text-sm text-gray-600">
          {quiz.timeLimit && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Time limit: {Math.floor(quiz.timeLimit / 60)}m {quiz.timeLimit % 60}s</span>
            </div>
          )}
          
          {quiz.explanation && (
            <p className="text-gray-700 line-clamp-2">
              {quiz.explanation}
            </p>
          )}
        </div>

        {/* Attempt Status */}
        {hasAttempt && (
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {isCompleted ? 'Last attempt' : 'In progress'}
              </span>
              <span className={cn(
                "font-medium",
                isPassed ? "text-green-600" : "text-red-600"
              )}>
                {attempt.score}%
              </span>
            </div>
            {isCompleted && attempt.completedAt && (
              <div className="mt-2 text-xs text-gray-500">
                Completed {new Date(attempt.completedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!hasAttempt || !isCompleted ? (
            <Button
              onClick={onStart}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              {hasAttempt ? 'Continue' : 'Start Quiz'}
            </Button>
          ) : (
            <>
              <Button
                onClick={onRetake}
                variant="outline"
                className="flex-1"
              >
                Retake
              </Button>
              <Button
                onClick={onViewResults}
                variant="outline"
                className="flex-1"
              >
                View Results
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}