import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  HelpCircle, 
  CheckCircle2, 
  X,
  Clock,
  Star
} from 'lucide-react';
import type { CourseQuiz } from '@/types';

interface QuizBuilderProps {
  courseId?: string;
  quizzes: CourseQuiz[];
  onAddQuiz: (quiz: Omit<CourseQuiz, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditQuiz: (id: string, quiz: Partial<CourseQuiz>) => void;
  onDeleteQuiz: (id: string) => void;
}

interface QuizFormData {
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  timeLimit?: number;
}

export default function QuizBuilder({ 
  courseId, 
  quizzes, 
  onAddQuiz, 
  onEditQuiz, 
  onDeleteQuiz 
}: QuizBuilderProps) {
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<string | null>(null);
  const [quizForm, setQuizForm] = useState<QuizFormData>({
    question: '',
    type: 'multiple-choice',
    options: ['', ''],
    correctAnswer: '',
    explanation: '',
    points: 1,
    timeLimit: undefined,
  });

  const handleAddQuizSubmit = () => {
    if (!courseId || !quizForm.question.trim() || !quizForm.correctAnswer.trim()) return;

    onAddQuiz({
      courseId,
      question: quizForm.question,
      type: quizForm.type,
      options: quizForm.type === 'multiple-choice' ? quizForm.options.filter(opt => opt.trim()) : [],
      correctAnswer: quizForm.correctAnswer,
      explanation: quizForm.explanation,
      points: quizForm.points,
      timeLimit: quizForm.timeLimit,
      orderIndex: quizzes.length,
    });

    setQuizForm({
      question: '',
      type: 'multiple-choice',
      options: ['', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
      timeLimit: undefined,
    });
    setShowAddQuiz(false);
  };

  const handleEditQuiz = (quiz: CourseQuiz) => {
    setEditingQuiz(quiz.id);
    setQuizForm({
      question: quiz.question,
      type: quiz.type,
      options: quiz.options.length > 0 ? quiz.options : ['', ''],
      correctAnswer: quiz.correctAnswer,
      explanation: quiz.explanation || '',
      points: quiz.points,
      timeLimit: quiz.timeLimit,
    });
  };

  const handleUpdateQuizSubmit = () => {
    if (!editingQuiz || !quizForm.question.trim() || !quizForm.correctAnswer.trim()) return;

    onEditQuiz(editingQuiz, {
      question: quizForm.question,
      type: quizForm.type,
      options: quizForm.type === 'multiple-choice' ? quizForm.options.filter(opt => opt.trim()) : [],
      correctAnswer: quizForm.correctAnswer,
      explanation: quizForm.explanation,
      points: quizForm.points,
      timeLimit: quizForm.timeLimit,
    });

    setEditingQuiz(null);
    setQuizForm({
      question: '',
      type: 'multiple-choice',
      options: ['', ''],
      correctAnswer: '',
      explanation: '',
      points: 1,
      timeLimit: undefined,
    });
  };

  const handleAddOption = () => {
    setQuizForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index: number) => {
    setQuizForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setQuizForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const getQuizTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'true-false':
        return <HelpCircle className="h-4 w-4" />;
      case 'short-answer':
        return <Edit className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getQuizTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return 'Multiple Choice';
      case 'true-false':
        return 'True/False';
      case 'short-answer':
        return 'Short Answer';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary-text">Quiz Builder</h3>
          <p className="text-sm text-secondary-text">
            Create quizzes to test learner comprehension
          </p>
        </div>
        <Button
          onClick={() => setShowAddQuiz(true)}
          className="bg-accent-blue hover:bg-accent-blue/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Quiz
        </Button>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        <AnimatePresence>
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-accent-blue">
                        {getQuizTypeIcon(quiz.type)}
                      </div>
                      <h4 className="font-medium text-primary-text">
                        Question {index + 1}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {getQuizTypeLabel(quiz.type)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        {quiz.points} point{quiz.points !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-primary-text mb-3">
                      {quiz.question}
                    </p>

                    {quiz.type === 'multiple-choice' && quiz.options.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {quiz.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`text-xs px-2 py-1 rounded ${
                              option === quiz.correctAnswer
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    )}

                    {quiz.type === 'true-false' && (
                      <div className="text-xs text-gray-600 mb-3">
                        Correct Answer: {quiz.correctAnswer}
                      </div>
                    )}

                    {quiz.type === 'short-answer' && (
                      <div className="text-xs text-gray-600 mb-3">
                        Correct Answer: {quiz.correctAnswer}
                      </div>
                    )}

                    {quiz.explanation && (
                      <div className="text-xs text-gray-600 mb-3">
                        <strong>Explanation:</strong> {quiz.explanation}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-secondary-text">
                      {quiz.timeLimit && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {quiz.timeLimit}s limit
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditQuiz(quiz)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteQuiz(quiz.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {quizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <HelpCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-primary-text mb-2">No quizzes yet</h3>
            <p className="text-secondary-text mb-4">
              Add quizzes to test learner comprehension
            </p>
            <Button
              onClick={() => setShowAddQuiz(true)}
              className="bg-accent-blue hover:bg-accent-blue/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Quiz
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add Quiz Modal */}
      {showAddQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-primary-text mb-4">Add Quiz Question</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary-text">Question *</label>
                <Textarea
                  value={quizForm.question}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter your question"
                  className="mt-1 h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-text">Question Type</label>
                <Select
                  value={quizForm.type}
                  onValueChange={(value) => setQuizForm(prev => ({ 
                    ...prev, 
                    type: value as any,
                    options: value === 'multiple-choice' ? ['', ''] : [],
                    correctAnswer: ''
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Multiple Choice
                      </div>
                    </SelectItem>
                    <SelectItem value="true-false">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        True/False
                      </div>
                    </SelectItem>
                    <SelectItem value="short-answer">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Short Answer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {quizForm.type === 'multiple-choice' && (
                <div>
                  <label className="text-sm font-medium text-primary-text">Answer Options</label>
                  <div className="mt-1 space-y-2">
                    {quizForm.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500 w-6">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="flex-1"
                        />
                        {quizForm.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-primary-text">Correct Answer *</label>
                {quizForm.type === 'multiple-choice' ? (
                  <Select
                    value={quizForm.correctAnswer}
                    onValueChange={(value) => setQuizForm(prev => ({ ...prev, correctAnswer: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizForm.options
                        .filter(opt => opt.trim())
                        .map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {String.fromCharCode(65 + index)}. {option}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={quizForm.correctAnswer}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    placeholder={quizForm.type === 'true-false' ? 'True or False' : 'Enter correct answer'}
                    className="mt-1"
                  />
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-primary-text">Explanation</label>
                <Textarea
                  value={quizForm.explanation}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain why this is the correct answer (optional)"
                  className="mt-1 h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary-text">Points</label>
                  <Input
                    type="number"
                    min="1"
                    value={quizForm.points}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-text">Time Limit (seconds)</label>
                  <Input
                    type="number"
                    min="0"
                    value={quizForm.timeLimit || ''}
                    onChange={(e) => setQuizForm(prev => ({ 
                      ...prev, 
                      timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="No limit"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddQuiz(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddQuizSubmit}
                disabled={!quizForm.question.trim() || !quizForm.correctAnswer.trim()}
                className="bg-accent-blue hover:bg-accent-blue/90"
              >
                Add Quiz
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Quiz Modal */}
      {editingQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-primary-text mb-4">Edit Quiz Question</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary-text">Question *</label>
                <Textarea
                  value={quizForm.question}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter your question"
                  className="mt-1 h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-text">Question Type</label>
                <Select
                  value={quizForm.type}
                  onValueChange={(value) => setQuizForm(prev => ({ 
                    ...prev, 
                    type: value as any,
                    options: value === 'multiple-choice' ? ['', ''] : [],
                    correctAnswer: ''
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Multiple Choice
                      </div>
                    </SelectItem>
                    <SelectItem value="true-false">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        True/False
                      </div>
                    </SelectItem>
                    <SelectItem value="short-answer">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Short Answer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {quizForm.type === 'multiple-choice' && (
                <div>
                  <label className="text-sm font-medium text-primary-text">Answer Options</label>
                  <div className="mt-1 space-y-2">
                    {quizForm.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500 w-6">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="flex-1"
                        />
                        {quizForm.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-primary-text">Correct Answer *</label>
                {quizForm.type === 'multiple-choice' ? (
                  <Select
                    value={quizForm.correctAnswer}
                    onValueChange={(value) => setQuizForm(prev => ({ ...prev, correctAnswer: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizForm.options
                        .filter(opt => opt.trim())
                        .map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {String.fromCharCode(65 + index)}. {option}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={quizForm.correctAnswer}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    placeholder={quizForm.type === 'true-false' ? 'True or False' : 'Enter correct answer'}
                    className="mt-1"
                  />
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-primary-text">Explanation</label>
                <Textarea
                  value={quizForm.explanation}
                  onChange={(e) => setQuizForm(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain why this is the correct answer (optional)"
                  className="mt-1 h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-primary-text">Points</label>
                  <Input
                    type="number"
                    min="1"
                    value={quizForm.points}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-text">Time Limit (seconds)</label>
                  <Input
                    type="number"
                    min="0"
                    value={quizForm.timeLimit || ''}
                    onChange={(e) => setQuizForm(prev => ({ 
                      ...prev, 
                      timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="No limit"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingQuiz(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateQuizSubmit}
                disabled={!quizForm.question.trim() || !quizForm.correctAnswer.trim()}
                className="bg-accent-blue hover:bg-accent-blue/90"
              >
                Update Quiz
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
