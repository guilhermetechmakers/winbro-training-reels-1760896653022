/**
 * Enhanced SearchResultsGrid component for displaying search results
 * Generated: 2024-12-13T18:00:00Z
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Eye, 
  Star, 
  Grid, 
  List, 
  ChevronLeft,
  ChevronRight,
  BookmarkPlus,
  Share2,
  Download,
  MoreHorizontal,
  PlayCircle,
  Tag,
  Building,
  Wrench,
  User,
  Calendar,
  RefreshCw,
  Edit,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { TranscriptPreview } from './TranscriptPreview';
import type { SearchResult, SearchSortBy, SearchSortOrder } from '@/types/search';

interface SearchResultsGridProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sortBy: SearchSortBy;
  sortOrder: SearchSortOrder;
  onSortChange: (sortBy: SearchSortBy, sortOrder: SearchSortOrder) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  } | null;
  onPageChange: (page: number) => void;
  onResultClick: (result: SearchResult, position: number) => void;
  selectedItems?: string[];
  onItemSelect?: (itemId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  showBulkActions?: boolean;
  onBulkAction?: (action: string) => void;
  infiniteScroll?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'created_at', label: 'Date Created' },
  { value: 'view_count', label: 'Most Viewed' },
  { value: 'title', label: 'Title' }
];

export function SearchResultsGrid({
  results,
  loading,
  error,
  viewMode,
  onViewModeChange,
  sortBy,
  sortOrder,
  onSortChange,
  pagination,
  onPageChange,
  onResultClick,
  selectedItems = [],
  onItemSelect,
  onSelectAll,
  infiniteScroll = false,
  onLoadMore,
  hasMore = false,
  className
}: SearchResultsGridProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [SearchSortBy, SearchSortOrder];
    onSortChange(newSortBy, newSortOrder);
  };

  const getSortValue = () => {
    return `${sortBy}-${sortOrder}`;
  };

  const handleItemSelect = (itemId: string, selected: boolean) => {
    onItemSelect?.(itemId, selected);
  };

  const handleSelectAll = (selected: boolean) => {
    onSelectAll?.(selected);
  };


  const handleShowTranscript = (videoId: string) => {
    setShowTranscriptPreview(videoId);
  };

  const handlePlayAtTime = (timeInSeconds: number) => {
    // This would be handled by the parent component
    console.log('Play at time:', timeInSeconds);
  };

  const isItemSelected = (itemId: string) => {
    return selectedItems.includes(itemId);
  };

  const allItemsSelected = results.length > 0 && results.every(result => selectedItems.includes(result.video_id));
  const [showTranscriptPreview, setShowTranscriptPreview] = useState<string | null>(null);

  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-primary-text mb-2">Search Error</h3>
          <p className="text-secondary-text mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Loading Skeleton */}
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-24 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12", className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-primary-text mb-2">No results found</h3>
          <p className="text-secondary-text">Try adjusting your search terms or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Results Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
      >
        <div className="flex items-center space-x-4">
          {/* Select All Checkbox */}
          {onSelectAll && (
            <Checkbox
              checked={allItemsSelected}
              onCheckedChange={handleSelectAll}
              className="mr-2"
            />
          )}
          
          <h2 className="text-lg font-semibold text-primary-text">
            {pagination?.total || results.length} results
            {selectedItems.length > 0 && (
              <span className="text-sm text-secondary-text ml-2">
                ({selectedItems.length} selected)
              </span>
            )}
          </h2>
          
          <div className="flex items-center space-x-2">
            <Select value={getSortValue()} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32 sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <React.Fragment key={option.value}>
                    <SelectItem value={`${option.value}-ASC`}>
                      {option.label} (A-Z)
                    </SelectItem>
                    <SelectItem value={`${option.value}-DESC`}>
                      {option.label} (Z-A)
                    </SelectItem>
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="flex items-center space-x-1"
          >
            <Grid className="h-4 w-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="flex items-center space-x-1"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </Button>
          
          {/* Infinite Scroll Toggle */}
          {onLoadMore && (
            <Button
              variant={infiniteScroll ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                // Toggle infinite scroll mode
                if (infiniteScroll) {
                  // Switch to pagination
                } else {
                  // Switch to infinite scroll
                }
              }}
              className="flex items-center space-x-1 hidden sm:flex"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">
                {infiniteScroll ? 'Pagination' : 'Infinite Scroll'}
              </span>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Results Grid/List */}
      <motion.div 
        layout
        className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" 
            : "space-y-3 sm:space-y-4"
        }
      >
        <AnimatePresence>
          {results.map((result, index) => (
            <motion.div
              key={result.video_id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className={cn(
                  "card card-hover cursor-pointer group relative",
                  isItemSelected(result.video_id) && "ring-2 ring-accent-blue ring-opacity-50"
                )}
                onClick={() => onResultClick(result, index)}
              >
                {/* Selection Checkbox */}
                {onItemSelect && (
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={isItemSelected(result.video_id)}
                      onCheckedChange={(checked) => handleItemSelect(result.video_id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white/90 backdrop-blur-sm"
                    />
                  </div>
                )}

                {/* Action Menu */}
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white/90 backdrop-blur-sm hover:bg-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <BookmarkPlus className="h-4 w-4 mr-2" />
                        Bookmark
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {viewMode === 'grid' ? (
                  <>
                    <div className="relative">
                      <img
                        src={result.thumbnail_url || '/api/placeholder/300/200'}
                        alt={result.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-12 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {formatDuration(result.duration)}
                      </div>
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-t-lg flex items-center justify-center">
                        <Button size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm">
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                      
                      {/* Content Type Badge */}
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Reel
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-primary-text mb-2 line-clamp-2 group-hover:text-accent-blue transition-colors">
                        {result.highlight?.title ? (
                          <span dangerouslySetInnerHTML={{ __html: result.highlight.title }} />
                        ) : (
                          result.title
                        )}
                      </h3>
                      
                      {result.highlight?.description && (
                        <p className="text-sm text-secondary-text mb-3 line-clamp-2">
                          <span dangerouslySetInnerHTML={{ __html: result.highlight.description }} />
                        </p>
                      )}

                      {/* Metadata Row */}
                      <div className="flex items-center space-x-2 mb-3 text-xs text-secondary-text">
                        {result.machine_model && (
                          <div className="flex items-center space-x-1">
                            <Building className="h-3 w-3" />
                            <span>{result.machine_model}</span>
                          </div>
                        )}
                        {result.process_type && (
                          <div className="flex items-center space-x-1">
                            <Wrench className="h-3 w-3" />
                            <span>{result.process_type}</span>
                          </div>
                        )}
                        {result.skill_level && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span className="capitalize">{result.skill_level}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {result.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {result.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{result.tags.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between text-sm text-secondary-text">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{result.view_count}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>{result.bookmark_count}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {result.highlight?.transcript && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleShowTranscript(result.video_id);
                              }}
                              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Search className="h-3 w-3 mr-1" />
                              Transcript
                            </Button>
                          )}
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(result.created_at)}</span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
              </>
                  ) : (
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={result.thumbnail_url || '/api/placeholder/300/200'}
                          alt={result.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary-text mb-2 group-hover:text-accent-blue transition-colors">
                            {result.highlight?.title ? (
                              <span dangerouslySetInnerHTML={{ __html: result.highlight.title }} />
                            ) : (
                              result.title
                            )}
                          </h3>
                          
                          {result.highlight?.description && (
                            <p className="text-sm text-secondary-text mb-3 line-clamp-2">
                              <span dangerouslySetInnerHTML={{ __html: result.highlight.description }} />
                            </p>
                          )}

                          {/* Metadata Row */}
                          <div className="flex items-center space-x-4 mb-3 text-xs text-secondary-text">
                            {result.machine_model && (
                              <div className="flex items-center space-x-1">
                                <Building className="h-3 w-3" />
                                <span>{result.machine_model}</span>
                              </div>
                            )}
                            {result.process_type && (
                              <div className="flex items-center space-x-1">
                                <Wrench className="h-3 w-3" />
                                <span>{result.process_type}</span>
                              </div>
                            )}
                            {result.skill_level && (
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span className="capitalize">{result.skill_level}</span>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {result.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Stats Row */}
                          <div className="flex items-center space-x-4 text-sm text-secondary-text">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDuration(result.duration)}
                            </span>
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {result.view_count} views
                            </span>
                            <span className="flex items-center">
                              <Star className="h-4 w-4 mr-1" />
                              {result.bookmark_count} bookmarks
                            </span>
                            {result.highlight?.transcript && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  handleShowTranscript(result.video_id);
                                }}
                                className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Search className="h-3 w-3 mr-1" />
                                Transcript
                              </Button>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(result.created_at)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      {/* Pagination or Load More */}
      {!infiniteScroll && pagination && pagination.total_pages > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-1 sm:space-x-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.has_prev}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(3, pagination.total_pages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={page === pagination.page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="w-8 h-8 p-0 text-xs sm:text-sm"
                >
                  {page}
                </Button>
              );
            })}
            {pagination.total_pages > 3 && (
              <span className="text-sm text-secondary-text px-2">...</span>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.has_next}
            className="flex items-center space-x-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Infinite Scroll Load More */}
      {infiniteScroll && hasMore && onLoadMore && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-blue"></div>
                <span>Loading more...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Load More</span>
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Transcript Preview Modal */}
      <AnimatePresence>
        {showTranscriptPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setShowTranscriptPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <TranscriptPreview
                transcript={results.find(r => r.video_id === showTranscriptPreview)?.highlight?.transcript || ''}
                highlights={[]}
                searchQuery={''}
                onPlayAtTime={handlePlayAtTime}
                onClose={() => setShowTranscriptPreview(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchResultsGrid;
