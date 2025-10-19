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
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];