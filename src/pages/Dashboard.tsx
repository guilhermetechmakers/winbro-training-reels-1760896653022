import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Bell, 
  User, 
  HelpCircle, 
  Play, 
  BookOpen, 
  Plus, 
  TrendingUp,
  Clock,
  Star,
  Filter,
  Grid,
  List,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data - in real app this would come from API
  const recommendedReels = [
    {
      id: 1,
      title: "CNC Mill Setup - Tool Change",
      duration: "0:28",
      thumbnail: "/api/placeholder/300/200",
      tags: ["CNC", "Setup", "Tool Change"],
      views: 1247,
      author: "John Smith",
      published: "2 days ago"
    },
    {
      id: 2,
      title: "Lathe Safety Check Procedure",
      duration: "0:22",
      thumbnail: "/api/placeholder/300/200",
      tags: ["Safety", "Lathe", "Inspection"],
      views: 892,
      author: "Sarah Johnson",
      published: "1 week ago"
    },
    {
      id: 3,
      title: "Grinder Maintenance - Belt Replacement",
      duration: "0:31",
      thumbnail: "/api/placeholder/300/200",
      tags: ["Maintenance", "Grinder", "Belt"],
      views: 654,
      author: "Mike Chen",
      published: "2 weeks ago"
    }
  ];

  const assignedCourses = [
    {
      id: 1,
      title: "Machine Safety Fundamentals",
      progress: 75,
      totalModules: 8,
      completedModules: 6,
      dueDate: "2024-02-15",
      instructor: "Safety Team"
    },
    {
      id: 2,
      title: "Advanced CNC Operations",
      progress: 30,
      totalModules: 12,
      completedModules: 4,
      dueDate: "2024-02-28",
      instructor: "Operations Team"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "completed",
      title: "Completed: CNC Mill Setup - Tool Change",
      time: "2 hours ago",
      icon: <CheckCircle className="h-4 w-4 text-green-500" />
    },
    {
      id: 2,
      type: "bookmarked",
      title: "Bookmarked: Lathe Safety Check Procedure",
      time: "1 day ago",
      icon: <Star className="h-4 w-4 text-yellow-500" />
    },
    {
      id: 3,
      type: "uploaded",
      title: "Uploaded: New Safety Protocol Video",
      time: "3 days ago",
      icon: <Play className="h-4 w-4 text-blue-500" />
    }
  ];

  const analytics = {
    totalReels: 1247,
    totalCourses: 23,
    completedThisWeek: 45,
    totalViews: 15678
  };

  return (
    <div className="min-h-screen bg-main-bg">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-primary-text">Winbro Training Reels</h1>
              
              {/* Global Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-text" />
                <Input
                  placeholder="Search reels, courses, or transcripts..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 w-96"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary-text mb-2">Welcome back, John!</h2>
          <p className="text-secondary-text">Here's what's happening with your training today.</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-primary-text">Quick Actions</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="btn-primary h-20 text-left justify-start">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-semibold">Upload New Reel</div>
                  <div className="text-sm opacity-90">Capture a new training video</div>
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-20 text-left justify-start">
              <div className="flex items-center space-x-4">
                <div className="bg-accent-blue/10 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-accent-blue" />
                </div>
                <div>
                  <div className="font-semibold">Create Course</div>
                  <div className="text-sm text-secondary-text">Build a structured training course</div>
                </div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-20 text-left justify-start">
              <div className="flex items-center space-x-4">
                <div className="bg-accent-blue/10 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-accent-blue" />
                </div>
                <div>
                  <div className="font-semibold">View Analytics</div>
                  <div className="text-sm text-secondary-text">Track progress and engagement</div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recommended Reels */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary-text">Recommended for You</h3>
                <Button variant="ghost" className="text-accent-blue">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recommendedReels.map((reel) => (
                  <Card key={reel.id} className="card card-hover animate-fade-in-up">
                    <div className="relative">
                      <img
                        src={reel.thumbnail}
                        alt={reel.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {reel.duration}
                      </div>
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-t-lg flex items-center justify-center">
                        <Button size="icon" className="opacity-0 hover:opacity-100 transition-opacity">
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-primary-text mb-2 line-clamp-2">
                        {reel.title}
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {reel.tags.map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-secondary-text">
                        <span>{reel.views} views</span>
                        <span>{reel.published}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Assigned Courses */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary-text">Your Assigned Courses</h3>
                <Button variant="ghost" className="text-accent-blue">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {assignedCourses.map((course) => (
                  <Card key={course.id} className="card animate-fade-in-up">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-primary-text mb-2">
                            {course.title}
                          </h4>
                          <p className="text-secondary-text text-sm mb-4">
                            {course.completedModules} of {course.totalModules} modules completed
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-accent-blue h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm text-secondary-text">
                            <span>{course.progress}% complete</span>
                            <span>Due: {course.dueDate}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Continue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analytics Snapshot */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg">Analytics Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-text">Total Reels</span>
                  <span className="font-semibold text-primary-text">{analytics.totalReels.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-text">Total Courses</span>
                  <span className="font-semibold text-primary-text">{analytics.totalCourses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-text">Completed This Week</span>
                  <span className="font-semibold text-primary-text">{analytics.completedThisWeek}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary-text">Total Views</span>
                  <span className="font-semibold text-primary-text">{analytics.totalViews.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-primary-text">{activity.title}</p>
                        <p className="text-xs text-secondary-text">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Courses
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Star className="h-4 w-4 mr-2" />
                  Bookmarks
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Recent
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}