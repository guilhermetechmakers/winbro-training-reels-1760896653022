/**
 * React Query hooks for search functionality
 * Generated: 2024-12-13T18:00:00Z
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useReducer, useMemo } from 'react';
import { toast } from 'sonner';
import {
  searchVideos,
  getSearchSuggestions,
  trackSearchClick,
  updateSearchIndex,
  removeFromSearchIndex,
  getSearchMetrics,
  syncVideosToSearchIndex,
  clearSearchAnalytics
} from '@/api/search';
import type {
  SearchRequest,
  SearchSuggestion,
  SearchFilters,
  SearchSortBy,
  SearchSortOrder,
  SearchState,
  SearchAction,
  UseSearchReturn,
  SearchIndexUpdateRequest
} from '@/types/search';

// Search state reducer
function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_SORT':
      return { ...state, sort_by: action.payload.sort_by, sort_order: action.payload.sort_order };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_LIMIT':
      return { ...state, limit: action.payload };
    case 'SET_RESULTS':
      return { ...state, results: action.payload };
    case 'SET_FACETS':
      return { ...state, facets: action.payload };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PAGINATION':
      return { ...state, pagination: action.payload };
    case 'CLEAR_SEARCH':
      return {
        ...state,
        query: '',
        results: [],
        facets: [],
        suggestions: [],
        pagination: null,
        error: null,
        page: 1
      };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: {},
        page: 1
      };
    default:
      return state;
  }
}

// Initial search state
const initialSearchState: SearchState = {
  query: '',
  filters: {},
  sort_by: 'relevance',
  sort_order: 'DESC',
  page: 1,
  limit: 20,
  results: [],
  facets: [],
  suggestions: [],
  loading: false,
  error: null,
  pagination: null,
  last_search_time: null
};

/**
 * Main search hook with state management
 */
export function useSearch(): UseSearchReturn {
  const [searchState, dispatch] = useReducer(searchReducer, initialSearchState);
  // const queryClient = useQueryClient();

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (request: Partial<SearchRequest> = {}) => {
      const searchRequest: SearchRequest = {
        query: searchState.query,
        filters: searchState.filters,
        sort_by: searchState.sort_by,
        sort_order: searchState.sort_order,
        page: searchState.page,
        limit: searchState.limit,
        include_facets: true,
        include_suggestions: false,
        ...request
      };

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const response = await searchVideos(searchRequest);
        
        dispatch({ type: 'SET_RESULTS', payload: response.results });
        dispatch({ type: 'SET_FACETS', payload: response.facets });
        dispatch({ type: 'SET_PAGINATION', payload: response.pagination });
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        return response;
      } catch (error) {
        const searchError = {
          code: 'UNKNOWN_ERROR' as const,
          message: error instanceof Error ? error.message : 'Search failed',
          details: { error }
        };
        dispatch({ type: 'SET_ERROR', payload: searchError });
        dispatch({ type: 'SET_LOADING', payload: false });
        throw error;
      }
    }
  });

  // Suggestions query
  const suggestionsQuery = useQuery({
    queryKey: ['search-suggestions', searchState.query],
    queryFn: async () => {
      if (!searchState.query || searchState.query.length < 2) {
        return { suggestions: [], query: searchState.query, execution_time_ms: 0 };
      }
      return getSearchSuggestions({
        query: searchState.query,
        types: ['tag', 'machine_model', 'process_type', 'tooling', 'author', 'title'],
        limit: 10
      });
    },
    enabled: searchState.query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Actions
  const search = useCallback(async (request: Partial<SearchRequest> = {}) => {
    try {
      await searchMutation.mutateAsync(request);
    } catch (error) {
      toast.error('Search failed. Please try again.');
    }
  }, [searchMutation]);

  const setQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  }, []);

  const setFilters = useCallback((filters: Partial<SearchFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
    dispatch({ type: 'SET_PAGE', payload: 1 }); // Reset to first page when filters change
  }, []);

  const setSort = useCallback((sort_by: SearchSortBy, sort_order: SearchSortOrder) => {
    dispatch({ type: 'SET_SORT', payload: { sort_by, sort_order } });
  }, []);

  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const setLimit = useCallback((limit: number) => {
    dispatch({ type: 'SET_LIMIT', payload: limit });
    dispatch({ type: 'SET_PAGE', payload: 1 }); // Reset to first page when limit changes
  }, []);

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const getSuggestions = useCallback(async (query: string): Promise<SearchSuggestion[]> => {
    try {
      const response = await getSearchSuggestions({
        query,
        types: ['tag', 'machine_model', 'process_type', 'tooling', 'author', 'title'],
        limit: 10
      });
      return response.suggestions;
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }, []);

  const trackSearch = useCallback(async () => {
    // This is handled automatically by the search API
  }, []);

  const trackClick = useCallback(async (resultId: string, position: number) => {
    try {
      await trackSearchClick(resultId, position, searchState.query);
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  }, [searchState.query]);

  // Update suggestions when query changes
  useMemo(() => {
    if (suggestionsQuery.data) {
      dispatch({ type: 'SET_SUGGESTIONS', payload: suggestionsQuery.data.suggestions });
    }
  }, [suggestionsQuery.data]);

  return {
    searchState,
    search,
    setQuery,
    setFilters,
    setSort,
    setPage,
    setLimit,
    clearSearch,
    resetFilters,
    getSuggestions,
    trackSearch,
    trackClick
  };
}

/**
 * Hook for search suggestions only
 */
export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return { suggestions: [], query, execution_time_ms: 0 };
      }
      return getSearchSuggestions({
        query,
        types: ['tag', 'machine_model', 'process_type', 'tooling', 'author', 'title'],
        limit: 10
      });
    },
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
}

/**
 * Hook for search metrics (admin)
 */
export function useSearchMetrics() {
  return useQuery({
    queryKey: ['search-metrics'],
    queryFn: getSearchMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
}

/**
 * Hook for updating search index
 */
export function useUpdateSearchIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: SearchIndexUpdateRequest) => {
      return updateSearchIndex(update);
    },
    onSuccess: () => {
      // Invalidate search queries to refresh results
      queryClient.invalidateQueries({ queryKey: ['search'] });
      toast.success('Search index updated');
    },
    onError: (error) => {
      console.error('Failed to update search index:', error);
      toast.error('Failed to update search index');
    }
  });
}

/**
 * Hook for removing from search index
 */
export function useRemoveFromSearchIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      return removeFromSearchIndex(videoId);
    },
    onSuccess: () => {
      // Invalidate search queries to refresh results
      queryClient.invalidateQueries({ queryKey: ['search'] });
      toast.success('Removed from search index');
    },
    onError: (error) => {
      console.error('Failed to remove from search index:', error);
      toast.error('Failed to remove from search index');
    }
  });
}

/**
 * Hook for syncing videos to search index (admin)
 */
export function useSyncSearchIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncVideosToSearchIndex,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['search'] });
      toast.success(`Synced ${result.synced} videos to search index${result.errors > 0 ? ` (${result.errors} errors)` : ''}`);
    },
    onError: (error) => {
      console.error('Failed to sync search index:', error);
      toast.error('Failed to sync search index');
    }
  });
}

/**
 * Hook for clearing search analytics (admin)
 */
export function useClearSearchAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearSearchAnalytics,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-metrics'] });
      toast.success('Search analytics cleared');
    },
    onError: (error) => {
      console.error('Failed to clear search analytics:', error);
      toast.error('Failed to clear search analytics');
    }
  });
}

/**
 * Hook for tracking search clicks
 */
export function useTrackSearchClick() {
  return useMutation({
    mutationFn: async ({ resultId, position, query }: { resultId: string; position: number; query: string }) => {
      return trackSearchClick(resultId, position, query);
    },
    onError: (error) => {
      console.error('Failed to track search click:', error);
    }
  });
}
