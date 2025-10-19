import { useParams, useNavigate } from 'react-router-dom';
import { QuizBuilder } from '@/components/quiz/QuizBuilder';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';
import type { CourseQuiz } from '@/types/quiz';

export function QuizBuilderPage() {
  const { courseId, moduleId, quizId } = useParams<{
    courseId: string;
    moduleId?: string;
    quizId?: string;
  }>();
  
  const navigate = useNavigate();

  const handleQuizSave = async (quiz: CourseQuiz) => {
    try {
      // TODO: Save quiz to database
      console.log('Saving quiz:', quiz);
      
      toast.success('Quiz saved successfully!');
      
      // Navigate back to course builder or course page
      if (moduleId) {
        navigate(`/courses/${courseId}/builder`);
      } else {
        navigate(`/courses/${courseId}`);
      }
    } catch (error) {
      toast.error('Failed to save quiz. Please try again.');
      console.error('Failed to save quiz:', error);
    }
  };

  const handleQuizCancel = () => {
    navigate(`/courses/${courseId}${moduleId ? `/builder` : ''}`);
  };

  if (!courseId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Course Not Found</h2>
            <p className="text-gray-600">The requested course could not be found.</p>
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
        <QuizBuilder
          courseId={courseId}
          moduleId={moduleId}
          quizId={quizId}
          onSave={handleQuizSave}
          onCancel={handleQuizCancel}
        />
      </div>
    </MainLayout>
  );
}