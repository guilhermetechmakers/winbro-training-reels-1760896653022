/**
 * Video API service for Winbro Training Reels
 * Handles video upload, processing, and management operations
 */

import { supabase } from '@/lib/supabase';
import type { 
  Video, 
  VideoTranscript, 
  VideoProcessingJob,
  ProcessingJobType,
  CreateVideoInput,
  UpdateVideoInput,
  VideoSearchFilters,
  VideoSearchResult,
  VideoUploadProgress,
  VideoStats,
  VideoAnalytics,
  VideoComment,
  VideoBookmark,
  VideoShare,
  VideoDownload,
  VideoReport
} from '@/types/video';

// Video upload configuration
const UPLOAD_CONFIG = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  allowedFormats: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  maxDuration: 300, // 5 minutes
  chunkSize: 5 * 1024 * 1024, // 5MB chunks
  retryAttempts: 3,
  autoTranscribe: true,
  autoGenerateThumbnails: true,
  processingPriority: 1
};

/**
 * Video API class with all video-related operations
 */
export class VideoAPI {
  /**
   * Upload a video file with chunked upload support
   */
  static async uploadVideo(
    input: CreateVideoInput,
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<Video> {
    try {
      // Validate file
      this.validateVideoFile(input.file);

      // Create video record in database
      const videoData = {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        title: input.title,
        description: input.description || null,
        duration: 0, // Will be updated after processing
        original_filename: input.file.name,
        file_size: input.file.size,
        mime_type: input.file.type,
        processing_status: 'pending' as const,
        processing_progress: 0,
        machine_model: input.machine_model || null,
        process_type: input.process_type || null,
        tooling: input.tooling || null,
        skill_level: input.skill_level || null,
        tags: input.tags || [],
        visibility: input.visibility || 'private',
        customer_scope: input.customer_scope || [],
        status: 'draft' as const
      };

      const { data: video, error: videoError } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single();

      if (videoError) throw videoError;

      // Upload file in chunks
      await this.uploadFileInChunks(
        input.file,
        video.id,
        onProgress
      );

      // Start processing jobs
      await this.startProcessingJobs(video.id, {
        autoTranscribe: input.auto_transcribe ?? UPLOAD_CONFIG.autoTranscribe,
        autoGenerateThumbnails: UPLOAD_CONFIG.autoGenerateThumbnails,
        priority: UPLOAD_CONFIG.processingPriority
      });

      return video;
    } catch (error) {
      console.error('Video upload failed:', error);
      throw new Error(`Video upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get video by ID with related data
   */
  static async getVideo(id: string): Promise<Video> {
    const { data: video, error } = await supabase
      .from('videos')
      .select(`
        *,
        author:users!videos_user_id_fkey(*),
        transcripts:video_transcripts(*),
        processing_jobs:video_processing_jobs(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return video;
  }

  /**
   * Get videos with filters and pagination
   */
  static async getVideos(
    filters: VideoSearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ videos: Video[]; total: number }> {
    let query = supabase
      .from('videos')
      .select(`
        *,
        author:users!videos_user_id_fkey(*)
      `, { count: 'exact' });

    // Apply filters
    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters.machine_model) {
      query = query.eq('machine_model', filters.machine_model);
    }

    if (filters.process_type) {
      query = query.eq('process_type', filters.process_type);
    }

    if (filters.skill_level) {
      query = query.eq('skill_level', filters.skill_level);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.visibility) {
      query = query.eq('visibility', filters.visibility);
    }

    if (filters.author_id) {
      query = query.eq('user_id', filters.author_id);
    }

    if (filters.date_range) {
      query = query
        .gte('created_at', filters.date_range.start)
        .lte('created_at', filters.date_range.end);
    }

    if (filters.duration_range) {
      query = query
        .gte('duration', filters.duration_range.min)
        .lte('duration', filters.duration_range.max);
    }

    if (filters.processing_status) {
      query = query.eq('processing_status', filters.processing_status);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: videos, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      videos: videos || [],
      total: count || 0
    };
  }

  /**
   * Search videos with full-text search
   */
  static async searchVideos(
    query: string,
    _filters: VideoSearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ results: VideoSearchResult[]; total: number }> {
    // This would typically use a search service like Elasticsearch
    // For now, we'll use Supabase's text search capabilities
    const { data: videos, error, count } = await supabase
      .from('videos')
      .select(`
        *,
        author:users!videos_user_id_fkey(*)
      `, { count: 'exact' })
      .textSearch('title', query)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    const results: VideoSearchResult[] = (videos || []).map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail_url: video.thumbnail_url,
      duration: video.duration,
      tags: video.tags,
      author: video.author,
      status: video.status,
      visibility: video.visibility,
      view_count: video.view_count,
      created_at: video.created_at,
      score: 1.0 // Would be calculated by search service
    }));

    return {
      results,
      total: count || 0
    };
  }

  /**
   * Update video metadata
   */
  static async updateVideo(id: string, updates: UpdateVideoInput): Promise<Video> {
    const { data: video, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return video;
  }

  /**
   * Delete video
   */
  static async deleteVideo(id: string): Promise<void> {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get video transcripts
   */
  static async getVideoTranscripts(videoId: string): Promise<VideoTranscript[]> {
    const { data: transcripts, error } = await supabase
      .from('video_transcripts')
      .select('*')
      .eq('video_id', videoId)
      .order('segment_index');

    if (error) throw error;
    return transcripts || [];
  }

  /**
   * Update video transcript
   */
  static async updateTranscript(
    transcriptId: string,
    updates: Partial<VideoTranscript>
  ): Promise<VideoTranscript> {
    const { data: transcript, error } = await supabase
      .from('video_transcripts')
      .update(updates)
      .eq('id', transcriptId)
      .select()
      .single();

    if (error) throw error;
    return transcript;
  }

  /**
   * Get video processing jobs
   */
  static async getProcessingJobs(videoId: string): Promise<VideoProcessingJob[]> {
    const { data: jobs, error } = await supabase
      .from('video_processing_jobs')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return jobs || [];
  }

  /**
   * Get video statistics
   */
  static async getVideoStats(): Promise<VideoStats> {
    const { data: stats, error } = await supabase
      .rpc('get_video_stats');

    if (error) throw error;
    return stats;
  }

  /**
   * Get video analytics
   */
  static async getVideoAnalytics(videoId: string): Promise<VideoAnalytics> {
    const { data: analytics, error } = await supabase
      .rpc('get_video_analytics', { video_id: videoId });

    if (error) throw error;
    return analytics;
  }

  /**
   * Add video comment
   */
  static async addComment(
    videoId: string,
    content: string,
    timestamp?: number,
    isPrivate = false
  ): Promise<VideoComment> {
    const { data: comment, error } = await supabase
      .from('video_comments')
      .insert({
        video_id: videoId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        content,
        timestamp,
        is_private: isPrivate
      })
      .select()
      .single();

    if (error) throw error;
    return comment;
  }

  /**
   * Bookmark video
   */
  static async bookmarkVideo(
    videoId: string,
    timestamp?: number,
    note?: string
  ): Promise<VideoBookmark> {
    const { data: bookmark, error } = await supabase
      .from('video_bookmarks')
      .insert({
        video_id: videoId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        timestamp,
        note
      })
      .select()
      .single();

    if (error) throw error;
    return bookmark;
  }

  /**
   * Share video
   */
  static async shareVideo(
    videoId: string,
    shareType: 'public' | 'private' | 'organization',
    sharedWith?: string,
    expiresAt?: string
  ): Promise<VideoShare> {
    const { data: share, error } = await supabase
      .from('video_shares')
      .insert({
        video_id: videoId,
        shared_by: (await supabase.auth.getUser()).data.user?.id,
        shared_with: sharedWith,
        share_type: shareType,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) throw error;
    return share;
  }

  /**
   * Request video download
   */
  static async requestDownload(
    videoId: string,
    format: string = 'mp4',
    quality: string = 'high'
  ): Promise<VideoDownload> {
    const { data: download, error } = await supabase
      .from('video_downloads')
      .insert({
        video_id: videoId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        format,
        quality,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })
      .select()
      .single();

    if (error) throw error;
    return download;
  }

  /**
   * Report video
   */
  static async reportVideo(
    videoId: string,
    reason: 'inappropriate' | 'copyright' | 'spam' | 'other',
    description?: string
  ): Promise<VideoReport> {
    const { data: report, error } = await supabase
      .from('video_reports')
      .insert({
        video_id: videoId,
        reported_by: (await supabase.auth.getUser()).data.user?.id,
        reason,
        description
      })
      .select()
      .single();

    if (error) throw error;
    return report;
  }

  /**
   * Validate video file
   */
  private static validateVideoFile(file: File): void {
    if (!UPLOAD_CONFIG.allowedFormats.includes(file.type)) {
      throw new Error(`Unsupported file format: ${file.type}`);
    }

    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      throw new Error(`File too large: ${file.size} bytes (max: ${UPLOAD_CONFIG.maxFileSize})`);
    }
  }

  /**
   * Upload file in chunks
   */
  private static async uploadFileInChunks(
    file: File,
    videoId: string,
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<string> {
    const chunkSize = UPLOAD_CONFIG.chunkSize;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedBytes = 0;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      // Upload chunk to Supabase Storage
      const { error } = await supabase.storage
        .from('videos')
        .upload(`${videoId}/chunk_${i}`, chunk, {
          contentType: file.type,
          upsert: true
        });

      if (error) throw error;

      uploadedBytes += chunk.size;
      const progress = Math.round((uploadedBytes / file.size) * 100);

      onProgress?.({
        video_id: videoId,
        progress,
        status: 'uploading',
        uploaded_bytes: uploadedBytes,
        total_bytes: file.size
      });
    }

    // Combine chunks into final video file
    const { data: finalVideo, error: combineError } = await supabase
      .storage
      .from('videos')
      .upload(`${videoId}/video.mp4`, file, {
        contentType: file.type,
        upsert: true
      });

    if (combineError) throw combineError;

    return finalVideo.path;
  }

  /**
   * Start processing jobs for video
   */
  private static async startProcessingJobs(
    videoId: string,
    config: {
      autoTranscribe: boolean;
      autoGenerateThumbnails: boolean;
      priority: number;
    }
  ): Promise<void> {
    const jobs: Array<{
      video_id: string;
      job_type: ProcessingJobType;
      priority: number;
      config: Record<string, any>;
    }> = [
      {
        video_id: videoId,
        job_type: 'transcode',
        priority: config.priority,
        config: {
          quality: 'high',
          format: 'hls'
        }
      }
    ];

    if (config.autoGenerateThumbnails) {
      jobs.push({
        video_id: videoId,
        job_type: 'thumbnail' as const,
        priority: config.priority,
        config: {
          quality: 'medium',
          format: 'jpeg'
        }
      });
    }

    if (config.autoTranscribe) {
      jobs.push({
        video_id: videoId,
        job_type: 'transcribe' as const,
        priority: config.priority,
        config: {
          language: 'en',
          confidence_threshold: 0.8
        }
      });
    }

    const { error } = await supabase
      .from('video_processing_jobs')
      .insert(jobs);

    if (error) throw error;
  }
}

// Export individual functions for convenience
export const {
  uploadVideo,
  getVideo,
  getVideos,
  searchVideos,
  updateVideo,
  deleteVideo,
  getVideoTranscripts,
  updateTranscript,
  getProcessingJobs,
  getVideoStats,
  getVideoAnalytics,
  addComment,
  bookmarkVideo,
  shareVideo,
  requestDownload,
  reportVideo
} = VideoAPI;
