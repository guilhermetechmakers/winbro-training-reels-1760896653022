import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { QuizResults } from '@/components/quiz/QuizResults';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import type { QuizResult } from '@/types/quiz';

export function QuizResultsPage() {
  const { courseId, quizId } = useParams<{
    courseId: string;
    quizId: string;
  }>();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get result from location state or load from API
    if (location.state?.result) {
      setResult(location.state.result);
      setIsLoading(false);
    } else {
      // TODO: Load result from API using quizId
      // For now, create a mock result
      const mockResult: QuizResult = {
        quizId: quizId || '',
        courseId: courseId || '',
        moduleId: undefined,
        score: 85,
        totalQuestions: 5,
        correctAnswers: 4,
        timeSpent: 120,
        passed: true,
        passThreshold: 80,
        completedAt: new Date().toISOString(),
        answers: [],
        feedback: 'Great job! You have successfully completed this quiz.'
      };
      
      setResult(mockResult);
      setIsLoading(false);
    }
  }, [location.state, courseId, quizId]);

  const handleRetake = () => {
    navigate(`/courses/${courseId}/quiz/${quizId}`);
  };

  const handleContinue = () => {
    navigate(`/courses/${courseId}`);
  };

  const handleExit = () => {
    navigate(`/courses/${courseId}`);
  };

  const handleDownloadCertificate = () => {
    // TODO: Implement certificate download
    console.log('Downloading certificate...');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!result) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Results Not Found</h2>
            <p className="text-gray-600">The quiz results could not be found.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              onClick={() => navigate(`/courses/${courseId}`)}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
                <p className="text-gray-600">Review your performance and next steps</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDownloadCertificate}
                  variant="outline"
                  disabled={!result.passed}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Certificate
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          <QuizResults
            result={result}
            onRetake={!result.passed ? handleRetake : undefined}
            onContinue={handleContinue}
            onExit={handleExit}
          />

          {/* Additional Actions */}
          <Card className="mt-8 p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Continue Learning</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Move on to the next module in this course
                  </p>
                  <Button
                    onClick={handleContinue}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Continue Course
                  </Button>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Review Material</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Go back and review the course content
                  </p>
                  <Button
                    onClick={() => navigate(`/courses/${courseId}`)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Review Course
                  </Button>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Browse More</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Explore other courses and content
                  </p>
                  <Button
                    onClick={() => navigate('/library')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Browse Library
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}