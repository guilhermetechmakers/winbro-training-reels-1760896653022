import { useParams, useNavigate } from 'react-router-dom';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';
import type { QuizResult } from '@/types/quiz';

export function QuizPlayerPage() {
  const { quizId, courseId, moduleId } = useParams<{
    quizId: string;
    courseId: string;
    moduleId?: string;
  }>();
  
  const navigate = useNavigate();

  const handleQuizComplete = (result: QuizResult) => {
    toast.success(
      result.passed 
        ? `Congratulations! You passed with ${result.score}%`
        : `Quiz completed. You scored ${result.score}% (${result.passThreshold}% required to pass)`
    );

    // Navigate based on result
    if (result.passed) {
      // If there's a next module, navigate to it
      // Otherwise, go back to course
      navigate(`/courses/${courseId}`);
    } else {
      // Stay on quiz page for retake
      navigate(`/courses/${courseId}/quiz/${quizId}`);
    }
  };

  const handleQuizExit = () => {
    navigate(`/courses/${courseId}`);
  };

  if (!quizId || !courseId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Quiz Not Found</h2>
            <p className="text-gray-600">The requested quiz could not be found.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <QuizPlayer
          quizId={quizId}
          courseId={courseId}
          moduleId={moduleId}
          onComplete={handleQuizComplete}
          onExit={handleQuizExit}
        />
      </div>
    </MainLayout>
  );
}