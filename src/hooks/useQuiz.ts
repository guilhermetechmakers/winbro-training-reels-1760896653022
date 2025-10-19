import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '@/api/courses';
import { supabase } from '@/lib/supabase';
import type { 
  CourseQuiz, 
  QuizAttempt, 
  QuizResult, 
  QuizSession,
  QuizStats,
  QuizQuestionForm,
  QuizValidationError
} from '@/types/quiz';

// Query keys
export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...quizKeys.lists(), { filters }] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
  attempts: () => [...quizKeys.all, 'attempts'] as const,
  attempt: (id: string) => [...quizKeys.attempts(), id] as const,
  stats: (id: string) => [...quizKeys.all, 'stats', id] as const,
};

// Get quiz by ID
export function useQuiz(quizId: string) {
  return useQuery({
    queryKey: quizKeys.detail(quizId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

      if (error) throw error;
      return data as CourseQuiz;
    },
    enabled: !!quizId,
  });
}

// Get quizzes by course
export function useCourseQuizzes(courseId: string) {
  return useQuery({
    queryKey: quizKeys.list({ courseId }),
    queryFn: async () => {
      return await courseApi.getCourseQuizzes(courseId);
    },
    enabled: !!courseId,
  });
}

// Get quizzes by module
export function useModuleQuizzes(courseId: string, moduleId: string) {
  return useQuery({
    queryKey: quizKeys.list({ courseId, moduleId }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_quizzes')
        .select('*')
        .eq('course_id', courseId)
        .eq('module_id', moduleId)
        .order('order_index');

      if (error) throw error;
      return data as CourseQuiz[];
    },
    enabled: !!courseId && !!moduleId,
  });
}

// Create quiz
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizData: Omit<CourseQuiz, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await courseApi.createCourseQuiz(quizData);
    },
    onSuccess: (data) => {
      // Invalidate and refetch quizzes
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quizKeys.list({ courseId: data.courseId }) });
      if (data.moduleId) {
        queryClient.invalidateQueries({ queryKey: quizKeys.list({ courseId: data.courseId, moduleId: data.moduleId }) });
      }
    },
  });
}

// Update quiz
export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CourseQuiz> }) => {
      return await courseApi.updateCourseQuiz(id, updates);
    },
    onSuccess: (data) => {
      // Update the quiz in cache
      queryClient.setQueryData(quizKeys.detail(data.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
}

// Delete quiz
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      return await courseApi.deleteCourseQuiz(quizId);
    },
    onSuccess: (_, quizId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: quizKeys.detail(quizId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
    },
  });
}

// Get quiz attempts
export function useQuizAttempts(quizId: string, userId?: string) {
  return useQuery({
    queryKey: quizKeys.attempt(quizId),
    queryFn: async () => {
      let query = supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      return data.map(item => ({
        id: item.id,
        quizId: item.quiz_id,
        userId: item.user_id,
        courseId: item.course_id,
        moduleId: item.module_id,
        answers: item.answers,
        score: item.score,
        totalPoints: item.total_points,
        earnedPoints: item.earned_points,
        timeSpent: item.time_spent,
        completedAt: item.completed_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        status: item.status
      })) as QuizAttempt[];
    },
    enabled: !!quizId,
  });
}

// Get user's quiz attempts
export function useUserQuizAttempts(userId: string) {
  return useQuery({
    queryKey: [...quizKeys.attempts(), 'user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      return data.map(item => ({
        id: item.id,
        quizId: item.quiz_id,
        userId: item.user_id,
        courseId: item.course_id,
        moduleId: item.module_id,
        answers: item.answers,
        score: item.score,
        totalPoints: item.total_points,
        earnedPoints: item.earned_points,
        timeSpent: item.time_spent,
        completedAt: item.completed_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        status: item.status
      })) as QuizAttempt[];
    },
    enabled: !!userId,
  });
}

// Submit quiz attempt
export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attemptData: Omit<QuizAttempt, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: attemptData.quizId,
          user_id: attemptData.userId,
          course_id: attemptData.courseId,
          module_id: attemptData.moduleId,
          answers: attemptData.answers,
          score: attemptData.score,
          total_points: attemptData.totalPoints,
          earned_points: attemptData.earnedPoints,
          time_spent: attemptData.timeSpent,
          completed_at: attemptData.completedAt,
          status: attemptData.status
        })
        .select()
        .single();

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: QuizAttempt = {
        id: data.id,
        quizId: data.quiz_id,
        userId: data.user_id,
        courseId: data.course_id,
        moduleId: data.module_id,
        answers: data.answers,
        score: data.score,
        totalPoints: data.total_points,
        earnedPoints: data.earned_points,
        timeSpent: data.time_spent,
        completedAt: data.completed_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        status: data.status
      };
      
      return transformedData;
    },
    onSuccess: (data) => {
      // Invalidate attempts
      queryClient.invalidateQueries({ queryKey: quizKeys.attempt(data.quizId) });
      queryClient.invalidateQueries({ queryKey: [...quizKeys.attempts(), 'user', data.userId] });
    },
  });
}

// Get quiz statistics
export function useQuizStats(quizId: string) {
  return useQuery({
    queryKey: quizKeys.stats(quizId),
    queryFn: async () => {
      // Get quiz attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId);

      if (attemptsError) throw attemptsError;

      if (!attempts || attempts.length === 0) {
        return {
          quizId,
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0,
          averageTimeSpent: 0,
          mostMissedQuestions: [],
          difficultyRating: 0
        } as QuizStats;
      }

      // Calculate statistics
      const totalAttempts = attempts.length;
      const averageScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts;
      const passedAttempts = attempts.filter(attempt => attempt.score >= 80).length;
      const passRate = (passedAttempts / totalAttempts) * 100;
      const averageTimeSpent = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) / totalAttempts;

      // TODO: Calculate most missed questions and difficulty rating
      const mostMissedQuestions: string[] = [];
      const difficultyRating = averageScore < 60 ? 5 : averageScore < 70 ? 4 : averageScore < 80 ? 3 : averageScore < 90 ? 2 : 1;

      return {
        quizId,
        totalAttempts,
        averageScore: Math.round(averageScore),
        passRate: Math.round(passRate),
        averageTimeSpent: Math.round(averageTimeSpent),
        mostMissedQuestions,
        difficultyRating
      } as QuizStats;
    },
    enabled: !!quizId,
  });
}

// Quiz session management
export function useQuizSession(quizId: string) {
  const [session, setSession] = useState<QuizSession | null>(null);

  const startQuiz = useCallback(async () => {
    try {
      // Get quiz questions
      const { data: questions, error } = await supabase
        .from('course_quizzes')
        .select('*')
        .eq('id', quizId);

      if (error) throw error;
      if (!questions || questions.length === 0) throw new Error('No questions found');

      const newSession: QuizSession = {
        quizId,
        courseId: questions[0].courseId,
        moduleId: questions[0].moduleId,
        questions: questions as CourseQuiz[],
        currentQuestionIndex: 0,
        answers: new Map(),
        isCompleted: false,
        isSubmitted: false,
        startedAt: new Date().toISOString()
      };

      setSession(newSession);
    } catch (error) {
      console.error('Failed to start quiz:', error);
      throw error;
    }
  }, [quizId]);

  const submitAnswer = useCallback((questionId: string, answer: string | string[]) => {
    if (!session) return;

    const newAnswer = {
      questionId,
      answer,
      isCorrect: false, // Will be calculated on submit
      timeSpent: 0, // Will be calculated
      submittedAt: new Date().toISOString()
    };

    const newAnswers = new Map(session.answers);
    newAnswers.set(questionId, newAnswer);

    setSession(prev => prev ? {
      ...prev,
      answers: newAnswers
    } : null);
  }, [session]);

  const submitQuiz = useCallback(async (): Promise<QuizResult> => {
    if (!session) throw new Error('No active quiz session');

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
      const passed = score >= 80; // Default pass threshold
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
        passThreshold: 80,
        completedAt: new Date().toISOString(),
        answers,
        feedback: passed 
          ? 'Great job! You have successfully completed this quiz.'
          : 'You need 80% to pass. Consider reviewing the material and trying again.'
      };

      // Mark session as completed
      setSession(prev => prev ? {
        ...prev,
        isCompleted: true,
        isSubmitted: true,
        completedAt: new Date().toISOString()
      } : null);

      return result;
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      throw error;
    }
  }, [session]);

  const retakeQuiz = useCallback(() => {
    setSession(null);
    startQuiz();
  }, [startQuiz]);

  const exitQuiz = useCallback(() => {
    setSession(null);
  }, []);

  return {
    session,
    startQuiz,
    submitAnswer,
    submitQuiz,
    retakeQuiz,
    exitQuiz
  };
}

// Helper function to check if answer is correct
function checkAnswer(question: CourseQuiz, userAnswer: string | string[]): boolean {
  const correctAnswers = question.correctAnswer.split(',').map(a => a.trim());
  
  if (Array.isArray(userAnswer)) {
    return userAnswer.length === correctAnswers.length &&
      userAnswer.every(answer => correctAnswers.includes(answer));
  }
  
  return correctAnswers.includes(userAnswer);
}

// Quiz builder hook
export function useQuizBuilder(_courseId: string, _moduleId?: string) {
  const [questions, setQuestions] = useState<QuizQuestionForm[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addQuestion = useCallback((question: QuizQuestionForm) => {
    setQuestions((prev: QuizQuestionForm[]) => [...prev, question]);
    setIsDirty(true);
  }, []);

  const updateQuestion = useCallback((questionId: string, updates: Partial<QuizQuestionForm>) => {
    setQuestions((prev: QuizQuestionForm[]) => prev.map((q: QuizQuestionForm) => 
      q.question === questionId ? { ...q, ...updates } : q
    ));
    setIsDirty(true);
  }, []);

  const deleteQuestion = useCallback((questionId: string) => {
    setQuestions((prev: QuizQuestionForm[]) => prev.filter((q: QuizQuestionForm) => q.question !== questionId));
    setIsDirty(true);
  }, []);

  const reorderQuestions = useCallback((_questionIds: string[]) => {
    // TODO: Implement reordering logic
    setIsDirty(true);
  }, []);

  const saveQuiz = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      // TODO: Save quiz to database
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const publishQuiz = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      // TODO: Publish quiz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish quiz');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const validateQuiz = useCallback((): QuizValidationError[] => {
    const errors: QuizValidationError[] = [];

    if (questions.length === 0) {
      errors.push({
        field: 'questions',
        message: 'At least one question is required'
      });
    }

    questions.forEach((question: QuizQuestionForm, index: number) => {
      if (!question.question.trim()) {
        errors.push({
          field: `question_${index}`,
          message: `Question ${index + 1} is required`
        });
      }

      if (question.type === 'multiple-choice') {
        const validOptions = question.options.filter((opt: string) => opt.trim());
        if (validOptions.length < 2) {
          errors.push({
            field: `options_${index}`,
            message: `Question ${index + 1} needs at least 2 options`
          });
        }
      }

      if (!question.correctAnswer.trim()) {
        errors.push({
          field: `correctAnswer_${index}`,
          message: `Question ${index + 1} needs a correct answer`
        });
      }
    });

    return errors;
  }, [questions]);

  return {
    questions,
    isDirty,
    isSaving,
    error,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    saveQuiz,
    publishQuiz,
    validateQuiz
  };
}

// QuizValidationError is already imported from the types above