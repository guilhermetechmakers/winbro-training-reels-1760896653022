import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
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
  CheckCircle,
  Mic,
  MicOff,
  Upload,
  BarChart3,
  Zap,
  Bookmark,
  History,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RecommendedReel {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  tags: string[];
  views: number;
  author: string;
  published: string;
  machineModel?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

interface AssignedCourse {
  id: string;
  title: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  dueDate: string;
  instructor: string;
  status: 'in_progress' | 'not_started' | 'completed';
  estimatedTime: string;
}

interface RecentActivity {
  id: string;
  type: 'completed' | 'bookmarked' | 'uploaded' | 'started' | 'shared';
  title: string;
  time: string;
  icon: React.ReactNode;
  metadata?: Record<string, any>;
}

interface AnalyticsData {
  totalReels: number;
  totalCourses: number;
  completedThisWeek: number;
  totalViews: number;
  completionRate: number;
  topMachines: Array<{ name: string; count: number }>;
  timeToCompetency: number;
  engagementScore: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTimeframe] = useState<'week' | 'month' | 'quarter'>('week');

  // Fetch data using React Query hooks
  const { data: recommendedReels = [], isLoading: reelsLoading } = useQuery({
    queryKey: ['recommended-reels'],
    queryFn: () => fetchRecommendedReels(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: assignedCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['assigned-courses'],
    queryFn: () => fetchAssignedCourses(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: recentActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => fetchRecentActivity(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const { data: analytics = {} as AnalyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics', selectedTimeframe],
    queryFn: () => fetchAnalytics(selectedTimeframe),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mock data functions - replace with actual API calls
  const fetchRecommendedReels = async (): Promise<RecommendedReel[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: '1',
        title: "CNC Mill Setup - Tool Change",
        duration: "0:28",
        thumbnail: "/api/placeholder/300/200",
        tags: ["CNC", "Setup", "Tool Change"],
        views: 1247,
        author: "John Smith",
        published: "2 days ago",
        machineModel: "Haas VF-2",
        skillLevel: "intermediate"
      },
      {
        id: '2',
        title: "Lathe Safety Check Procedure",
        duration: "0:22",
        thumbnail: "/api/placeholder/300/200",
        tags: ["Safety", "Lathe", "Inspection"],
        views: 892,
        author: "Sarah Johnson",
        published: "1 week ago",
        machineModel: "Mazak QT-200",
        skillLevel: "beginner"
      },
      {
        id: '3',
        title: "Grinder Maintenance - Belt Replacement",
        duration: "0:31",
        thumbnail: "/api/placeholder/300/200",
        tags: ["Maintenance", "Grinder", "Belt"],
        views: 654,
        author: "Mike Chen",
        published: "2 weeks ago",
        machineModel: "Belt Grinder Pro",
        skillLevel: "advanced"
      },
      {
        id: '4',
        title: "Welding Technique - TIG Basics",
        duration: "0:25",
        thumbnail: "/api/placeholder/300/200",
        tags: ["Welding", "TIG", "Technique"],
        views: 432,
        author: "Lisa Rodriguez",
        published: "3 days ago",
        machineModel: "Miller Dynasty 350",
        skillLevel: "beginner"
      }
    ];
  };

  const fetchAssignedCourses = async (): Promise<AssignedCourse[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: '1',
        title: "Machine Safety Fundamentals",
        progress: 75,
        totalModules: 8,
        completedModules: 6,
        dueDate: "2024-02-15",
        instructor: "Safety Team",
        status: "in_progress",
        estimatedTime: "2 hours remaining"
      },
      {
        id: '2',
        title: "Advanced CNC Operations",
        progress: 30,
        totalModules: 12,
        completedModules: 4,
        dueDate: "2024-02-28",
        instructor: "Operations Team",
        status: "in_progress",
        estimatedTime: "6 hours remaining"
      },
      {
        id: '3',
        title: "Quality Control Standards",
        progress: 0,
        totalModules: 6,
        completedModules: 0,
        dueDate: "2024-03-10",
        instructor: "Quality Team",
        status: "not_started",
        estimatedTime: "4 hours total"
      }
    ];
  };

  const fetchRecentActivity = async (): Promise<RecentActivity[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: '1',
        type: "completed",
        title: "Completed: CNC Mill Setup - Tool Change",
        time: "2 hours ago",
        icon: <CheckCircle className="h-4 w-4 text-status-green" />,
        metadata: { score: 95, duration: "0:28" }
      },
      {
        id: '2',
        type: "bookmarked",
        title: "Bookmarked: Lathe Safety Check Procedure",
        time: "1 day ago",
        icon: <Bookmark className="h-4 w-4 text-yellow-500" />
      },
      {
        id: '3',
        type: "uploaded",
        title: "Uploaded: New Safety Protocol Video",
        time: "3 days ago",
        icon: <Upload className="h-4 w-4 text-accent-blue" />
      },
      {
        id: '4',
        type: "started",
        title: "Started: Advanced CNC Operations Course",
        time: "5 days ago",
        icon: <Play className="h-4 w-4 text-green-500" />
      }
    ];
  };

  const fetchAnalytics = async (_timeframe: string): Promise<AnalyticsData> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      totalReels: 1247,
      totalCourses: 23,
      completedThisWeek: 45,
      totalViews: 15678,
      completionRate: 78,
      topMachines: [
        { name: "Haas VF-2", count: 45 },
        { name: "Mazak QT-200", count: 32 },
        { name: "Belt Grinder Pro", count: 28 }
      ],
      timeToCompetency: 12, // days
      engagementScore: 8.7
    };
  };

  const handleVoiceSearch = () => {
    setIsVoiceSearchActive(!isVoiceSearchActive);
    // Implement voice search functionality
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Search query:', searchQuery);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-accent-blue text-white';
      case 'completed':
        return 'bg-status-green text-white';
      case 'not_started':
        return 'bg-status-gray text-gray-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Animation */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-primary-text mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'User'}!
          </h2>
          <p className="text-secondary-text">
            Here's what's happening with your training today.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
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
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button className="btn-primary h-20 text-left justify-start w-full">
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
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="outline" className="h-20 text-left justify-start w-full">
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
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="outline" className="h-20 text-left justify-start w-full">
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
            </motion.div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Search Bar */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-primary-text mb-4">Quick Search</h3>
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-text" />
                  <Input
                    placeholder="Search reels, courses, or transcripts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-20 h-12 text-lg"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleVoiceSearch}
                      className={`h-8 w-8 ${isVoiceSearchActive ? 'text-accent-blue' : 'text-secondary-text'}`}
                    >
                      {isVoiceSearchActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </form>
                {searchQuery && (
                  <div className="mt-2 text-sm text-secondary-text">
                    Suggested: "CNC setup", "Safety procedures", "Maintenance"
                  </div>
                )}
              </div>
            </motion.section>

            {/* Recommended Reels */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary-text">Recommended for You</h3>
                <Button variant="ghost" className="text-accent-blue">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {reelsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="card animate-pulse">
                      <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {recommendedReels.map((reel, index) => (
                    <motion.div
                      key={reel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="card card-hover group">
                        <div className="relative overflow-hidden">
                          <img
                            src={reel.thumbnail}
                            alt={reel.title}
                            className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                            {reel.duration}
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-t-lg flex items-center justify-center">
                            <Button size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-6 w-6" />
                            </Button>
                          </div>
                          {reel.skillLevel && (
                            <div className="absolute top-2 left-2">
                              <Badge className={getSkillLevelColor(reel.skillLevel)}>
                                {reel.skillLevel}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-primary-text mb-2 line-clamp-2">
                            {reel.title}
                          </h4>
                          {reel.machineModel && (
                            <p className="text-sm text-secondary-text mb-2">{reel.machineModel}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {reel.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-sm text-secondary-text">
                            <span>{reel.views.toLocaleString()} views</span>
                            <span>{reel.published}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* Assigned Courses */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary-text">Your Assigned Courses</h3>
                <Button variant="ghost" className="text-accent-blue">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {coursesLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="card animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-2 bg-gray-200 rounded mb-2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="card group hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-primary-text">
                                  {course.title}
                                </h4>
                                <Badge className={getStatusColor(course.status)}>
                                  {course.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-secondary-text text-sm mb-2">
                                {course.completedModules} of {course.totalModules} modules completed
                              </p>
                              <p className="text-secondary-text text-sm mb-4">
                                {course.estimatedTime} • Instructor: {course.instructor}
                              </p>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <motion.div
                                  className="bg-accent-blue h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${course.progress}%` }}
                                  transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-sm text-secondary-text">
                                <span>{course.progress}% complete</span>
                                <span>Due: {course.dueDate}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="ml-4">
                              {course.status === 'completed' ? 'Review' : 'Continue'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analytics Snapshot */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-accent-blue" />
                    Analytics Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsLoading ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Total Reels</span>
                        <span className="font-semibold text-primary-text">
                          {analytics.totalReels?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Total Courses</span>
                        <span className="font-semibold text-primary-text">
                          {analytics.totalCourses || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Completed This Week</span>
                        <span className="font-semibold text-primary-text">
                          {analytics.completedThisWeek || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Completion Rate</span>
                        <span className="font-semibold text-status-green">
                          {analytics.completionRate || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Engagement Score</span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-primary-text">
                            {analytics.engagementScore || 0}
                          </span>
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary-text">Time to Competency</span>
                          <span className="font-semibold text-primary-text">
                            {analytics.timeToCompetency || 0} days
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-accent-blue" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <div className="h-4 w-4 bg-gray-200 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start space-x-3"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {activity.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-primary-text">{activity.title}</p>
                            <p className="text-xs text-secondary-text">{activity.time}</p>
                            {activity.metadata?.score && (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Score: {activity.metadata.score}%
                                </Badge>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent-blue" />
                    Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    My Courses
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Bookmark className="h-4 w-4 mr-2" />
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
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}