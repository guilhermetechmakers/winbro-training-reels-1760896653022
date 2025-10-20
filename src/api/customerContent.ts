/**
 * Customer Content API service for Winbro Training Reels
 * Handles customer-specific content management and segregation
 */

import { supabase } from '@/lib/supabase';
import type { 
  Customer,
  CustomerInsert,
  CustomerUpdate,
  CustomerSubscription,
  CustomerSubscriptionInsert,
  CustomerSubscriptionUpdate,
  CustomerContentLibrary,
  CustomerContentLibraryUpdate,
  CustomerMachine,
  CustomerMachineInsert,
  CustomerMachineUpdate,
  CustomerContentAnalytics,
  CustomerContentSummary,
  CustomerAnalyticsSummary,
  CustomerContentFilter,
  ContentAssignmentRequest,
  BulkContentAssignment,
  ContentAnalyticsEvent,
  CustomerDashboardStats,
  CustomerContentSearchResult,
  CustomerContentSearchResponse
} from '@/types/customer';

/**
 * Customer Content API class with all customer content operations
 */
export class CustomerContentAPI {
  // =====================================================
  // CUSTOMER MANAGEMENT
  // =====================================================

  /**
   * Create a new customer
   */
  static async createCustomer(customer: CustomerInsert): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get customer by ID
   */
  static async getCustomer(id: string): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all customers with pagination
   */
  static async getCustomers(
    page = 1,
    limit = 20,
    filters: {
      status?: string;
      subscription_tier?: string;
      search?: string;
    } = {}
  ): Promise<{ customers: Customer[]; total: number }> {
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.subscription_tier) {
      query = query.eq('subscription_tier', filters.subscription_tier);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: customers, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      customers: customers || [],
      total: count || 0
    };
  }

  /**
   * Update customer
   */
  static async updateCustomer(id: string, updates: CustomerUpdate): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete customer
   */
  static async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // =====================================================
  // CUSTOMER SUBSCRIPTIONS
  // =====================================================

  /**
   * Create customer subscription
   */
  static async createSubscription(subscription: CustomerSubscriptionInsert): Promise<CustomerSubscription> {
    const { data, error } = await supabase
      .from('customer_subscriptions')
      .insert(subscription)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get customer subscription
   */
  static async getCustomerSubscription(customerId: string): Promise<CustomerSubscription | null> {
    const { data, error } = await supabase
      .from('customer_subscriptions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Update customer subscription
   */
  static async updateSubscription(id: string, updates: CustomerSubscriptionUpdate): Promise<CustomerSubscription> {
    const { data, error } = await supabase
      .from('customer_subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // =====================================================
  // CUSTOMER CONTENT LIBRARY
  // =====================================================

  /**
   * Get customer's content library
   */
  static async getCustomerContent(
    customerId: string,
    filters: CustomerContentFilter = {}
  ): Promise<CustomerContentSummary[]> {
    let query = supabase
      .from('customer_content_summary')
      .select('*')
      .eq('customer_id', customerId);

    // Apply filters
    if (filters.machine_model) {
      query = query.eq('machine_model', filters.machine_model);
    }

    if (filters.process_type) {
      query = query.eq('process_type', filters.process_type);
    }

    if (filters.tooling) {
      query = query.eq('tooling', filters.tooling);
    }

    if (filters.skill_level) {
      query = query.eq('skill_level', filters.skill_level);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters.access_level) {
      query = query.eq('access_level', filters.access_level);
    }

    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }

    if (filters.assignment_type) {
      query = query.eq('assignment_type', filters.assignment_type);
    }

    if (filters.search_query) {
      query = query.or(`title.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`);
    }

    if (filters.date_from) {
      query = query.gte('assigned_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('assigned_at', filters.date_to);
    }

    // Apply sorting
    const sortBy = filters.sort_by || 'display_order';
    const sortOrder = filters.sort_order || 'asc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (filters.limit) {
      const offset = filters.offset || 0;
      query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Assign content to customer
   */
  static async assignContent(assignment: ContentAssignmentRequest): Promise<CustomerContentLibrary[]> {
    const assignments = assignment.video_ids.map(videoId => ({
      customer_id: assignment.customer_id,
      video_id: videoId,
      assigned_by: assignment.assigned_by,
      assignment_type: assignment.assignment_type,
      assignment_reason: assignment.assignment_reason,
      is_featured: assignment.is_featured || false,
      access_level: assignment.access_level || 'standard',
      expires_at: assignment.expires_at
    }));

    const { data, error } = await supabase
      .from('customer_content_libraries')
      .insert(assignments)
      .select();

    if (error) throw error;
    return data || [];
  }

  /**
   * Bulk assign content to multiple customers
   */
  static async bulkAssignContent(bulkAssignment: BulkContentAssignment): Promise<{
    successful: CustomerContentLibrary[];
    failed: Array<{ video_id: string; error: string }>;
  }> {
    const results = {
      successful: [] as CustomerContentLibrary[],
      failed: [] as Array<{ video_id: string; error: string }>
    };

    for (const assignment of bulkAssignment.assignments) {
      try {
        const assigned = await this.assignContent(assignment);
        results.successful.push(...assigned);
      } catch (error) {
        assignment.video_ids.forEach(videoId => {
          results.failed.push({
            video_id: videoId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        });
      }
    }

    // Auto-assign content based on machine models if requested
    if (bulkAssignment.auto_assign_by_machines) {
      for (const assignment of bulkAssignment.assignments) {
        try {
          await this.autoAssignContentByMachines(assignment.customer_id);
        } catch (error) {
          console.error(`Auto-assignment failed for customer ${assignment.customer_id}:`, error);
        }
      }
    }

    return results;
  }

  /**
   * Update content assignment
   */
  static async updateContentAssignment(
    id: string,
    updates: CustomerContentLibraryUpdate
  ): Promise<CustomerContentLibrary> {
    const { data, error } = await supabase
      .from('customer_content_libraries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove content from customer library
   */
  static async removeContentFromLibrary(
    customerId: string,
    videoId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('customer_content_libraries')
      .delete()
      .eq('customer_id', customerId)
      .eq('video_id', videoId);

    if (error) throw error;
  }

  /**
   * Auto-assign content based on customer's machine models
   */
  static async autoAssignContentByMachines(customerId: string): Promise<number> {
    const { data, error } = await supabase
      .rpc('auto_assign_content_by_machines', {
        p_customer_id: customerId
      });

    if (error) throw error;
    return data || 0;
  }

  // =====================================================
  // CUSTOMER MACHINES
  // =====================================================

  /**
   * Get customer's machines
   */
  static async getCustomerMachines(customerId: string): Promise<CustomerMachine[]> {
    const { data, error } = await supabase
      .from('customer_machines')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Add machine to customer
   */
  static async addMachine(machine: CustomerMachineInsert): Promise<CustomerMachine> {
    const { data, error } = await supabase
      .from('customer_machines')
      .insert(machine)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update machine
   */
  static async updateMachine(id: string, updates: CustomerMachineUpdate): Promise<CustomerMachine> {
    const { data, error } = await supabase
      .from('customer_machines')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete machine
   */
  static async deleteMachine(id: string): Promise<void> {
    const { error } = await supabase
      .from('customer_machines')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // =====================================================
  // CUSTOMER CONTENT ANALYTICS
  // =====================================================

  /**
   * Track content analytics event
   */
  static async trackContentEvent(event: ContentAnalyticsEvent): Promise<CustomerContentAnalytics> {
    const { data, error } = await supabase
      .from('customer_content_analytics')
      .insert({
        customer_id: event.customer_id,
        video_id: event.video_id,
        user_id: event.user_id,
        event_type: event.event_type,
        event_data: event.event_data || {},
        session_id: event.session_id,
        ip_address: event.ip_address,
        user_agent: event.user_agent
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get customer content analytics
   */
  static async getCustomerAnalytics(customerId: string): Promise<CustomerAnalyticsSummary[]> {
    const { data, error } = await supabase
      .from('customer_analytics_summary')
      .select('*')
      .eq('customer_id', customerId)
      .order('last_activity', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get customer dashboard stats
   */
  static async getCustomerDashboardStats(customerId: string): Promise<CustomerDashboardStats> {
    // Get content library count
    const { count: totalVideos } = await supabase
      .from('customer_content_libraries')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId);

    // Get featured videos count
    const { count: featuredVideos } = await supabase
      .from('customer_content_libraries')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('is_featured', true);

    // Get analytics summary
    const analytics = await this.getCustomerAnalytics(customerId);

    // Get machine models
    const machines = await this.getCustomerMachines(customerId);
    const machineModels = [...new Set(machines.map(m => m.machine_model))];

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('customer_content_analytics')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate totals
    const totalViews = analytics.reduce((sum, a) => sum + a.view_count, 0);
    const totalDownloads = analytics.reduce((sum, a) => sum + a.download_count, 0);
    const totalBookmarks = analytics.reduce((sum, a) => sum + a.bookmark_count, 0);
    const totalCompletions = analytics.reduce((sum, a) => sum + a.completion_count, 0);
    const completionRate = totalViews > 0 ? totalCompletions / totalViews : 0;

    return {
      total_videos: totalVideos || 0,
      featured_videos: featuredVideos || 0,
      total_views: totalViews,
      total_downloads: totalDownloads,
      total_bookmarks: totalBookmarks,
      completion_rate: completionRate,
      active_users: analytics.reduce((sum, a) => sum + a.unique_users, 0),
      machine_models: machineModels,
      recent_activity: recentActivity || [],
      top_videos: analytics.slice(0, 10)
    };
  }

  // =====================================================
  // CUSTOMER CONTENT SEARCH
  // =====================================================

  /**
   * Search customer content
   */
  static async searchCustomerContent(
    customerId: string,
    searchQuery: string,
    filters: Omit<CustomerContentFilter, 'customer_id' | 'search_query'> = {},
    page = 1,
    limit = 20
  ): Promise<CustomerContentSearchResponse> {
    const startTime = Date.now();

    // Use the customer content filter with search query
    const searchFilters: CustomerContentFilter = {
      ...filters,
      customer_id: customerId,
      search_query: searchQuery,
      limit,
      offset: (page - 1) * limit
    };

    const results = await this.getCustomerContent(customerId, searchFilters);

    // Transform to search results
    const searchResults: CustomerContentSearchResult[] = results.map(result => ({
      video_id: result.video_id,
      title: result.title,
      description: result.description,
      duration: result.duration,
      thumbnail_url: result.thumbnail_url,
      machine_model: result.machine_model,
      process_type: result.process_type,
      tooling: result.tooling,
      skill_level: result.skill_level,
      tags: result.tags,
      is_featured: result.is_featured,
      access_level: result.access_level,
      view_count: result.view_count,
      bookmark_count: result.bookmark_count,
      relevance_score: 1.0, // Would be calculated by search service
      transcript_snippets: [] // Would be populated by search service
    }));

    const searchTime = Date.now() - startTime;

    return {
      results: searchResults,
      total_count: searchResults.length,
      page,
      page_size: limit,
      has_more: searchResults.length === limit,
      search_time_ms: searchTime,
      suggestions: [] // Would be populated by search service
    };
  }

  // =====================================================
  // CUSTOMER CONTENT MANAGEMENT UTILITIES
  // =====================================================

  /**
   * Get customer by domain
   */
  static async getCustomerByDomain(domain: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('domain', domain)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Get customer by user company
   */
  static async getCustomerByUserCompany(company: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('name', company)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Check if user has access to content
   */
  static async hasContentAccess(
    userId: string,
    videoId: string
  ): Promise<boolean> {
    // Get user's company
    const { data: user } = await supabase
      .from('users')
      .select('company')
      .eq('id', userId)
      .single();

    if (!user) return false;

    // Get customer by company
    const customer = await this.getCustomerByUserCompany(user.company);
    if (!customer) return false;

    // Check if content is assigned to customer
    const { data: assignment } = await supabase
      .from('customer_content_libraries')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('video_id', videoId)
      .single();

    return !!assignment;
  }

  /**
   * Get user's accessible content
   */
  static async getUserAccessibleContent(
    userId: string,
    filters: Omit<CustomerContentFilter, 'customer_id'> = {}
  ): Promise<CustomerContentSummary[]> {
    // Get user's company
    const { data: user } = await supabase
      .from('users')
      .select('company')
      .eq('id', userId)
      .single();

    if (!user) return [];

    // Get customer by company
    const customer = await this.getCustomerByUserCompany(user.company);
    if (!customer) return [];

    // Get customer content
    return this.getCustomerContent(customer.id, { ...filters, customer_id: customer.id });
  }
}

// Export individual functions for convenience
export const {
  createCustomer,
  getCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
  createSubscription,
  getCustomerSubscription,
  updateSubscription,
  getCustomerContent,
  assignContent,
  bulkAssignContent,
  updateContentAssignment,
  removeContentFromLibrary,
  autoAssignContentByMachines,
  getCustomerMachines,
  addMachine,
  updateMachine,
  deleteMachine,
  trackContentEvent,
  getCustomerAnalytics,
  getCustomerDashboardStats,
  searchCustomerContent,
  getCustomerByDomain,
  getCustomerByUserCompany,
  hasContentAccess,
  getUserAccessibleContent
} = CustomerContentAPI;
