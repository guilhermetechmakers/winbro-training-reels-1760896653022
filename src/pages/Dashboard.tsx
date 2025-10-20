import { useState } from 'react';
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
  Mic,
  MicOff,
  BarChart3,
  Zap,
  Bookmark,
  History,
  Settings,
  Eye,
  Share2,
  MoreHorizontal,
  Calendar,
  Target,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData, useActivityTracking } from '@/hooks/useDashboard';
import { useSearch, useSearchSuggestions } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';
import type { 
  AnalyticsData
} from '@/types/dashboard';
import type { 
  SearchSuggestion 
} from '@/types/search';

// Types are now imported from @/types/dashboard

export default function Dashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTimeframe] = useState<'week' | 'month' | 'quarter'>('week');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Use the new dashboard hooks
  const { 
    analytics, 
    recommendedReels, 
    assignedCourses, 
    recentActivities, 
    isLoading
  } = useDashboardData(user?.id || '', selectedTimeframe);

  const { data: searchSuggestionsData } = useSearchSuggestions(searchQuery);
  const { trackSearch } = useActivityTracking();
  const { search: performSearch } = useSearch();
  
  const searchSuggestions = searchSuggestionsData?.suggestions || [];

  // Data is now fetched through the useDashboardData hook

  // Mock data for fallback when API is not available
  const mockAnalytics: AnalyticsData = {
    totalReels: 1247,
    totalCourses: 23,
    completedThisWeek: 45,
    totalViews: 15678,
    completionRate: 78,
    topMachines: [
      { name: "Haas VF-2", count: 45, trend: "up" },
      { name: "Mazak QT-200", count: 32, trend: "stable" },
      { name: "Belt Grinder Pro", count: 28, trend: "down" },
      { name: "Miller Dynasty 350", count: 22, trend: "up" }
    ],
    timeToCompetency: 12,
    engagementScore: 8.7,
    weeklyProgress: [
      { day: "Mon", completed: 8, total: 12 },
      { day: "Tue", completed: 12, total: 15 },
      { day: "Wed", completed: 6, total: 10 },
      { day: "Thu", completed: 15, total: 18 },
      { day: "Fri", completed: 9, total: 14 },
      { day: "Sat", completed: 4, total: 8 },
      { day: "Sun", completed: 2, total: 5 }
    ],
    skillDistribution: [
      { skill: "Safety", count: 45, percentage: 35 },
      { skill: "CNC Operations", count: 32, percentage: 25 },
      { skill: "Quality Control", count: 28, percentage: 22 },
      { skill: "Maintenance", count: 23, percentage: 18 }
    ],
    recentTrends: {
      views: 12,
      completionRate: 5,
      newContent: 8
    }
  };

  const handleVoiceSearch = () => {
    setIsVoiceSearchActive(!isVoiceSearchActive);
    // Implement voice search functionality
    if (!isVoiceSearchActive) {
      // Start voice recognition
      console.log('Starting voice search...');
    } else {
      // Stop voice recognition
      console.log('Stopping voice search...');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && user?.id) {
      setIsSearching(true);
      try {
        // Track search activity
        trackSearch(user.id, searchQuery);
        // Perform search using the search hook
        await performSearch({ query: searchQuery });
        // Navigate to content library with search results
        window.location.href = `/content-library?q=${encodeURIComponent(searchQuery)}`;
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length > 2);
  };

  const handleSuggestionClick = async (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.suggestion_value);
    setShowSuggestions(false);
    // Track search activity
    if (user?.id) {
      trackSearch(user.id, suggestion.suggestion_value);
    }
    // Navigate to content library with the suggestion
    window.location.href = `/content-library?q=${encodeURIComponent(suggestion.suggestion_value)}`;
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
        {/* Welcome Section with Enhanced Animation */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-primary-text mb-2">
                Welcome back, {user?.user_metadata?.full_name || 'User'}! 👋
              </h2>
              <p className="text-secondary-text text-lg">
                Here's what's happening with your training today.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-secondary-text">Today's Progress</p>
                <p className="text-2xl font-bold text-primary-text">
                  {analytics.data?.completed_this_period || mockAnalytics.completedThisWeek || 0} completed
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-blue-600 rounded-full flex items-center justify-center">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions - Enhanced with better design */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-primary-text">Quick Actions</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="hover:bg-accent-blue/10">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="hover:bg-accent-blue/10"
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group"
            >
              <Button className="btn-primary h-24 text-left justify-start w-full group-hover:shadow-xl group-hover:shadow-accent-blue/25">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-4 rounded-xl group-hover:bg-white/30 transition-colors">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Upload New Reel</div>
                    <div className="text-sm opacity-90">Capture a new training video</div>
                  </div>
                </div>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group"
            >
              <Button variant="outline" className="h-24 text-left justify-start w-full group-hover:border-accent-blue group-hover:bg-accent-blue/5">
                <div className="flex items-center space-x-4">
                  <div className="bg-accent-blue/10 p-4 rounded-xl group-hover:bg-accent-blue/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-accent-blue" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Create Course</div>
                    <div className="text-sm text-secondary-text">Build a structured training course</div>
                  </div>
                </div>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group"
            >
              <Button variant="outline" className="h-24 text-left justify-start w-full group-hover:border-accent-blue group-hover:bg-accent-blue/5">
                <div className="flex items-center space-x-4">
                  <div className="bg-accent-blue/10 p-4 rounded-xl group-hover:bg-accent-blue/20 transition-colors">
                    <TrendingUp className="h-6 w-6 text-accent-blue" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">View Analytics</div>
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
            {/* Enhanced Quick Search Bar */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-primary-text mb-4">Quick Search</h3>
                <div className="relative">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-text" />
                    <Input
                      placeholder="Search reels, courses, or transcripts..."
                      value={searchQuery}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      className="pl-12 pr-24 h-14 text-lg border-2 focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/20"
                      onFocus={() => setShowSuggestions(searchQuery.length > 2)}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleVoiceSearch}
                        className={`h-10 w-10 ${isVoiceSearchActive ? 'text-accent-blue bg-accent-blue/10' : 'text-secondary-text hover:bg-accent-blue/10'}`}
                      >
                        {isVoiceSearchActive ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!searchQuery.trim() || isSearching}
                        className="h-10 px-4"
                      >
                        {isSearching ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          'Search'
                        )}
                      </Button>
                    </div>
                  </form>
                  
                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto"
                    >
                      {searchSuggestions.map((suggestion) => (
                        <button
                          key={`${suggestion.suggestion_type}-${suggestion.suggestion_value}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
                            <span className="text-primary-text">{suggestion.suggestion_value}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.suggestion_type.replace('_', ' ')}
                            </Badge>
                            {suggestion.usage_count && (
                              <span className="text-xs text-secondary-text">
                                {suggestion.usage_count}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
                
                {/* Search Tips */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-sm text-secondary-text">Popular searches:</span>
                  {["CNC setup", "Safety procedures", "Maintenance", "Welding basics"].map((tip) => (
                    <button
                      key={tip}
                      onClick={() => handleSearchInputChange(tip)}
                      className="text-sm text-accent-blue hover:text-accent-blue/80 hover:underline"
                    >
                      {tip}
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Enhanced Recommended Reels */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-primary-text">Recommended for You</h3>
                  <p className="text-sm text-secondary-text mt-1">Based on your role and recent activity</p>
                </div>
                <Button variant="ghost" className="text-accent-blue hover:bg-accent-blue/10">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="card animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <CardContent className="p-4">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                        <div className="flex space-x-2 mb-3">
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {(recommendedReels.data || []).map((reel: any, index: number) => (
                    <motion.div
                      key={reel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="card card-hover group relative overflow-hidden">
                        <div className="relative overflow-hidden">
                          <img
                            src={reel.thumbnail}
                            alt={reel.title}
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-3 right-3 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {reel.duration}
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-t-lg flex items-center justify-center">
                            <Button 
                              size="icon" 
                              className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white text-accent-blue h-12 w-12"
                            >
                              <Play className="h-6 w-6 ml-1" />
                            </Button>
                          </div>
                          {reel.skillLevel && (
                            <div className="absolute top-3 left-3">
                              <Badge className={cn("text-xs font-medium", getSkillLevelColor(reel.skillLevel))}>
                                {reel.skillLevel}
                              </Badge>
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3">
                            <Badge className={cn(
                              "text-xs font-medium",
                              reel.status === 'published' ? 'bg-status-green text-white' : 'bg-status-gray text-gray-700'
                            )}>
                              {reel.status}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h4 className="font-semibold text-primary-text mb-2 line-clamp-2 group-hover:text-accent-blue transition-colors">
                            {reel.title}
                          </h4>
                          {reel.machineModel && (
                            <p className="text-sm text-secondary-text mb-2 flex items-center">
                              <Settings className="h-4 w-4 mr-1" />
                              {reel.machineModel}
                            </p>
                          )}
                          {reel.description && (
                            <p className="text-sm text-secondary-text mb-3 line-clamp-2">
                              {reel.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {reel.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs hover:bg-accent-blue/10 hover:text-accent-blue cursor-pointer">
                                {tag}
                              </Badge>
                            ))}
                            {reel.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{reel.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm text-secondary-text mb-3">
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {reel.views.toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {reel.published}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Bookmark className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button size="sm" className="bg-accent-blue hover:bg-accent-blue/90">
                              Watch
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* Enhanced Assigned Courses */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-primary-text">Your Assigned Courses</h3>
                  <p className="text-sm text-secondary-text mt-1">Continue your learning journey</p>
                </div>
                <Button variant="ghost" className="text-accent-blue hover:bg-accent-blue/10">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="card animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-2 bg-gray-200 rounded mb-2"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(assignedCourses.data || []).map((course: any, index: number) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="card group hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            {/* Course Thumbnail */}
                            <div className="relative">
                              <img
                                src={course.thumbnail || "/api/placeholder/80/80"}
                                alt={course.title}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                              {course.certificate && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <Award className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-primary-text group-hover:text-accent-blue transition-colors">
                                      {course.title}
                                    </h4>
                                    <Badge className={cn("text-xs font-medium", getStatusColor(course.status))}>
                                      {course.status.replace('_', ' ')}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {course.difficulty}
                                    </Badge>
                                  </div>
                                  {course.description && (
                                    <p className="text-sm text-secondary-text mb-2 line-clamp-2">
                                      {course.description}
                                    </p>
                                  )}
                                  <p className="text-sm text-secondary-text mb-2">
                                    {course.completedModules} of {course.totalModules} modules completed
                                  </p>
                                  <p className="text-sm text-secondary-text mb-3">
                                    {course.estimatedTime} • Instructor: {course.instructor}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-sm text-secondary-text mb-1">
                                  <span>Progress</span>
                                  <span>{course.progress}% complete</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <motion.div
                                    className="bg-gradient-to-r from-accent-blue to-blue-600 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${course.progress}%` }}
                                    transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-secondary-text">
                                  <span className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Due: {course.dueDate}
                                  </span>
                                  {course.certificate && (
                                    <span className="flex items-center text-yellow-600">
                                      <Award className="h-4 w-4 mr-1" />
                                      Certificate
                                    </span>
                                  )}
                                </div>
                                <Button 
                                  variant={course.status === 'completed' ? 'outline' : 'default'}
                                  size="sm"
                                  className={cn(
                                    course.status === 'completed' 
                                      ? 'hover:bg-accent-blue hover:text-white' 
                                      : 'bg-accent-blue hover:bg-accent-blue/90'
                                  )}
                                >
                                  {course.status === 'completed' ? 'Review' : 'Continue'}
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>
                            </div>
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
            {/* Enhanced Analytics Snapshot */}
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
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(6)].map((_, i) => (
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
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary-text">
                            {(analytics.data?.total_reels || mockAnalytics.totalReels)?.toLocaleString() || 0}
                          </span>
                          {mockAnalytics.recentTrends?.newContent && (
                            <span className="text-xs text-status-green flex items-center">
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              +{mockAnalytics.recentTrends.newContent}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Total Courses</span>
                        <span className="font-semibold text-primary-text">
                          {analytics.data?.total_courses || mockAnalytics.totalCourses || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Completed This Week</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary-text">
                            {analytics.data?.completed_this_period || mockAnalytics.completedThisWeek || 0}
                          </span>
                          {mockAnalytics.recentTrends?.completionRate && (
                            <span className="text-xs text-status-green flex items-center">
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              +{mockAnalytics.recentTrends.completionRate}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Completion Rate</span>
                        <span className="font-semibold text-status-green">
                          {analytics.data?.completion_rate || mockAnalytics.completionRate || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Engagement Score</span>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-primary-text">
                            {analytics.data?.engagement_score || mockAnalytics.engagementScore || 0}
                          </span>
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-secondary-text">Time to Competency</span>
                          <span className="font-semibold text-primary-text">
                            {mockAnalytics.timeToCompetency || 0} days
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary-text">Total Views</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary-text">
                              {(analytics.data?.total_views || mockAnalytics.totalViews)?.toLocaleString() || 0}
                            </span>
                            {mockAnalytics.recentTrends?.views && (
                              <span className="text-xs text-status-green flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +{mockAnalytics.recentTrends.views}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Recent Activity */}
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
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
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
                      {(recentActivities.data || []).map((activity: any, index: number) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start space-x-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-4 w-4 bg-accent-blue rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-primary-text group-hover:text-accent-blue transition-colors">
                              {activity.activity_type || 'Activity'}
                            </p>
                            <p className="text-xs text-secondary-text">{new Date(activity.created_at).toLocaleDateString()}</p>
                            {activity.metadata?.score && (
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Score: {activity.metadata.score}%
                                </Badge>
                                {activity.metadata.duration && (
                                  <span className="text-xs text-secondary-text">
                                    {activity.metadata.duration}
                                  </span>
                                )}
                              </div>
                            )}
                            {activity.metadata?.totalQuestions && (
                              <div className="mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {activity.metadata.score}/{activity.metadata.totalQuestions} correct
                                </Badge>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-secondary-text opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Machines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent-blue" />
                    Top Machines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mockAnalytics.topMachines?.slice(0, 4).map((machine) => (
                        <div key={machine.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
                            <span className="text-sm text-primary-text">{machine.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-primary-text">
                              {machine.count}
                            </span>
                            {machine.trend === 'up' && (
                              <ArrowUpRight className="h-3 w-3 text-status-green" />
                            )}
                            {machine.trend === 'down' && (
                              <ArrowDownRight className="h-3 w-3 text-red-500" />
                            )}
                            {machine.trend === 'stable' && (
                              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            )}
                          </div>
                        </div>
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
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-accent-blue" />
                    Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start hover:bg-accent-blue/10 hover:text-accent-blue">
                    <BookOpen className="h-4 w-4 mr-2" />
                    My Courses
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-accent-blue/10 hover:text-accent-blue">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmarks
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-accent-blue/10 hover:text-accent-blue">
                    <Clock className="h-4 w-4 mr-2" />
                    Recent
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-accent-blue/10 hover:text-accent-blue">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover:bg-accent-blue/10 hover:text-accent-blue">
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