import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: 'admin' | 'trainer' | 'learner';
          company: string;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          role?: 'admin' | 'trainer' | 'learner';
          company: string;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: 'admin' | 'trainer' | 'learner';
          company?: string;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          duration: number;
          original_filename: string;
          file_size: number;
          mime_type: string;
          video_url: string | null;
          thumbnail_url: string | null;
          audio_url: string | null;
          processing_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
          processing_progress: number;
          processing_error: string | null;
          width: number | null;
          height: number | null;
          fps: number | null;
          bitrate: number | null;
          machine_model: string | null;
          process_type: string | null;
          tooling: string | null;
          skill_level: 'beginner' | 'intermediate' | 'advanced' | null;
          tags: string[];
          visibility: 'private' | 'public' | 'organization';
          customer_scope: string[];
          status: 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected';
          moderation_notes: string | null;
          moderated_by: string | null;
          moderated_at: string | null;
          view_count: number;
          download_count: number;
          bookmark_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          duration: number;
          original_filename: string;
          file_size: number;
          mime_type: string;
          video_url?: string | null;
          thumbnail_url?: string | null;
          audio_url?: string | null;
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
          processing_progress?: number;
          processing_error?: string | null;
          width?: number | null;
          height?: number | null;
          fps?: number | null;
          bitrate?: number | null;
          machine_model?: string | null;
          process_type?: string | null;
          tooling?: string | null;
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | null;
          tags?: string[];
          visibility?: 'private' | 'public' | 'organization';
          customer_scope?: string[];
          status?: 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected';
          moderation_notes?: string | null;
          moderated_by?: string | null;
          moderated_at?: string | null;
          view_count?: number;
          download_count?: number;
          bookmark_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          duration?: number;
          original_filename?: string;
          file_size?: number;
          mime_type?: string;
          video_url?: string | null;
          thumbnail_url?: string | null;
          audio_url?: string | null;
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
          processing_progress?: number;
          processing_error?: string | null;
          width?: number | null;
          height?: number | null;
          fps?: number | null;
          bitrate?: number | null;
          machine_model?: string | null;
          process_type?: string | null;
          tooling?: string | null;
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | null;
          tags?: string[];
          visibility?: 'private' | 'public' | 'organization';
          customer_scope?: string[];
          status?: 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected';
          moderation_notes?: string | null;
          moderated_by?: string | null;
          moderated_at?: string | null;
          view_count?: number;
          download_count?: number;
          bookmark_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      video_transcripts: {
        Row: {
          id: string;
          video_id: string;
          segment_index: number;
          start_time: number;
          end_time: number;
          text: string;
          confidence: number | null;
          language: string;
          is_auto_generated: boolean;
          edited_by: string | null;
          edited_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          segment_index: number;
          start_time: number;
          end_time: number;
          text: string;
          confidence?: number | null;
          language?: string;
          is_auto_generated?: boolean;
          edited_by?: string | null;
          edited_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          segment_index?: number;
          start_time?: number;
          end_time?: number;
          text?: string;
          confidence?: number | null;
          language?: string;
          is_auto_generated?: boolean;
          edited_by?: string | null;
          edited_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      video_processing_jobs: {
        Row: {
          id: string;
          video_id: string;
          job_type: 'transcode' | 'transcribe' | 'thumbnail' | 'analyze';
          status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
          worker_id: string | null;
          started_at: string | null;
          completed_at: string | null;
          error_message: string | null;
          config: Record<string, any>;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          job_type: 'transcode' | 'transcribe' | 'thumbnail' | 'analyze';
          status?: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
          worker_id?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
          config?: Record<string, any>;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          job_type?: 'transcode' | 'transcribe' | 'thumbnail' | 'analyze';
          status?: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
          worker_id?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          error_message?: string | null;
          config?: Record<string, any>;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Search functionality tables
      search_index: {
        Row: {
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
        };
        Insert: {
          id?: string;
          video_id: string;
          title: string;
          description?: string | null;
          tags?: string[];
          machine_model?: string | null;
          process_type?: string | null;
          tooling?: string | null;
          skill_level?: string | null;
          search_vector?: string | null;
          title_vector?: string | null;
          description_vector?: string | null;
          tags_vector?: string | null;
          transcript_vector?: string | null;
          status?: string;
          visibility?: string;
          customer_scope?: string[];
          author_id: string;
          view_count?: number;
          bookmark_count?: number;
          duration: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          title?: string;
          description?: string | null;
          tags?: string[];
          machine_model?: string | null;
          process_type?: string | null;
          tooling?: string | null;
          skill_level?: string | null;
          search_vector?: string | null;
          title_vector?: string | null;
          description_vector?: string | null;
          tags_vector?: string | null;
          transcript_vector?: string | null;
          status?: string;
          visibility?: string;
          customer_scope?: string[];
          author_id?: string;
          view_count?: number;
          bookmark_count?: number;
          duration?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      search_suggestions: {
        Row: {
          id: string;
          query: string;
          suggestion_type: string;
          suggestion_value: string;
          usage_count: number;
          last_used_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          query: string;
          suggestion_type: string;
          suggestion_value: string;
          usage_count?: number;
          last_used_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          query?: string;
          suggestion_type?: string;
          suggestion_value?: string;
          usage_count?: number;
          last_used_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      search_analytics: {
        Row: {
          id: string;
          user_id: string | null;
          query: string;
          query_type: string;
          filters: Record<string, any>;
          result_count: number;
          execution_time_ms: number;
          clicked_result_id: string | null;
          clicked_result_position: number | null;
          session_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          query: string;
          query_type: string;
          filters?: Record<string, any>;
          result_count?: number;
          execution_time_ms?: number;
          clicked_result_id?: string | null;
          clicked_result_position?: number | null;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          query?: string;
          query_type?: string;
          filters?: Record<string, any>;
          result_count?: number;
          execution_time_ms?: number;
          clicked_result_id?: string | null;
          clicked_result_position?: number | null;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      // Customer Content Management Tables
      customers: {
        Row: {
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
        };
        Insert: {
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
        };
        Update: {
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
        };
      };
      customer_subscriptions: {
        Row: {
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
        };
        Insert: {
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
        };
        Update: {
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
        };
      };
      customer_content_libraries: {
        Row: {
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
        };
        Insert: {
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
        };
        Update: {
          assigned_by?: string | null;
          assignment_type?: 'manual' | 'automatic' | 'subscription';
          assignment_reason?: string | null;
          is_featured?: boolean;
          display_order?: number;
          access_level?: 'standard' | 'premium' | 'exclusive';
          expires_at?: string | null;
          metadata?: Record<string, any>;
        };
      };
      customer_machines: {
        Row: {
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
        };
        Insert: {
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
        };
        Update: {
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
        };
      };
      customer_content_analytics: {
        Row: {
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
        };
        Insert: {
          id?: string;
          customer_id: string;
          video_id: string;
          user_id?: string | null;
          event_type: 'view' | 'download' | 'bookmark' | 'complete' | 'share';
          event_data?: Record<string, any>;
          session_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          event_data?: Record<string, any>;
        };
      };
    };
    Views: {
      customer_content_summary: {
        Row: {
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
        };
      };
      customer_analytics_summary: {
        Row: {
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
        };
      };
    };
    Functions: {
      get_customer_content: {
        Args: {
          p_customer_id: string;
        };
        Returns: {
          video_id: string;
          title: string;
          description: string;
          duration: number;
          thumbnail_url: string;
          machine_model: string;
          process_type: string;
          tooling: string;
          skill_level: string;
          tags: string[];
          is_featured: boolean;
          access_level: string;
          view_count: number;
          bookmark_count: number;
        }[];
      };
      auto_assign_content_by_machines: {
        Args: {
          p_customer_id: string;
        };
        Returns: number;
      };
    };
    Enums: {};
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
