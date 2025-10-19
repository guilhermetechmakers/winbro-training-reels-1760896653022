import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy, 
  RotateCcw, 
  ArrowRight,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizResultsProps } from '@/types/quiz';

export function QuizResults({
  result,
  onRetake,
  onContinue,
  onExit
}: QuizResultsProps) {
  const isPassed = result.passed;
  const percentage = Math.round(result.score);
  const timeSpentMinutes = Math.floor(result.timeSpent / 60);
  const timeSpentSeconds = result.timeSpent % 60;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    if (score >= 70) return 'outline';
    return 'destructive';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Results Header */}
      <Card className="p-8 text-center">
        <div className="space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            {isPassed ? (
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>

          {/* Score */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {isPassed ? 'Congratulations!' : 'Quiz Complete'}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className={cn("text-4xl font-bold", getScoreColor(percentage))}>
                {percentage}%
              </span>
              <Badge variant={getScoreBadgeVariant(percentage)} className="text-lg px-3 py-1">
                {isPassed ? 'PASSED' : 'FAILED'}
              </Badge>
            </div>
            <p className="text-gray-600">
              {isPassed 
                ? `You scored ${result.correctAnswers} out of ${result.totalQuestions} questions correctly.`
                : `You need ${result.passThreshold}% to pass. You scored ${percentage}%.`
              }
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Your Score</span>
              <span>{percentage}%</span>
            </div>
            <Progress 
              value={percentage} 
              className={cn(
                "h-3",
                isPassed ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"
              )}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>Pass: {result.passThreshold}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quiz Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4" />
              <span>Correct Answers</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {result.correctAnswers}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <XCircle className="h-4 w-4" />
              <span>Incorrect Answers</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {result.totalQuestions - result.correctAnswers}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Time Spent</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {timeSpentMinutes}m {timeSpentSeconds}s
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Trophy className="h-4 w-4" />
              <span>Total Points</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {result.totalQuestions}
            </div>
          </div>
        </div>
      </Card>

      {/* Answer Review */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Answer Review</h3>
        <div className="space-y-3">
          {result.answers.map((answer, index) => {
            const isCorrect = answer.isCorrect;
            return (
              <div
                key={answer.questionId}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                )}
              >
                <div className="flex-shrink-0">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    Question {index + 1}
                  </div>
                  <div className="text-sm text-gray-600">
                    Your answer: {Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round(answer.timeSpent)}s
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Feedback */}
      {result.feedback && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h3>
          <p className="text-gray-700">{result.feedback}</p>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!isPassed && onRetake && (
          <Button
            onClick={onRetake}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
        )}
        
        {onContinue && (
          <Button
            onClick={onContinue}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Continue
          </Button>
        )}
        
        {onExit && (
          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1"
          >
            Exit Quiz
          </Button>
        )}
      </div>

      {/* Certificate Download (if passed) */}
      {isPassed && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="text-center space-y-3">
            <Trophy className="h-8 w-8 text-green-600 mx-auto" />
            <h3 className="text-lg font-semibold text-green-900">
              Certificate Available
            </h3>
            <p className="text-green-700 text-sm">
              You've successfully completed this quiz! Download your certificate.
            </p>
            <Button
              onClick={() => {/* TODO: Implement certificate download */}}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}