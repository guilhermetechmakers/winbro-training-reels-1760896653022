import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Eye, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import type { 
  QuizBuilderProps, 
  QuizQuestionForm, 
  CourseQuiz,
  QuizValidationError 
} from '@/types/quiz';

export function QuizBuilder({
  courseId,
  moduleId,
  quizId,
  onSave,
  onCancel
}: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuizQuestionForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<QuizValidationError[]>([]);

  // Initialize quiz builder
  useEffect(() => {
    if (quizId) {
      loadQuiz(quizId);
    } else {
      // Start with one empty question
      addQuestion();
    }
  }, [quizId]);

  // Load existing quiz
  const loadQuiz = async (id: string) => {
    try {
      setIsLoading(true);
      // TODO: Fetch quiz from API
      // For now, using mock data
      const mockQuiz: CourseQuiz = {
        id,
        courseId,
        moduleId,
        question: 'Sample Quiz',
        type: 'multiple-choice',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 'Option 1',
        explanation: 'This is a sample explanation',
        points: 1,
        timeLimit: 30,
        orderIndex: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setQuestions([{
        question: mockQuiz.question,
        type: mockQuiz.type,
        options: mockQuiz.options,
        correctAnswer: mockQuiz.correctAnswer,
        explanation: mockQuiz.explanation,
        points: mockQuiz.points,
        timeLimit: mockQuiz.timeLimit
      }]);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new question
  const addQuestion = () => {
    const newQuestion: QuizQuestionForm = {
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
      timeLimit: undefined
    };
    setQuestions(prev => [...prev, newQuestion]);
    setIsDirty(true);
  };

  // Update question
  const updateQuestion = (index: number, updates: Partial<QuizQuestionForm>) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, ...updates } : q
    ));
    setIsDirty(true);
  };

  // Delete question
  const deleteQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
      setIsDirty(true);
    }
  };

  // Reorder questions
  const reorderQuestions = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...questions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);
    setQuestions(newQuestions);
    setIsDirty(true);
  };

  // Validate quiz
  const validateQuiz = (): QuizValidationError[] => {
    const validationErrors: QuizValidationError[] = [];

    if (questions.length === 0) {
      validationErrors.push({
        field: 'questions',
        message: 'At least one question is required'
      });
    }

    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        validationErrors.push({
          field: `question_${index}`,
          message: `Question ${index + 1} is required`
        });
      }

      if (question.type === 'multiple-choice') {
        const validOptions = question.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          validationErrors.push({
            field: `options_${index}`,
            message: `Question ${index + 1} needs at least 2 options`
          });
        }

        if (!question.correctAnswer.trim()) {
          validationErrors.push({
            field: `correctAnswer_${index}`,
            message: `Question ${index + 1} needs a correct answer`
          });
        }
      }

      if (question.type === 'short-answer' && !question.correctAnswer.trim()) {
        validationErrors.push({
          field: `correctAnswer_${index}`,
          message: `Question ${index + 1} needs a correct answer`
        });
      }

      if (question.points < 1) {
        validationErrors.push({
          field: `points_${index}`,
          message: `Question ${index + 1} must have at least 1 point`
        });
      }
    });

    return validationErrors;
  };

  // Save quiz
  const handleSave = async () => {
    const validationErrors = validateQuiz();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsLoading(true);
      setErrors([]);

      // TODO: Save quiz to API
      // For now, just call onSave with mock data
      const quizData: CourseQuiz = {
        id: quizId || '',
        courseId,
        moduleId,
        question: questions[0]?.question || 'Quiz',
        type: questions[0]?.type || 'multiple-choice',
        options: questions[0]?.options || [],
        correctAnswer: questions[0]?.correctAnswer || '',
        explanation: questions[0]?.explanation,
        points: questions[0]?.points || 1,
        timeLimit: questions[0]?.timeLimit,
        orderIndex: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(quizData);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Preview quiz
  const handlePreview = () => {
    // TODO: Implement quiz preview
    console.log('Preview quiz');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading quiz builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quiz Builder</h2>
            <p className="text-gray-600">Create interactive quiz questions for your course</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </Badge>
            {isDirty && (
              <Badge variant="secondary" className="text-orange-600">
                Unsaved changes
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-red-900">Please fix the following errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <QuestionEditor
            key={index}
            question={question}
            index={index}
            onUpdate={(updates) => updateQuestion(index, updates)}
            onDelete={() => deleteQuestion(index)}
            onMoveUp={index > 0 ? () => reorderQuestions(index, index - 1) : undefined}
            onMoveDown={index < questions.length - 1 ? () => reorderQuestions(index, index + 1) : undefined}
            canDelete={questions.length > 1}
          />
        ))}
      </div>

      {/* Add Question Button */}
      <Card className="p-4 border-dashed border-2 border-gray-300">
        <Button
          onClick={addQuestion}
          variant="outline"
          className="w-full h-12 border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={onCancel}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePreview}
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading || !isDirty}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Quiz'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Question Editor Component
interface QuestionEditorProps {
  question: QuizQuestionForm;
  index: number;
  onUpdate: (updates: Partial<QuizQuestionForm>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canDelete: boolean;
}

function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canDelete
}: QuestionEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTypeChange = (type: string) => {
    const updates: Partial<QuizQuestionForm> = { type: type as any };
    
    if (type === 'multiple-choice') {
      updates.options = ['', '', '', ''];
    } else if (type === 'true-false') {
      updates.options = [];
      updates.correctAnswer = 'true';
    } else if (type === 'short-answer') {
      updates.options = [];
      updates.correctAnswer = '';
    }
    
    onUpdate(updates);
  };

  const addOption = () => {
    onUpdate({
      options: [...question.options, '']
    });
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (optionIndex: number) => {
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      onUpdate({ options: newOptions });
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Question Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">
              Question {index + 1}
            </span>
            <Badge variant="secondary">
              {question.type.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button
                onClick={onMoveUp}
                variant="outline"
                size="sm"
              >
                ↑
              </Button>
            )}
            {onMoveDown && (
              <Button
                onClick={onMoveDown}
                variant="outline"
                size="sm"
              >
                ↓
              </Button>
            )}
            <Button
              onClick={onDelete}
              variant="outline"
              size="sm"
              disabled={!canDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question Type */}
        <div className="space-y-2">
          <Label htmlFor={`type-${index}`}>Question Type</Label>
          <Select value={question.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
              <SelectItem value="true-false">True/False</SelectItem>
              <SelectItem value="short-answer">Short Answer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <Label htmlFor={`question-${index}`}>Question *</Label>
          <Textarea
            id={`question-${index}`}
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Enter your question here..."
            rows={3}
          />
        </div>

        {/* Answer Options */}
        {question.type === 'multiple-choice' && (
          <div className="space-y-3">
            <Label>Answer Options *</Label>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                />
                {question.options.length > 2 && (
                  <Button
                    onClick={() => removeOption(optionIndex)}
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              onClick={addOption}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
        )}

        {/* Correct Answer */}
        <div className="space-y-2">
          <Label htmlFor={`correct-${index}`}>
            Correct Answer *
            {question.type === 'multiple-choice' && (
              <span className="text-sm text-gray-500 ml-2">
                (Select from options above)
              </span>
            )}
          </Label>
          
          {question.type === 'multiple-choice' ? (
            <Select 
              value={question.correctAnswer} 
              onValueChange={(value) => onUpdate({ correctAnswer: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                {question.options
                  .filter(opt => opt.trim())
                  .map((option, optionIndex) => (
                    <SelectItem key={optionIndex} value={option}>
                      {option}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : question.type === 'true-false' ? (
            <Select 
              value={question.correctAnswer} 
              onValueChange={(value) => onUpdate({ correctAnswer: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={`correct-${index}`}
              value={question.correctAnswer}
              onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
              placeholder="Enter correct answer..."
            />
          )}
        </div>

        {/* Advanced Options */}
        <div className="space-y-3">
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>

          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Points */}
              <div className="space-y-2">
                <Label htmlFor={`points-${index}`}>Points</Label>
                <Input
                  id={`points-${index}`}
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
                />
              </div>

              {/* Time Limit */}
              <div className="space-y-2">
                <Label htmlFor={`time-${index}`}>Time Limit (seconds)</Label>
                <Input
                  id={`time-${index}`}
                  type="number"
                  min="1"
                  value={question.timeLimit || ''}
                  onChange={(e) => onUpdate({ 
                    timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="No limit"
                />
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <Label htmlFor={`explanation-${index}`}>Explanation (optional)</Label>
                <Textarea
                  id={`explanation-${index}`}
                  value={question.explanation || ''}
                  onChange={(e) => onUpdate({ explanation: e.target.value })}
                  placeholder="Explain why this is the correct answer..."
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}