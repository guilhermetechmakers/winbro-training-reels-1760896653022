import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizQuestionProps, QuizAnswer } from '@/types/quiz';

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswer,
  timeRemaining,
  isSubmitted
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>(
    answer?.answer || (question.type === 'multiple-choice' ? [] : '')
  );
  const [showFeedback, setShowFeedback] = useState(isSubmitted);

  useEffect(() => {
    setSelectedAnswer(answer?.answer || (question.type === 'multiple-choice' ? [] : ''));
    setShowFeedback(isSubmitted);
  }, [answer, isSubmitted]);

  const handleAnswerChange = (value: string | string[]) => {
    setSelectedAnswer(value);
    const newAnswer: QuizAnswer = {
      questionId: question.id,
      answer: value,
      isCorrect: false, // Will be calculated on submit
      timeSpent: 0, // Will be calculated on submit
      submittedAt: new Date().toISOString()
    };
    onAnswer(newAnswer);
  };

  const handleMultipleChoiceChange = (option: string, checked: boolean) => {
    const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [];
    const newAnswers = checked
      ? [...currentAnswers, option]
      : currentAnswers.filter(a => a !== option);
    handleAnswerChange(newAnswers);
  };


  const handleTrueFalseChange = (value: boolean) => {
    handleAnswerChange(value.toString());
  };

  const handleShortAnswerChange = (value: string) => {
    handleAnswerChange(value);
  };

  const isCorrect = (userAnswer: string | string[]) => {
    const correctAnswers = question.correctAnswer.split(',').map((a: string) => a.trim());
    if (Array.isArray(userAnswer)) {
      return userAnswer.length === correctAnswers.length &&
        userAnswer.every((answer: string) => correctAnswers.includes(answer));
    }
    return correctAnswers.includes(userAnswer);
  };

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Question {questionNumber} of {totalQuestions}</span>
          {timeRemaining !== undefined && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Question */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              {question.question}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {question.type.replace('-', ' ').toUpperCase()}
              </span>
              <span>{question.points} point{question.points !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {question.type === 'multiple-choice' && (
              <div className="space-y-3">
                {question.options.map((option: string, index: number) => {
                  const isSelected = Array.isArray(selectedAnswer) && selectedAnswer.includes(option);
                  const isCorrectAnswer = question.correctAnswer.split(',').map((a: string) => a.trim()).includes(option);
                  
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
                        showFeedback && isCorrectAnswer && "bg-green-50 border-green-200",
                        showFeedback && isSelected && !isCorrectAnswer && "bg-red-50 border-red-200",
                        !showFeedback && isSelected && "bg-blue-50 border-blue-200",
                        !showFeedback && "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <Checkbox
                        id={`option-${index}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleMultipleChoiceChange(option, !!checked)}
                        disabled={showFeedback}
                      />
                      <Label
                        htmlFor={`option-${index}`}
                        className={cn(
                          "flex-1 cursor-pointer",
                          showFeedback && isCorrectAnswer && "text-green-800 font-medium",
                          showFeedback && isSelected && !isCorrectAnswer && "text-red-800",
                          !showFeedback && isSelected && "text-blue-800"
                        )}
                      >
                        {option}
                      </Label>
                      {showFeedback && (
                        <div className="flex items-center">
                          {isCorrectAnswer ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : isSelected ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {question.type === 'true-false' && (
              <div className="space-y-3">
                {['True', 'False'].map((option) => {
                  const isSelected = selectedAnswer === option.toLowerCase();
                  const isCorrectAnswer = question.correctAnswer.toLowerCase() === option.toLowerCase();
                  
                  return (
                    <div
                      key={option}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                        showFeedback && isCorrectAnswer && "bg-green-50 border-green-200",
                        showFeedback && isSelected && !isCorrectAnswer && "bg-red-50 border-red-200",
                        !showFeedback && isSelected && "bg-blue-50 border-blue-200",
                        !showFeedback && "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => !showFeedback && handleTrueFalseChange(option === 'True')}
                    >
                      <div className={cn(
                        "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                        isSelected && "border-blue-600 bg-blue-600",
                        !isSelected && "border-gray-300"
                      )}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <span className={cn(
                        "flex-1",
                        showFeedback && isCorrectAnswer && "text-green-800 font-medium",
                        showFeedback && isSelected && !isCorrectAnswer && "text-red-800",
                        !showFeedback && isSelected && "text-blue-800"
                      )}>
                        {option}
                      </span>
                      {showFeedback && (
                        <div className="flex items-center">
                          {isCorrectAnswer ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : isSelected ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {question.type === 'short-answer' && (
              <div className="space-y-3">
                <Input
                  value={selectedAnswer as string}
                  onChange={(e) => handleShortAnswerChange(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={showFeedback}
                  className={cn(
                    showFeedback && isCorrect(selectedAnswer) && "border-green-300 bg-green-50",
                    showFeedback && !isCorrect(selectedAnswer) && "border-red-300 bg-red-50"
                  )}
                />
                {showFeedback && (
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect(selectedAnswer) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={cn(
                        "font-medium",
                        isCorrect(selectedAnswer) ? "text-green-800" : "text-red-800"
                      )}>
                        {isCorrect(selectedAnswer) ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      <strong>Correct answer:</strong> {question.correctAnswer}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Explanation */}
          {showFeedback && question.explanation && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
              <p className="text-blue-800 text-sm">{question.explanation}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}