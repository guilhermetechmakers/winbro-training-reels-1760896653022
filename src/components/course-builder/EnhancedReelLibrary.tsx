import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Video, 
  Clock, 
  User, 
  Calendar,
  Star,
  Plus,
  Grid3X3,
  List,
  SortAsc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reel } from '@/types';

interface EnhancedReelLibraryProps {
  reels: Reel[];
  onAddReel: (reel: Reel) => void;
  addedReelIds: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface FilterState {
  tags: string[];
  skillLevel: string[];
  machineModel: string[];
  processType: string[];
  author: string[];
  dateRange: 'all' | 'week' | 'month' | 'year';
  duration: 'all' | 'short' | 'medium' | 'long';
  status: string[];
}

interface SortOption {
  value: string;
  label: string;
  icon: any;
}

const sortOptions: SortOption[] = [
  { value: 'newest', label: 'Newest First', icon: Calendar },
  { value: 'oldest', label: 'Oldest First', icon: Calendar },
  { value: 'title', label: 'Title A-Z', icon: SortAsc },
  { value: 'duration', label: 'Duration', icon: Clock },
  { value: 'views', label: 'Most Viewed', icon: Star },
  { value: 'relevance', label: 'Relevance', icon: Search },
];

const durationRanges = {
  short: { min: 0, max: 30 },
  medium: { min: 30, max: 120 },
  long: { min: 120, max: Infinity },
};

export default function EnhancedReelLibrary({
  reels,
  onAddReel,
  addedReelIds,
  searchQuery,
  onSearchChange,
}: EnhancedReelLibraryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    skillLevel: [],
    machineModel: [],
    processType: [],
    author: [],
    dateRange: 'all',
    duration: 'all',
    status: [],
  });

  // Extract unique filter options
  const filterOptions = useMemo(() => {
    const tags = new Set<string>();
    const skillLevels = new Set<string>();
    const machineModels = new Set<string>();
    const processTypes = new Set<string>();
    const authors = new Set<string>();
    const statuses = new Set<string>();

    reels.forEach(reel => {
      reel.tags?.forEach(tag => tags.add(tag));
      if (reel.skillLevel) skillLevels.add(reel.skillLevel);
      if (reel.machineModel) machineModels.add(reel.machineModel);
      if (reel.processType) processTypes.add(reel.processType);
      if (reel.author?.fullName) authors.add(reel.author.fullName);
      if (reel.status) statuses.add(reel.status);
    });

    return {
      tags: Array.from(tags).sort(),
      skillLevels: Array.from(skillLevels).sort(),
      machineModels: Array.from(machineModels).sort(),
      processTypes: Array.from(processTypes).sort(),
      authors: Array.from(authors).sort(),
      statuses: Array.from(statuses).sort(),
    };
  }, [reels]);

  // Filter and sort reels
  const filteredReels = useMemo(() => {
    let filtered = reels.filter(reel => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = reel.title.toLowerCase().includes(query);
        const matchesDescription = reel.description?.toLowerCase().includes(query) || false;
        const matchesTags = reel.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
        const matchesMachine = reel.machineModel?.toLowerCase().includes(query) || false;
        const matchesProcess = reel.processType?.toLowerCase().includes(query) || false;
        
        if (!matchesTitle && !matchesDescription && !matchesTags && !matchesMachine && !matchesProcess) {
          return false;
        }
      }

      // Tag filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          reel.tags?.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Skill level filter
      if (filters.skillLevel.length > 0) {
        if (!reel.skillLevel || !filters.skillLevel.includes(reel.skillLevel)) {
          return false;
        }
      }

      // Machine model filter
      if (filters.machineModel.length > 0) {
        if (!reel.machineModel || !filters.machineModel.includes(reel.machineModel)) {
          return false;
        }
      }

      // Process type filter
      if (filters.processType.length > 0) {
        if (!reel.processType || !filters.processType.includes(reel.processType)) {
          return false;
        }
      }

      // Author filter
      if (filters.author.length > 0) {
        if (!reel.author?.fullName || !filters.author.includes(reel.author.fullName)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const reelDate = new Date(reel.createdAt);
        const now = new Date();
        const daysDiff = (now.getTime() - reelDate.getTime()) / (1000 * 60 * 60 * 24);
        
        switch (filters.dateRange) {
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
          case 'year':
            if (daysDiff > 365) return false;
            break;
        }
      }

      // Duration filter
      if (filters.duration !== 'all') {
        const range = durationRanges[filters.duration as keyof typeof durationRanges];
        if (reel.duration < range.min || reel.duration > range.max) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0) {
        if (!reel.status || !filters.status.includes(reel.status)) {
          return false;
        }
      }

      return true;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return a.duration - b.duration;
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'relevance':
        default:
          // Simple relevance scoring based on search query
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const scoreA = getRelevanceScore(a, query);
            const scoreB = getRelevanceScore(b, query);
            return scoreB - scoreA;
          }
          return 0;
      }
    });

    return filtered;
  }, [reels, searchQuery, filters, sortBy]);

  // Calculate relevance score for search
  const getRelevanceScore = (reel: Reel, query: string): number => {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    if (reel.title.toLowerCase().includes(queryLower)) score += 10;
    if (reel.description?.toLowerCase().includes(queryLower)) score += 5;
    if (reel.tags?.some(tag => tag.toLowerCase().includes(queryLower))) score += 3;
    if (reel.machineModel?.toLowerCase().includes(queryLower)) score += 2;
    if (reel.processType?.toLowerCase().includes(queryLower)) score += 2;
    
    return score;
  };

  // Handle filter change
  const handleFilterChange = (filterType: keyof FilterState, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], value]
        : (Array.isArray(prev[filterType]) ? prev[filterType] : []).filter((item: string) => item !== value)
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      tags: [],
      skillLevel: [],
      machineModel: [],
      processType: [],
      author: [],
      dateRange: 'all',
      duration: 'all',
      status: [],
    });
  };

  // Get active filter count
  const activeFilterCount = Object.values(filters).reduce((count, filter) => {
    if (Array.isArray(filter)) {
      return count + filter.length;
    }
    return count + (filter !== 'all' ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-accent-blue" />
                Reel Library
              </CardTitle>
              <CardDescription>
                {filteredReels.length} of {reels.length} reels
                {searchQuery && ` matching "${searchQuery}"`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="relative"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              <div className="flex border border-gray-200 rounded-md">
                <Button
                  onClick={() => setViewMode('grid')}
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-icon-gray" />
                <Input
                  placeholder="Search reels by title, description, tags, machine model..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card className="card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Filters</CardTitle>
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="text-secondary-text"
              >
                Clear all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tags */}
              <div>
                <h4 className="text-sm font-medium text-primary-text mb-2">Tags</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filterOptions.tags.map(tag => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={filters.tags.includes(tag)}
                        onCheckedChange={(checked) => 
                          handleFilterChange('tags', tag, checked as boolean)
                        }
                      />
                      <label htmlFor={`tag-${tag}`} className="text-sm text-secondary-text">
                        {tag}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <h4 className="text-sm font-medium text-primary-text mb-2">Skill Level</h4>
                <div className="space-y-2">
                  {filterOptions.skillLevels.map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${level}`}
                        checked={filters.skillLevel.includes(level)}
                        onCheckedChange={(checked) => 
                          handleFilterChange('skillLevel', level, checked as boolean)
                        }
                      />
                      <label htmlFor={`skill-${level}`} className="text-sm text-secondary-text capitalize">
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Machine Model */}
              <div>
                <h4 className="text-sm font-medium text-primary-text mb-2">Machine Model</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filterOptions.machineModels.map(model => (
                    <div key={model} className="flex items-center space-x-2">
                      <Checkbox
                        id={`model-${model}`}
                        checked={filters.machineModel.includes(model)}
                        onCheckedChange={(checked) => 
                          handleFilterChange('machineModel', model, checked as boolean)
                        }
                      />
                      <label htmlFor={`model-${model}`} className="text-sm text-secondary-text">
                        {model}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Type */}
              <div>
                <h4 className="text-sm font-medium text-primary-text mb-2">Process Type</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filterOptions.processTypes.map(process => (
                    <div key={process} className="flex items-center space-x-2">
                      <Checkbox
                        id={`process-${process}`}
                        checked={filters.processType.includes(process)}
                        onCheckedChange={(checked) => 
                          handleFilterChange('processType', process, checked as boolean)
                        }
                      />
                      <label htmlFor={`process-${process}`} className="text-sm text-secondary-text">
                        {process}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Author */}
              <div>
                <h4 className="text-sm font-medium text-primary-text mb-2">Author</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filterOptions.authors.map(author => (
                    <div key={author} className="flex items-center space-x-2">
                      <Checkbox
                        id={`author-${author}`}
                        checked={filters.author.includes(author)}
                        onCheckedChange={(checked) => 
                          handleFilterChange('author', author, checked as boolean)
                        }
                      />
                      <label htmlFor={`author-${author}`} className="text-sm text-secondary-text">
                        {author}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h4 className="text-sm font-medium text-primary-text mb-2">Date Range</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Time' },
                    { value: 'week', label: 'Last Week' },
                    { value: 'month', label: 'Last Month' },
                    { value: 'year', label: 'Last Year' },
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`date-${option.value}`}
                        checked={filters.dateRange === option.value}
                        onCheckedChange={(checked) => 
                          checked && setFilters(prev => ({ ...prev, dateRange: option.value as any }))
                        }
                      />
                      <label htmlFor={`date-${option.value}`} className="text-sm text-secondary-text">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reels Grid/List */}
      {filteredReels.length > 0 ? (
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        )}>
          {filteredReels.map((reel) => {
            const isAdded = addedReelIds.includes(reel.id);
            
            return (
              <motion.div
                key={reel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  'group cursor-pointer',
                  isAdded && 'opacity-50'
                )}
                onClick={() => !isAdded && onAddReel(reel)}
              >
                <Card className={cn(
                  'card transition-all duration-200',
                  isAdded 
                    ? 'border-green-200 bg-green-50' 
                    : 'hover:shadow-lg'
                )}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {reel.thumbnailUrl ? (
                          <img 
                            src={reel.thumbnailUrl} 
                            alt={reel.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Video className="h-8 w-8 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          {isAdded ? (
                            <Badge className="bg-green-500 text-white">
                              <Plus className="h-3 w-3 mr-1" />
                              Added
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Course
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary-text line-clamp-2">
                          {reel.title}
                        </h4>
                        {reel.description && (
                          <p className="text-sm text-secondary-text line-clamp-2">
                            {reel.description}
                          </p>
                        )}

                        {/* Tags */}
                        {reel.tags && reel.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {reel.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {reel.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{reel.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-secondary-text">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor(reel.duration / 60)}m
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {reel.author?.fullName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="card">
          <CardContent className="text-center py-12">
            <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary-text mb-2">
              No reels found
            </h3>
            <p className="text-secondary-text mb-6">
              {searchQuery || activeFilterCount > 0
                ? 'Try adjusting your search terms or filters'
                : 'Upload some reels to get started'
              }
            </p>
            {(searchQuery || activeFilterCount > 0) && (
              <Button
                onClick={() => {
                  onSearchChange('');
                  clearFilters();
                }}
                variant="outline"
              >
                Clear Search & Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}