/**
 * Content Library page with integrated search functionality
 * Generated: 2024-12-13T18:00:00Z
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  SearchBar, 
  FilterSidebar, 
  SearchResultsGrid 
} from '@/components/search';
import { useSearch } from '@/hooks/useSearch';
import { 
  Filter, 
  Upload, 
  X,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchSuggestion } from '@/types/search';

export default function ContentLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    searchState,
    search,
    setQuery,
    setFilters,
    setSort,
    setPage,
    // setLimit,
    // clearSearch,
    resetFilters,
    trackClick
  } = useSearch();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle search
  const handleSearch = useCallback(() => {
    search();
  }, [search]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.suggestion_type === 'tag') {
      const currentTags = searchState.filters.tags || [];
      const newTags = currentTags.includes(suggestion.suggestion_value)
        ? currentTags
        : [...currentTags, suggestion.suggestion_value];
      setFilters({ tags: newTags });
    } else {
      setQuery(suggestion.suggestion_value);
    }
    handleSearch();
  }, [searchState.filters.tags, setFilters, setQuery, handleSearch]);

  // Handle result click
  const handleResultClick = useCallback(async (result: any, position: number) => {
    await trackClick(result.video_id, position);
    navigate(`/video/${result.video_id}`);
  }, [navigate, trackClick]);

  // Handle sort change
  const handleSortChange = useCallback((sortBy: any, sortOrder: any) => {
    setSort(sortBy, sortOrder);
    handleSearch();
  }, [setSort, handleSearch]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setPage(page);
    handleSearch();
  }, [setPage, handleSearch]);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((filters: any) => {
    setFilters(filters);
    handleSearch();
  }, [setFilters, handleSearch]);

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    resetFilters();
    handleSearch();
  }, [resetFilters, handleSearch]);

  // Initialize search with URL query
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== searchState.query) {
      setQuery(urlQuery);
      search({ query: urlQuery });
    }
  }, [searchParams, searchState.query, setQuery, search]);

  // Auto-search when filters change
  useEffect(() => {
    if (searchState.query || Object.keys(searchState.filters).length > 0) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300); // Debounce search
      return () => clearTimeout(timeoutId);
    }
  }, [searchState.query, searchState.filters, handleSearch]);

  return (
    <div className="min-h-screen bg-main-bg">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="md:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-primary-text">Content Library</h1>
                <p className="text-secondary-text mt-1">Discover and manage training reels and courses</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {searchState.facets.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {searchState.facets.length}
                  </Badge>
                )}
              </Button>
              <Button 
                onClick={() => navigate('/upload')}
                className="btn-primary"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New Reel
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Search and Filters */}
          <div className="flex-1 space-y-6">
            {/* Search Bar */}
            <div className="space-y-4">
              <SearchBar
                query={searchState.query}
                onQueryChange={setQuery}
                onSearch={handleSearch}
                onSuggestionClick={handleSuggestionClick}
                placeholder="Search reels, courses, or transcripts..."
                autoFocus={!isMobile}
              />
              
              {/* Active Filters */}
              {Object.keys(searchState.filters).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {searchState.filters.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => handleFilterChange({ 
                          tags: searchState.filters.tags?.filter(t => t !== tag) 
                        })}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {searchState.filters.machine_model && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Machine: {searchState.filters.machine_model}
                      <button
                        onClick={() => handleFilterChange({ machine_model: undefined })}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {searchState.filters.process_type && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Process: {searchState.filters.process_type}
                      <button
                        onClick={() => handleFilterChange({ process_type: undefined })}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {searchState.filters.skill_level && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Skill: {searchState.filters.skill_level}
                      <button
                        onClick={() => handleFilterChange({ skill_level: undefined })}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-secondary-text hover:text-primary-text"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            {/* Search Results */}
            <SearchResultsGrid
              results={searchState.results}
              loading={searchState.loading}
              error={searchState.error?.message || null}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              sortBy={searchState.sort_by}
              sortOrder={searchState.sort_order}
              onSortChange={handleSortChange}
              pagination={searchState.pagination}
              onPageChange={handlePageChange}
              onResultClick={handleResultClick}
            />
          </div>

          {/* Filter Sidebar */}
          <div className={cn(
            "lg:w-80",
            showFilters ? "block" : "hidden lg:block"
          )}>
            <FilterSidebar
              filters={searchState.filters}
              facets={searchState.facets}
              onFiltersChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && isMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
            <FilterSidebar
              filters={searchState.filters}
              facets={searchState.facets}
              onFiltersChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              isOpen={showFilters}
              onToggle={() => setShowFilters(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
