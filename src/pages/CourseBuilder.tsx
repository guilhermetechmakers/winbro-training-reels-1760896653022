import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';

export default function CourseBuilder() {
  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">Course Builder</h1>
          <p className="text-secondary-text">Create structured training courses from reels and resources</p>
        </div>
        
        <Card className="card">
          <CardHeader>
            <CardTitle>Course Builder</CardTitle>
            <CardDescription>Drag and drop reels, add quizzes, and create engaging training courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-primary-text mb-2">Course Builder Coming Soon</h3>
              <p className="text-secondary-text mb-6">
                This feature will allow you to create structured courses with drag-and-drop timeline, 
                quiz builder, and assignment tools.
              </p>
              <div className="flex justify-center space-x-4">
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Course
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Mode
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}