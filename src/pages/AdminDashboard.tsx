import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Video, BookOpen, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">Admin Dashboard</h1>
          <p className="text-secondary-text">Platform and customer administration</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-accent-blue" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-primary-text">1,247</p>
                  <p className="text-secondary-text">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Video className="h-8 w-8 text-accent-blue" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-primary-text">3,456</p>
                  <p className="text-secondary-text">Total Videos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-accent-blue" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-primary-text">89</p>
                  <p className="text-secondary-text">Total Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-accent-blue" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-primary-text">15,678</p>
                  <p className="text-secondary-text">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="card">
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Platform administration and moderation tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-primary-text mb-2">Admin Features Coming Soon</h3>
              <p className="text-secondary-text mb-6">
                This section will include user management, content moderation, analytics, and system settings.
              </p>
              <div className="flex justify-center space-x-4">
                <Button className="btn-primary">Manage Users</Button>
                <Button variant="outline">Content Moderation</Button>
                <Button variant="outline">View Analytics</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}