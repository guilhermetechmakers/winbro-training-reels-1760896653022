/**
 * Customer-specific content types for Winbro Training Reels
 * Generated: 2024-12-20T12:00:00Z
 */

// =====================================================
// CUSTOMER TYPES
// =====================================================

export interface Customer {
  id: string;
  name: string;
  domain: string | null;
  contact_email: string;
  contact_phone: string | null;
  address: Record<string, any>;
  billing_info: Record<string, any>;
  subscription_tier: 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled' | 'trial';
  trial_ends_at: string | null;
  max_seats: number;
  max_storage_gb: number;
  features: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CustomerInsert {
  id?: string;
  name: string;
  domain?: string | null;
  contact_email: string;
  contact_phone?: string | null;
  address?: Record<string, any>;
  billing_info?: Record<string, any>;
  subscription_tier?: 'basic' | 'professional' | 'enterprise';
  status?: 'active' | 'suspended' | 'cancelled' | 'trial';
  trial_ends_at?: string | null;
  max_seats?: number;
  max_storage_gb?: number;
  features?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CustomerUpdate {
  name?: string;
  domain?: string | null;
  contact_email?: string;
  contact_phone?: string | null;
  address?: Record<string, any>;
  billing_info?: Record<string, any>;
  subscription_tier?: 'basic' | 'professional' | 'enterprise';
  status?: 'active' | 'suspended' | 'cancelled' | 'trial';
  trial_ends_at?: string | null;
  max_seats?: number;
  max_storage_gb?: number;
  features?: Record<string, any>;
  metadata?: Record<string, any>;
}

// =====================================================
// CUSTOMER SUBSCRIPTION TYPES
// =====================================================

export interface CustomerSubscription {
  id: string;
  customer_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  plan_name: string;
  plan_tier: 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  seats_included: number;
  storage_gb_included: number;
  price_per_seat_cents: number;
  price_per_storage_gb_cents: number;
  monthly_price_cents: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CustomerSubscriptionInsert {
  id?: string;
  customer_id: string;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  plan_name: string;
  plan_tier: 'basic' | 'professional' | 'enterprise';
  status?: 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end?: boolean;
  cancelled_at?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
  seats_included?: number;
  storage_gb_included?: number;
  price_per_seat_cents?: number;
  price_per_storage_gb_cents?: number;
  monthly_price_cents?: number;
  currency?: string;
  billing_cycle?: 'monthly' | 'yearly';
  metadata?: Record<string, any>;
}

export interface CustomerSubscriptionUpdate {
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  plan_name?: string;
  plan_tier?: 'basic' | 'professional' | 'enterprise';
  status?: 'active' | 'past_due' | 'cancelled' | 'unpaid' | 'trialing';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  cancelled_at?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
  seats_included?: number;
  storage_gb_included?: number;
  price_per_seat_cents?: number;
  price_per_storage_gb_cents?: number;
  monthly_price_cents?: number;
  currency?: string;
  billing_cycle?: 'monthly' | 'yearly';
  metadata?: Record<string, any>;
}

// =====================================================
// CUSTOMER CONTENT LIBRARY TYPES
// =====================================================

export interface CustomerContentLibrary {
  id: string;
  customer_id: string;
  video_id: string;
  assigned_by: string | null;
  assignment_type: 'manual' | 'automatic' | 'subscription';
  assignment_reason: string | null;
  is_featured: boolean;
  display_order: number;
  access_level: 'standard' | 'premium' | 'exclusive';
  expires_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CustomerContentLibraryInsert {
  id?: string;
  customer_id: string;
  video_id: string;
  assigned_by?: string | null;
  assignment_type?: 'manual' | 'automatic' | 'subscription';
  assignment_reason?: string | null;
  is_featured?: boolean;
  display_order?: number;
  access_level?: 'standard' | 'premium' | 'exclusive';
  expires_at?: string | null;
  metadata?: Record<string, any>;
}

export interface CustomerContentLibraryUpdate {
  assigned_by?: string | null;
  assignment_type?: 'manual' | 'automatic' | 'subscription';
  assignment_reason?: string | null;
  is_featured?: boolean;
  display_order?: number;
  access_level?: 'standard' | 'premium' | 'exclusive';
  expires_at?: string | null;
  metadata?: Record<string, any>;
}

// =====================================================
// CUSTOMER MACHINE TYPES
// =====================================================

export interface CustomerMachine {
  id: string;
  customer_id: string;
  machine_model: string;
  machine_serial: string | null;
  machine_type: string | null;
  purchase_date: string | null;
  warranty_expires: string | null;
  location: string | null;
  status: 'active' | 'maintenance' | 'retired' | 'sold';
  specifications: Record<string, any>;
  maintenance_schedule: Record<string, any>;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CustomerMachineInsert {
  id?: string;
  customer_id: string;
  machine_model: string;
  machine_serial?: string | null;
  machine_type?: string | null;
  purchase_date?: string | null;
  warranty_expires?: string | null;
  location?: string | null;
  status?: 'active' | 'maintenance' | 'retired' | 'sold';
  specifications?: Record<string, any>;
  maintenance_schedule?: Record<string, any>;
  notes?: string | null;
  metadata?: Record<string, any>;
}

export interface CustomerMachineUpdate {
  machine_model?: string;
  machine_serial?: string | null;
  machine_type?: string | null;
  purchase_date?: string | null;
  warranty_expires?: string | null;
  location?: string | null;
  status?: 'active' | 'maintenance' | 'retired' | 'sold';
  specifications?: Record<string, any>;
  maintenance_schedule?: Record<string, any>;
  notes?: string | null;
  metadata?: Record<string, any>;
}

// =====================================================
// CUSTOMER CONTENT ANALYTICS TYPES
// =====================================================

export interface CustomerContentAnalytics {
  id: string;
  customer_id: string;
  video_id: string;
  user_id: string | null;
  event_type: 'view' | 'download' | 'bookmark' | 'complete' | 'share';
  event_data: Record<string, any>;
  session_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface CustomerContentAnalyticsInsert {
  id?: string;
  customer_id: string;
  video_id: string;
  user_id?: string | null;
  event_type: 'view' | 'download' | 'bookmark' | 'complete' | 'share';
  event_data?: Record<string, any>;
  session_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

// =====================================================
// CUSTOMER CONTENT SUMMARY TYPES
// =====================================================

export interface CustomerContentSummary {
  library_id: string;
  customer_id: string;
  video_id: string;
  is_featured: boolean;
  display_order: number;
  access_level: string;
  assigned_by: string | null;
  assignment_type: string;
  assigned_at: string;
  title: string;
  description: string | null;
  duration: number;
  thumbnail_url: string | null;
  machine_model: string | null;
  process_type: string | null;
  tooling: string | null;
  skill_level: string | null;
  tags: string[];
  view_count: number;
  bookmark_count: number;
  assigned_by_name: string | null;
  customer_name: string;
}

export interface CustomerAnalyticsSummary {
  customer_id: string;
  video_id: string;
  video_title: string;
  total_events: number;
  unique_users: number;
  view_count: number;
  download_count: number;
  bookmark_count: number;
  completion_count: number;
  last_activity: string;
}

// =====================================================
// CUSTOMER CONTENT FILTER TYPES
// =====================================================

export interface CustomerContentFilter {
  customer_id?: string;
  machine_model?: string;
  process_type?: string;
  tooling?: string;
  skill_level?: string;
  tags?: string[];
  access_level?: string;
  is_featured?: boolean;
  assignment_type?: string;
  search_query?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'title' | 'duration' | 'created_at' | 'view_count' | 'display_order';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// =====================================================
// CUSTOMER CONTENT ASSIGNMENT TYPES
// =====================================================

export interface ContentAssignmentRequest {
  customer_id: string;
  video_ids: string[];
  assignment_type: 'manual' | 'automatic' | 'subscription';
  assignment_reason?: string;
  is_featured?: boolean;
  access_level?: 'standard' | 'premium' | 'exclusive';
  expires_at?: string | null;
  assigned_by: string;
}

export interface BulkContentAssignment {
  assignments: ContentAssignmentRequest[];
  auto_assign_by_machines?: boolean;
  notify_customers?: boolean;
}

// =====================================================
// CUSTOMER CONTENT ANALYTICS EVENT TYPES
// =====================================================

export interface ContentAnalyticsEvent {
  customer_id: string;
  video_id: string;
  user_id?: string;
  event_type: 'view' | 'download' | 'bookmark' | 'complete' | 'share';
  event_data?: Record<string, any>;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
}

// =====================================================
// CUSTOMER DASHBOARD TYPES
// =====================================================

export interface CustomerDashboardStats {
  total_videos: number;
  featured_videos: number;
  total_views: number;
  total_downloads: number;
  total_bookmarks: number;
  completion_rate: number;
  active_users: number;
  machine_models: string[];
  recent_activity: CustomerContentAnalytics[];
  top_videos: CustomerAnalyticsSummary[];
}

// =====================================================
// CUSTOMER CONTENT SEARCH TYPES
// =====================================================

export interface CustomerContentSearchResult {
  video_id: string;
  title: string;
  description: string | null;
  duration: number;
  thumbnail_url: string | null;
  machine_model: string | null;
  process_type: string | null;
  tooling: string | null;
  skill_level: string | null;
  tags: string[];
  is_featured: boolean;
  access_level: string;
  view_count: number;
  bookmark_count: number;
  relevance_score?: number;
  transcript_snippets?: string[];
}

export interface CustomerContentSearchResponse {
  results: CustomerContentSearchResult[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
  search_time_ms: number;
  suggestions?: string[];
}
