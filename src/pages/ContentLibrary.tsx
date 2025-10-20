/**
 * Enhanced Content Library page with modern design patterns
 * Generated: 2024-12-13T18:00:00Z
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  SearchBar, 
  FilterSidebar, 
  SearchResultsGrid
} from '@/components/search';
import { useSearch } from '@/hooks/useSearch';
import { 
  Upload, 
  X,
  ArrowLeft,
  Grid3X3,
  BookOpen,
  PlayCircle,
  BookmarkPlus,
  Tag,
  Building,
  Wrench,
  User,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchSuggestion } from '@/types/search';

export default function ContentLibrary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'reels' | 'courses' | 'bookmarks'>('all');

  const {
    searchState,
    search,
    setQuery,
    setFilters,
    setSort,
    setPage,
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

  // Handle item selection
  const handleItemSelect = useCallback((itemId: string, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedItems(searchState.results.map(result => result.video_id));
    } else {
      setSelectedItems([]);
    }
  }, [searchState.results]);

  // Handle bulk action
  const handleBulkAction = useCallback((action: string) => {
    console.log(`Bulk action: ${action} on items:`, selectedItems);
    // Implement bulk actions here
    setSelectedItems([]);
    setShowBulkActions(false);
  }, [selectedItems]);

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

  // Show bulk actions when items are selected
  useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  // Filter results based on active tab
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return searchState.results;
    if (activeTab === 'bookmarks') {
      // Filter for bookmarked items (this would need to be implemented in the search)
      return searchState.results.filter(result => result.bookmark_count > 0);
    }
    // For reels and courses, we'd need to distinguish between them
    return searchState.results;
  }, [searchState.results, activeTab]);

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchState.filters.tags?.length) count += searchState.filters.tags.length;
    if (searchState.filters.machine_model) count++;
    if (searchState.filters.process_type) count++;
    if (searchState.filters.skill_level) count++;
    if (searchState.filters.status) count++;
    if (searchState.filters.visibility) count++;
    if (searchState.filters.duration_range) count++;
    if (searchState.filters.date_range?.start || searchState.filters.date_range?.end) count++;
    return count;
  }, [searchState.filters]);

  return (
    <div className="min-h-screen bg-main-bg">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
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
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
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
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Search and Tabs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Search Bar */}
              <SearchBar
                query={searchState.query}
                onQueryChange={setQuery}
                onSearch={handleSearch}
                onSuggestionClick={handleSuggestionClick}
                placeholder="Search reels, courses, or transcripts..."
                autoFocus={!isMobile}
              />
              
              {/* Content Type Tabs */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all" className="flex items-center space-x-2">
                    <Grid3X3 className="h-4 w-4" />
                    <span>All Content</span>
                  </TabsTrigger>
                  <TabsTrigger value="reels" className="flex items-center space-x-2">
                    <PlayCircle className="h-4 w-4" />
                    <span>Reels</span>
                  </TabsTrigger>
                  <TabsTrigger value="courses" className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Courses</span>
                  </TabsTrigger>
                  <TabsTrigger value="bookmarks" className="flex items-center space-x-2">
                    <BookmarkPlus className="h-4 w-4" />
                    <span>Bookmarks</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Active Filters */}
              <AnimatePresence>
                {Object.keys(searchState.filters).length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2"
                  >
                    {searchState.filters.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
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
                        <Building className="h-3 w-3" />
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
                        <Wrench className="h-3 w-3" />
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
                        <User className="h-3 w-3" />
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
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Search Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SearchResultsGrid
                results={filteredResults}
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
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
                onSelectAll={handleSelectAll}
                showBulkActions={showBulkActions}
                onBulkAction={handleBulkAction}
              />
            </motion.div>
          </div>

          {/* Filter Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "w-full lg:w-80",
              showFilters ? "block" : "hidden lg:block"
            )}
          >
            <FilterSidebar
              filters={searchState.filters}
              facets={searchState.facets}
              onFiltersChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />
          </motion.div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      <AnimatePresence>
        {showFilters && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl"
            >
              <FilterSidebar
                filters={searchState.filters}
                facets={searchState.facets}
                onFiltersChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                isOpen={showFilters}
                onToggle={() => setShowFilters(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}