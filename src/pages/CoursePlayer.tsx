import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle } from 'lucide-react';

export default function CoursePlayer() {
  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">Course Player</h1>
          <p className="text-secondary-text">Complete your assigned training courses</p>
        </div>
        
        <Card className="card">
          <CardHeader>
            <CardTitle>Course Player</CardTitle>
            <CardDescription>Sequential reel playback with inline quizzes and progress tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-primary-text mb-2">Course Player Coming Soon</h3>
              <p className="text-secondary-text mb-6">
                This feature will provide a seamless learning experience with course navigation, 
                progress tracking, and certificate generation.
              </p>
              <div className="flex justify-center space-x-4">
                <Button className="btn-primary">
                  <Play className="h-4 w-4 mr-2" />
                  Start Course
                </Button>
                <Button variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  View Progress
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}