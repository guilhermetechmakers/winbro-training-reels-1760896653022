/**
 * Search API functions for Winbro Training Reels
 * Generated: 2024-12-13T18:00:00Z
 */

import { supabase } from '@/lib/supabase';
import type {
  SearchRequest,
  SearchResponse,
  SearchResult,
  SearchFacet,
  SearchSuggestion,
  AutocompleteRequest,
  AutocompleteResponse,
  SearchAnalyticsRequest,
  SearchIndexUpdateRequest,
  SearchMetrics
} from '@/types/search';

/**
 * Search videos with full-text search and faceted filtering
 */
export async function searchVideos(request: SearchRequest = {}): Promise<SearchResponse> {
  try {
    const {
      query = '',
      filters = {},
      sort_by = 'relevance',
      sort_order = 'DESC',
      page = 1,
      limit = 20,
      include_facets = true,
      include_suggestions = false
    } = request;

    const startTime = Date.now();
    const offset = (page - 1) * limit;

    // Prepare filter parameters
    const filterParams = {
      search_query: query,
      filter_tags: filters.tags || [],
      filter_machine_model: filters.machine_model || null,
      filter_process_type: filters.process_type || null,
      filter_skill_level: filters.skill_level || null,
      filter_status: filters.status || 'published',
      filter_visibility: filters.visibility || null,
      filter_author_id: filters.author_id || null,
      filter_date_from: filters.date_range?.start || null,
      filter_date_to: filters.date_range?.end || null,
      filter_duration_min: filters.duration_range?.min || null,
      filter_duration_max: filters.duration_range?.max || null,
      sort_by,
      sort_order,
      limit_count: limit,
      offset_count: offset
    };

    // Execute search query
    const { data: searchResults, error: searchError } = await supabase.rpc('search_videos', filterParams);

    if (searchError) {
      throw new Error(`Search failed: ${searchError.message}`);
    }

    const executionTime = Date.now() - startTime;

    // Get facets if requested
    let facets: SearchFacet[] = [];
    if (include_facets) {
      const { data: facetData, error: facetError } = await supabase.rpc('get_search_facets', filterParams);
      if (!facetError && facetData) {
        facets = facetData.map((facet: any) => ({
          facet_type: facet.facet_type,
          facet_value: facet.facet_value,
          facet_count: Number(facet.facet_count)
        }));
      }
    }

    // Get suggestions if requested
    let suggestions: SearchSuggestion[] = [];
    if (include_suggestions && query.length > 0) {
      const { data: suggestionData, error: suggestionError } = await supabase.rpc('get_search_suggestions', {
        query_text: query,
        suggestion_types: ['tag', 'machine_model', 'process_type', 'tooling', 'author', 'title'],
        limit_count: 10
      });
      if (!suggestionError && suggestionData) {
        suggestions = suggestionData.map((suggestion: any) => ({
          suggestion_type: suggestion.suggestion_type,
          suggestion_value: suggestion.suggestion_value,
          usage_count: suggestion.usage_count,
          similarity_score: suggestion.similarity_score
        }));
      }
    }

    // Transform results
    const results: SearchResult[] = (searchResults || []).map((result: any) => ({
      video_id: result.video_id,
      title: result.title,
      description: result.description,
      thumbnail_url: result.thumbnail_url,
      duration: result.duration,
      tags: result.tags || [],
      machine_model: result.machine_model,
      process_type: result.process_type,
      tooling: result.tooling,
      skill_level: result.skill_level,
      author_id: result.author_id,
      view_count: result.view_count,
      bookmark_count: result.bookmark_count,
      created_at: result.created_at,
      relevance_score: result.relevance_score,
      highlight: {
        title: result.highlight_title,
        description: result.highlight_description,
        transcript: result.highlight_transcript
      }
    }));

    // Calculate pagination
    const total = results.length; // This is approximate since we don't have total count from the function
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1
    };

    // Track search analytics
    await trackSearchAnalytics({
      query,
      query_type: 'text',
      filters: filters as Record<string, any>,
      result_count: results.length,
      execution_time_ms: executionTime
    });

    return {
      results,
      facets,
      pagination,
      suggestions,
      execution_time_ms: executionTime,
      query,
      filters
    };

  } catch (error) {
    console.error('Search error:', error);
    throw new Error(error instanceof Error ? error.message : 'Search failed');
  }
}

/**
 * Get search suggestions for autocomplete
 */
export async function getSearchSuggestions(request: AutocompleteRequest): Promise<AutocompleteResponse> {
  try {
    const { query, types = ['tag', 'machine_model', 'process_type', 'tooling', 'author', 'title'], limit = 10 } = request;

    const startTime = Date.now();

    const { data, error } = await supabase.rpc('get_search_suggestions', {
      query_text: query,
      suggestion_types: types,
      limit_count: limit
    });

    if (error) {
      throw new Error(`Suggestions failed: ${error.message}`);
    }

    const executionTime = Date.now() - startTime;

    const suggestions: SearchSuggestion[] = (data || []).map((suggestion: any) => ({
      suggestion_type: suggestion.suggestion_type,
      suggestion_value: suggestion.suggestion_value,
      usage_count: suggestion.usage_count,
      similarity_score: suggestion.similarity_score
    }));

    return {
      suggestions,
      query,
      execution_time_ms: executionTime
    };

  } catch (error) {
    console.error('Suggestions error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get suggestions');
  }
}

/**
 * Track search analytics
 */
export async function trackSearchAnalytics(analytics: SearchAnalyticsRequest): Promise<void> {
  try {
    const { error } = await supabase
      .from('search_analytics')
      .insert({
        query: analytics.query,
        query_type: analytics.query_type,
        filters: analytics.filters,
        result_count: analytics.result_count,
        execution_time_ms: analytics.execution_time_ms,
        clicked_result_id: analytics.clicked_result_id || null,
        clicked_result_position: analytics.clicked_result_position || null,
        session_id: analytics.session_id || null
      });

    if (error) {
      console.error('Analytics tracking error:', error);
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

/**
 * Track search result clicks
 */
export async function trackSearchClick(resultId: string, position: number, query: string): Promise<void> {
  try {
    await trackSearchAnalytics({
      query,
      query_type: 'text',
      filters: {},
      result_count: 0,
      execution_time_ms: 0,
      clicked_result_id: resultId,
      clicked_result_position: position
    });
  } catch (error) {
    console.error('Click tracking error:', error);
  }
}

/**
 * Update search index for a video
 */
export async function updateSearchIndex(update: SearchIndexUpdateRequest): Promise<void> {
  try {
    const { error } = await supabase
      .from('search_index')
      .upsert({
        video_id: update.video_id,
        title: update.title,
        description: update.description,
        tags: update.tags || [],
        machine_model: update.machine_model,
        process_type: update.process_type,
        tooling: update.tooling,
        skill_level: update.skill_level,
        status: update.status || 'published',
        visibility: update.visibility || 'public',
        customer_scope: update.customer_scope || [],
        author_id: update.author_id,
        view_count: update.view_count || 0,
        bookmark_count: update.bookmark_count || 0,
        duration: update.duration
      }, {
        onConflict: 'video_id'
      });

    if (error) {
      throw new Error(`Search index update failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Search index update error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update search index');
  }
}

/**
 * Remove video from search index
 */
export async function removeFromSearchIndex(videoId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('search_index')
      .delete()
      .eq('video_id', videoId);

    if (error) {
      throw new Error(`Search index removal failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Search index removal error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to remove from search index');
  }
}

/**
 * Get search metrics and analytics
 */
export async function getSearchMetrics(): Promise<SearchMetrics> {
  try {
    // Get total queries
    const { count: totalQueries } = await supabase
      .from('search_analytics')
      .select('*', { count: 'exact', head: true });

    // Get average execution time
    const { data: avgTimeData } = await supabase
      .from('search_analytics')
      .select('execution_time_ms')
      .not('execution_time_ms', 'is', null);

    const averageExecutionTime = avgTimeData && avgTimeData.length > 0
      ? avgTimeData.reduce((sum, item) => sum + item.execution_time_ms, 0) / avgTimeData.length
      : 0;

    // Get most searched terms
    const { data: termsData } = await supabase
      .from('search_analytics')
      .select('query')
      .not('query', 'eq', '');

    const termCounts: Record<string, number> = {};
    termsData?.forEach(item => {
      termCounts[item.query] = (termCounts[item.query] || 0) + 1;
    });

    const mostSearchedTerms = Object.entries(termCounts)
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get popular filters
    const { data: filtersData } = await supabase
      .from('search_analytics')
      .select('filters')
      .not('filters', 'is', null);

    const filterCounts: Record<string, Record<string, number>> = {};
    filtersData?.forEach(item => {
      Object.entries(item.filters).forEach(([key, value]) => {
        if (!filterCounts[key]) filterCounts[key] = {};
        filterCounts[key][String(value)] = (filterCounts[key][String(value)] || 0) + 1;
      });
    });

    const popularFilters = Object.entries(filterCounts)
      .flatMap(([filterType, values]) =>
        Object.entries(values).map(([filterValue, count]) => ({
          filter_type: filterType,
          filter_value: filterValue,
          count
        }))
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate click-through rate
    const { count: totalClicks } = await supabase
      .from('search_analytics')
      .select('*', { count: 'exact', head: true })
      .not('clicked_result_id', 'is', null);

    const clickThroughRate = totalQueries ? (totalClicks || 0) / totalQueries : 0;

    // Calculate zero result rate
    const { count: zeroResults } = await supabase
      .from('search_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('result_count', 0);

    const zeroResultRate = totalQueries ? (zeroResults || 0) / totalQueries : 0;

    return {
      total_queries: totalQueries || 0,
      average_execution_time: averageExecutionTime,
      most_searched_terms: mostSearchedTerms,
      popular_filters: popularFilters,
      click_through_rate: clickThroughRate,
      zero_result_rate: zeroResultRate
    };

  } catch (error) {
    console.error('Search metrics error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get search metrics');
  }
}

/**
 * Sync all videos to search index
 */
export async function syncVideosToSearchIndex(): Promise<{ synced: number; errors: number }> {
  try {
    // Get all published videos
    const { data: videos, error: videosError } = await supabase
      .from('videos')
      .select(`
        id,
        title,
        description,
        duration,
        tags,
        machine_model,
        process_type,
        tooling,
        skill_level,
        status,
        visibility,
        customer_scope,
        user_id,
        view_count,
        bookmark_count,
        created_at
      `)
      .eq('status', 'published');

    if (videosError) {
      throw new Error(`Failed to fetch videos: ${videosError.message}`);
    }

    let synced = 0;
    let errors = 0;

    // Update search index for each video
    for (const video of videos || []) {
      try {
        await updateSearchIndex({
          video_id: video.id,
          title: video.title,
          description: video.description,
          tags: video.tags || [],
          machine_model: video.machine_model,
          process_type: video.process_type,
          tooling: video.tooling,
          skill_level: video.skill_level,
          status: video.status,
          visibility: video.visibility,
          customer_scope: video.customer_scope || [],
          author_id: video.user_id,
          view_count: video.view_count || 0,
          bookmark_count: video.bookmark_count || 0,
          duration: video.duration
        });
        synced++;
      } catch (error) {
        console.error(`Failed to sync video ${video.id}:`, error);
        errors++;
      }
    }

    return { synced, errors };

  } catch (error) {
    console.error('Sync error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to sync videos to search index');
  }
}

/**
 * Clear search analytics (admin function)
 */
export async function clearSearchAnalytics(): Promise<void> {
  try {
    const { error } = await supabase
      .from('search_analytics')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
      throw new Error(`Failed to clear analytics: ${error.message}`);
    }
  } catch (error) {
    console.error('Clear analytics error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to clear search analytics');
  }
}
