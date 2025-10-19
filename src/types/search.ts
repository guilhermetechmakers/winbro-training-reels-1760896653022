/**
 * Search-related types for Winbro Training Reels
 * Generated: 2024-12-13T18:00:00Z
 */

// Search suggestion types
export type SearchSuggestionType = 'tag' | 'machine_model' | 'process_type' | 'tooling' | 'author' | 'title';

// Search query types
export type SearchQueryType = 'text' | 'filter' | 'faceted' | 'autocomplete';

// Sort options for search results
export type SearchSortBy = 'relevance' | 'created_at' | 'view_count' | 'title';
export type SearchSortOrder = 'ASC' | 'DESC';

// Search filters interface
export interface SearchFilters {
  query?: string;
  tags?: string[];
  machine_model?: string;
  process_type?: string;
  tooling?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  status?: 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected';
  visibility?: 'private' | 'public' | 'organization';
  author_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  duration_range?: {
    min: number; // in seconds
    max: number; // in seconds
  };
}

// Search result with highlighting
export interface SearchResult {
  video_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration: number;
  tags: string[];
  machine_model: string | null;
  process_type: string | null;
  tooling: string | null;
  skill_level: string | null;
  author_id: string;
  view_count: number;
  bookmark_count: number;
  created_at: string;
  relevance_score: number;
  highlight?: {
    title?: string;
    description?: string;
    transcript?: string;
  };
}

// Search suggestion
export interface SearchSuggestion {
  suggestion_type: SearchSuggestionType;
  suggestion_value: string;
  usage_count: number;
  similarity_score: number;
}

// Search facet (for faceted search)
export interface SearchFacet {
  facet_type: string;
  facet_value: string;
  facet_count: number;
}

// Search analytics entry
export interface SearchAnalytics {
  id: string;
  user_id: string | null;
  query: string;
  query_type: SearchQueryType;
  filters: Record<string, any>;
  result_count: number;
  execution_time_ms: number;
  clicked_result_id: string | null;
  clicked_result_position: number | null;
  session_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Search index entry (database table)
export interface SearchIndex {
  id: string;
  video_id: string;
  title: string;
  description: string | null;
  tags: string[];
  machine_model: string | null;
  process_type: string | null;
  tooling: string | null;
  skill_level: string | null;
  search_vector: string | null;
  title_vector: string | null;
  description_vector: string | null;
  tags_vector: string | null;
  transcript_vector: string | null;
  status: string;
  visibility: string;
  customer_scope: string[];
  author_id: string;
  view_count: number;
  bookmark_count: number;
  duration: number;
  created_at: string;
  updated_at: string;
}

// Search pagination
export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Complete search response
export interface SearchResponse {
  results: SearchResult[];
  facets: SearchFacet[];
  pagination: SearchPagination;
  suggestions?: SearchSuggestion[];
  execution_time_ms: number;
  query: string;
  filters: SearchFilters;
}

// Search API request parameters
export interface SearchRequest {
  query?: string;
  filters?: SearchFilters;
  sort_by?: SearchSortBy;
  sort_order?: SearchSortOrder;
  page?: number;
  limit?: number;
  include_facets?: boolean;
  include_suggestions?: boolean;
}

// Search autocomplete request
export interface AutocompleteRequest {
  query: string;
  types?: SearchSuggestionType[];
  limit?: number;
}

// Search autocomplete response
export interface AutocompleteResponse {
  suggestions: SearchSuggestion[];
  query: string;
  execution_time_ms: number;
}

// Search analytics request
export interface SearchAnalyticsRequest {
  query: string;
  query_type: SearchQueryType;
  filters: Record<string, any>;
  result_count: number;
  execution_time_ms: number;
  clicked_result_id?: string;
  clicked_result_position?: number;
  session_id?: string;
}

// Search index update request (for syncing video data)
export interface SearchIndexUpdateRequest {
  video_id: string;
  title: string;
  description?: string | null;
  tags?: string[];
  machine_model?: string | null;
  process_type?: string | null;
  tooling?: string | null;
  skill_level?: string | null;
  status?: string;
  visibility?: string;
  customer_scope?: string[];
  author_id: string;
  view_count?: number;
  bookmark_count?: number;
  duration: number;
}

// Search performance metrics
export interface SearchMetrics {
  total_queries: number;
  average_execution_time: number;
  most_searched_terms: Array<{
    term: string;
    count: number;
  }>;
  popular_filters: Array<{
    filter_type: string;
    filter_value: string;
    count: number;
  }>;
  click_through_rate: number;
  zero_result_rate: number;
}

// Search configuration
export interface SearchConfig {
  max_query_length: number;
  min_query_length: number;
  max_results_per_page: number;
  default_results_per_page: number;
  max_suggestions: number;
  enable_fuzzy_search: boolean;
  enable_highlighting: boolean;
  enable_facets: boolean;
  enable_analytics: boolean;
  cache_ttl_seconds: number;
}

// Search error types
export interface SearchError {
  code: 'INVALID_QUERY' | 'RATE_LIMITED' | 'INDEX_ERROR' | 'PERMISSION_DENIED' | 'UNKNOWN_ERROR';
  message: string;
  details?: Record<string, any>;
}

// Search state for UI components
export interface SearchState {
  query: string;
  filters: SearchFilters;
  sort_by: SearchSortBy;
  sort_order: SearchSortOrder;
  page: number;
  limit: number;
  results: SearchResult[];
  facets: SearchFacet[];
  suggestions: SearchSuggestion[];
  loading: boolean;
  error: SearchError | null;
  pagination: SearchPagination | null;
  last_search_time: number | null;
}

// Search action types for state management
export type SearchAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'SET_SORT'; payload: { sort_by: SearchSortBy; sort_order: SearchSortOrder } }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_LIMIT'; payload: number }
  | { type: 'SET_RESULTS'; payload: SearchResult[] }
  | { type: 'SET_FACETS'; payload: SearchFacet[] }
  | { type: 'SET_SUGGESTIONS'; payload: SearchSuggestion[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: SearchError | null }
  | { type: 'SET_PAGINATION'; payload: SearchPagination }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'RESET_FILTERS' };

// Search hook return type
export interface UseSearchReturn {
  // State
  searchState: SearchState;
  
  // Actions
  search: (request?: Partial<SearchRequest>) => Promise<void>;
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setSort: (sort_by: SearchSortBy, sort_order: SearchSortOrder) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  clearSearch: () => void;
  resetFilters: () => void;
  
  // Autocomplete
  getSuggestions: (query: string) => Promise<SearchSuggestion[]>;
  
  // Analytics
  trackSearch: (analytics: SearchAnalyticsRequest) => Promise<void>;
  trackClick: (result_id: string, position: number) => Promise<void>;
}
