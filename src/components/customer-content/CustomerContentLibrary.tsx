import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Grid, 
  List, 
  Star, 
  Clock, 
  Eye, 
  Bookmark,
  Play,
  Download,
  MoreVertical,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useCustomerContent,
  useUserAccessibleContent,
  useRemoveContentFromLibrary,
  useUpdateContentAssignment,
  useTrackContentEvent
} from '@/hooks/useCustomerContent';
import { useAuth } from '@/hooks/useAuth';
import type { CustomerContentSummary, CustomerContentFilter } from '@/types/customer';

interface CustomerContentLibraryProps {
  customerId?: string;
  userId?: string;
  showFilters?: boolean;
  showActions?: boolean;
  onVideoSelect?: (video: CustomerContentSummary) => void;
  onVideoPlay?: (video: CustomerContentSummary) => void;
}

export default function CustomerContentLibrary({
  customerId,
  userId,
  showFilters = true,
  showActions = true,
  onVideoSelect,
  onVideoPlay
}: CustomerContentLibraryProps) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CustomerContentFilter>({
    sort_by: 'display_order',
    sort_order: 'asc',
    limit: 20,
    offset: 0
  });

  // Queries
  const { data: customerContent, isLoading, error } = customerId 
    ? useCustomerContent(customerId, filters)
    : useUserAccessibleContent(userId || user?.id || '', filters);

  // Mutations
  const removeContentMutation = useRemoveContentFromLibrary();
  const updateAssignmentMutation = useUpdateContentAssignment();
  const trackEventMutation = useTrackContentEvent();

  // Filtered content
  const filteredContent = useMemo(() => {
    if (!customerContent) return [];
    
    let filtered = customerContent;
    
    if (searchQuery) {
      filtered = filtered.filter((item: any) => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag: any) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  }, [customerContent, searchQuery]);

  // Handle video actions
  const handleVideoPlay = (video: CustomerContentSummary) => {
    // Track view event
    if (userId || user?.id) {
      trackEventMutation.mutate({
        customer_id: video.customer_id,
        video_id: video.video_id,
        user_id: userId || user?.id,
        event_type: 'view'
      });
    }
    
    onVideoPlay?.(video);
  };

  const handleVideoBookmark = (video: CustomerContentSummary) => {
    // Track bookmark event
    if (userId || user?.id) {
      trackEventMutation.mutate({
        customer_id: video.customer_id,
        video_id: video.video_id,
        user_id: userId || user?.id,
        event_type: 'bookmark'
      });
    }
  };

  const handleVideoDownload = (video: CustomerContentSummary) => {
    // Track download event
    if (userId || user?.id) {
      trackEventMutation.mutate({
        customer_id: video.customer_id,
        video_id: video.video_id,
        user_id: userId || user?.id,
        event_type: 'download'
      });
    }
  };

  const handleToggleFeatured = (video: CustomerContentSummary) => {
    updateAssignmentMutation.mutate({
      id: video.library_id,
      updates: {
        is_featured: !video.is_featured
      }
    });
  };

  const handleRemoveFromLibrary = (video: CustomerContentSummary) => {
    removeContentMutation.mutate({
      customerId: video.customer_id,
      videoId: video.video_id
    });
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-blue" />
            <span className="text-secondary-text">Loading content...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-primary-text mb-2">Error Loading Content</h3>
          <p className="text-secondary-text">Failed to load customer content library</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!filteredContent || (filteredContent as any[]).length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-primary-text mb-2">No Content Found</h3>
          <p className="text-secondary-text mb-4">
            {searchQuery ? 'No content matches your search.' : 'This customer library is empty.'}
          </p>
          {showActions && (
            <Button className="bg-accent-blue hover:bg-accent-blue/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-text">Content Library</h2>
          <p className="text-secondary-text">
            {(filteredContent as any[]).length} content item{(filteredContent as any[]).length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-icon-gray" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={filters.sort_by}
            onValueChange={(value) => setFilters(prev => ({ ...prev, sort_by: value as any }))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="display_order">Display Order</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
              <SelectItem value="created_at">Date Added</SelectItem>
              <SelectItem value="view_count">Most Viewed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sort_order}
            onValueChange={(value) => setFilters(prev => ({ ...prev, sort_order: value as any }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Content Grid/List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }
      >
        {(filteredContent as any[]).map((video: any) => (
          <motion.div
            key={video.video_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardHeader className="p-0">
                <div className="relative">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                      <Play className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-black hover:bg-gray-100"
                      onClick={() => handleVideoPlay(video)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                  </div>

                  {/* Featured badge */}
                  {video.is_featured && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* Access level badge */}
                  <div className="absolute top-2 right-2">
                    <Badge 
                      variant="outline" 
                      className={
                        video.access_level === 'premium' 
                          ? 'border-yellow-500 text-yellow-600'
                          : video.access_level === 'exclusive'
                          ? 'border-purple-500 text-purple-600'
                          : 'border-gray-300 text-gray-600'
                      }
                    >
                      {video.access_level}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-primary-text line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-sm text-secondary-text line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-secondary-text">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(video.duration)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {video.view_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-4 w-4" />
                      {video.bookmark_count}
                    </div>
                  </div>

                  {/* Tags */}
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {video.tags.slice(0, 3).map((tag: any, index: any) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {video.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{video.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Machine info */}
                  {video.machine_model && (
                    <div className="text-sm text-secondary-text">
                      <span className="font-medium">Machine:</span> {video.machine_model}
                    </div>
                  )}

                  {/* Actions */}
                  {showActions && (
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVideoBookmark(video)}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVideoDownload(video)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onVideoSelect?.(video)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleFeatured(video)}>
                            {video.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRemoveFromLibrary(video)}
                            className="text-red-600"
                          >
                            Remove from Library
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
