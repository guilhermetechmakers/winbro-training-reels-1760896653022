/**
 * SearchResultsGrid component for displaying search results
 * Generated: 2024-12-13T18:00:00Z
 */

import React from 'react';
import { 
  Play, 
  Clock, 
  Eye, 
  Star, 
  Grid, 
  List, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-primary-text">
            {pagination?.total || results.length} results
          </h2>
          <div className="flex items-center space-x-2">
            <Select value={getSortValue()} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
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
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "space-y-4"
      }>
        {results.map((result, index) => (
          <Card 
            key={result.video_id} 
            className="card card-hover animate-fade-in-up cursor-pointer"
            onClick={() => onResultClick(result, index)}
          >
            {viewMode === 'grid' ? (
              <>
                <div className="relative">
                  <img
                    src={result.thumbnail_url || '/api/placeholder/300/200'}
                    alt={result.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {formatDuration(result.duration)}
                  </div>
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-t-lg flex items-center justify-center">
                    <Button size="icon" className="opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-primary-text mb-2 line-clamp-2">
                    {result.highlight?.title ? (
                      <span dangerouslySetInnerHTML={{ __html: result.highlight.title }} />
                    ) : (
                      result.title
                    )}
                  </h3>
                  {result.highlight?.description && (
                    <p className="text-sm text-secondary-text mb-2 line-clamp-2">
                      <span dangerouslySetInnerHTML={{ __html: result.highlight.description }} />
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {result.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {result.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{result.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-secondary-text">
                    <span>{result.view_count} views</span>
                    <span>{formatDate(result.created_at)}</span>
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
                    <h3 className="font-semibold text-primary-text mb-2">
                      {result.highlight?.title ? (
                        <span dangerouslySetInnerHTML={{ __html: result.highlight.title }} />
                      ) : (
                        result.title
                      )}
                    </h3>
                    {result.highlight?.description && (
                      <p className="text-sm text-secondary-text mb-2 line-clamp-2">
                        <span dangerouslySetInnerHTML={{ __html: result.highlight.description }} />
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {result.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
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
                      <span>{formatDate(result.created_at)}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.has_prev}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={page === pagination.page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.has_next}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default SearchResultsGrid;
