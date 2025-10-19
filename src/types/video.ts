/**
 * Video-related types for Winbro Training Reels
 * Generated: 2024-12-13T12:00:00Z
 */

import type { User } from './index';

// Video processing status
export type VideoProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Video content status
export type VideoStatus = 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected';

// Video visibility levels
export type VideoVisibility = 'private' | 'public' | 'organization';

// Skill levels for video content
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

// Video processing job types
export type ProcessingJobType = 'transcode' | 'transcribe' | 'thumbnail' | 'analyze';

// Video processing job status
export type ProcessingJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Main Video interface
export interface Video {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  duration: number; // in seconds
  original_filename: string;
  file_size: number; // in bytes
  mime_type: string;
  
  // Storage URLs
  video_url: string | null; // HLS/DASH streaming URL
  thumbnail_url: string | null; // poster/thumbnail URL
  audio_url: string | null; // audio-only fallback URL
  
  // Processing status
  processing_status: VideoProcessingStatus;
  processing_progress: number; // 0-100
  processing_error: string | null;
  
  // Video metadata
  width: number | null;
  height: number | null;
  fps: number | null;
  bitrate: number | null;
  
  // Content categorization
  machine_model: string | null;
  process_type: string | null;
  tooling: string | null;
  skill_level: SkillLevel | null;
  tags: string[];
  
  // Access control
  visibility: VideoVisibility;
  customer_scope: string[]; // array of customer IDs who can access this video
  
  // Status and moderation
  status: VideoStatus;
  moderation_notes: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  
  // Analytics
  view_count: number;
  download_count: number;
  bookmark_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Related data (populated by joins)
  author?: User;
  transcripts?: VideoTranscript[];
  processing_jobs?: VideoProcessingJob[];
}

// Video transcript segment
export interface VideoTranscript {
  id: string;
  video_id: string;
  segment_index: number;
  start_time: number; // in seconds
  end_time: number; // in seconds
  text: string;
  confidence: number | null; // AI confidence score 0-1
  language: string;
  is_auto_generated: boolean;
  edited_by: string | null;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
}

// Video processing job
export interface VideoProcessingJob {
  id: string;
  video_id: string;
  job_type: ProcessingJobType;
  status: ProcessingJobStatus;
  worker_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  config: Record<string, any>;
  priority: number;
  created_at: string;
  updated_at: string;
}

// Video creation input
export interface CreateVideoInput {
  title: string;
  description?: string;
  file: File;
  machine_model?: string;
  process_type?: string;
  tooling?: string;
  skill_level?: SkillLevel;
  tags?: string[];
  visibility?: VideoVisibility;
  customer_scope?: string[];
  auto_transcribe?: boolean;
}

// Video update input
export interface UpdateVideoInput {
  title?: string;
  description?: string;
  machine_model?: string;
  process_type?: string;
  tooling?: string;
  skill_level?: SkillLevel;
  tags?: string[];
  visibility?: VideoVisibility;
  customer_scope?: string[];
  status?: VideoStatus;
}

// Video upload progress
export interface VideoUploadProgress {
  video_id: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  uploaded_bytes: number;
  total_bytes: number;
}

// Video search filters
export interface VideoSearchFilters {
  query?: string;
  tags?: string[];
  machine_model?: string;
  process_type?: string;
  skill_level?: SkillLevel;
  status?: VideoStatus;
  visibility?: VideoVisibility;
  author_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  duration_range?: {
    min: number; // in seconds
    max: number; // in seconds
  };
  processing_status?: VideoProcessingStatus;
}

// Video search result
export interface VideoSearchResult {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration: number;
  tags: string[];
  author: User;
  status: VideoStatus;
  visibility: VideoVisibility;
  view_count: number;
  created_at: string;
  score: number; // search relevance score
  highlight?: {
    title?: string;
    description?: string;
    transcript?: string;
  };
}

// Video analytics
export interface VideoAnalytics {
  video_id: string;
  total_views: number;
  unique_viewers: number;
  average_watch_time: number; // in seconds
  completion_rate: number; // 0-1
  popular_segments: Array<{
    start_time: number;
    end_time: number;
    view_count: number;
  }>;
  search_queries: Array<{
    query: string;
    count: number;
  }>;
  device_breakdown: Array<{
    device_type: string;
    count: number;
  }>;
  geographic_breakdown: Array<{
    country: string;
    count: number;
  }>;
}

// Video upload configuration
export interface VideoUploadConfig {
  max_file_size: number; // in bytes
  allowed_formats: string[];
  max_duration: number; // in seconds
  chunk_size: number; // in bytes
  retry_attempts: number;
  auto_transcribe: boolean;
  auto_generate_thumbnails: boolean;
  processing_priority: number;
}

// Video processing configuration
export interface VideoProcessingConfig {
  video_quality: 'low' | 'medium' | 'high' | 'ultra';
  thumbnail_count: number;
  generate_audio_only: boolean;
  transcription_language: string;
  transcription_confidence_threshold: number;
  auto_tagging: boolean;
  content_moderation: boolean;
}

// Video player state
export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  isFullscreen: boolean;
  quality: string;
  captionsEnabled: boolean;
  transcriptVisible: boolean;
}

// Video player controls
export interface VideoPlayerControls {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  toggleCaptions: () => void;
  toggleTranscript: () => void;
}

// Video comment/note
export interface VideoComment {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  timestamp: number | null; // null for general comments
  is_private: boolean;
  created_at: string;
  updated_at: string;
  author?: User;
}

// Video bookmark
export interface VideoBookmark {
  id: string;
  video_id: string;
  user_id: string;
  timestamp: number | null; // null for general bookmarks
  note: string | null;
  created_at: string;
  updated_at: string;
  video?: Video;
}

// Video share
export interface VideoShare {
  id: string;
  video_id: string;
  shared_by: string;
  shared_with: string | null; // null for public shares
  share_type: 'public' | 'private' | 'organization';
  expires_at: string | null;
  access_count: number;
  created_at: string;
  updated_at: string;
}

// Video download
export interface VideoDownload {
  id: string;
  video_id: string;
  user_id: string;
  download_url: string;
  expires_at: string;
  file_size: number;
  format: string;
  quality: string;
  created_at: string;
}

// Video report
export interface VideoReport {
  id: string;
  video_id: string;
  reported_by: string;
  reason: 'inappropriate' | 'copyright' | 'spam' | 'other';
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Video statistics
export interface VideoStats {
  total_videos: number;
  total_duration: number; // in seconds
  total_views: number;
  total_downloads: number;
  average_duration: number; // in seconds
  most_viewed: Video[];
  most_downloaded: Video[];
  recent_uploads: Video[];
  processing_queue: number;
  failed_processing: number;
}

// Video export options
export interface VideoExportOptions {
  format: 'mp4' | 'webm' | 'mov' | 'avi';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: string; // e.g., "1920x1080"
  include_audio: boolean;
  include_subtitles: boolean;
  watermark: boolean;
  custom_watermark_text?: string;
}

// Video import options
export interface VideoImportOptions {
  source: 'url' | 'file' | 'youtube' | 'vimeo';
  url?: string;
  file?: File;
  auto_process: boolean;
  preserve_metadata: boolean;
  custom_title?: string;
  custom_description?: string;
  tags?: string[];
}
