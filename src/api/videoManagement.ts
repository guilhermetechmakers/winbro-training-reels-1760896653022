import { supabase } from '@/lib/supabase';

// Video processing job types
export interface VideoProcessingJob {
  id: string;
  video_id: string;
  job_type: 'transcode' | 'transcribe' | 'thumbnail' | 'analyze' | 'trim';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  worker_id?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  progress_percentage: number;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VideoThumbnail {
  id: string;
  video_id: string;
  thumbnail_url: string;
  thumbnail_type: 'generated' | 'custom' | 'poster_frame';
  time_offset: number;
  width: number;
  height: number;
  file_size?: number;
  is_primary: boolean;
  is_selected: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoMetadata {
  id: string;
  video_id: string;
  auto_tags: string[];
  ai_summary?: string;
  confidence_scores: Record<string, number>;
  dominant_colors?: string[];
  motion_analysis?: Record<string, any>;
  audio_analysis?: Record<string, any>;
  quality_metrics?: Record<string, any>;
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VideoTrimSegment {
  id: string;
  video_id: string;
  start_time: number;
  end_time: number;
  duration: number;
  is_applied: boolean;
  applied_at?: string;
  created_at: string;
  updated_at: string;
}

// Create video processing job
export async function createVideoProcessingJob(
  videoId: string,
  jobType: VideoProcessingJob['job_type'],
  config: Record<string, any> = {},
  priority: number = 0
): Promise<VideoProcessingJob> {
  const { data, error } = await supabase
    .from('video_processing_jobs')
    .insert({
      video_id: videoId,
      job_type: jobType,
      config,
      priority,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get video processing status
export async function getVideoProcessingStatus(videoId: string) {
  const { data, error } = await supabase
    .rpc('get_video_processing_status', { p_video_id: videoId });

  if (error) throw error;
  return data[0];
}

// Get video processing jobs
export async function getVideoProcessingJobs(videoId: string): Promise<VideoProcessingJob[]> {
  const { data, error } = await supabase
    .from('video_processing_jobs')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Update video processing job
export async function updateVideoProcessingJob(
  jobId: string,
  updates: Partial<VideoProcessingJob>
): Promise<VideoProcessingJob> {
  const { data, error } = await supabase
    .from('video_processing_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Create video thumbnail
export async function createVideoThumbnail(
  videoId: string,
  thumbnailData: Omit<VideoThumbnail, 'id' | 'video_id' | 'created_at' | 'updated_at'>
): Promise<VideoThumbnail> {
  const { data, error } = await supabase
    .from('video_thumbnails')
    .insert({
      video_id: videoId,
      ...thumbnailData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get video thumbnails
export async function getVideoThumbnails(videoId: string): Promise<VideoThumbnail[]> {
  const { data, error } = await supabase
    .from('video_thumbnails')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Set primary thumbnail
export async function setPrimaryThumbnail(videoId: string, thumbnailId: string): Promise<void> {
  const { error } = await supabase
    .rpc('set_primary_thumbnail', {
      p_video_id: videoId,
      p_thumbnail_id: thumbnailId,
    });

  if (error) throw error;
}

// Create or update video metadata
export async function upsertVideoMetadata(
  videoId: string,
  metadata: Partial<VideoMetadata>
): Promise<VideoMetadata> {
  const { data, error } = await supabase
    .from('video_metadata')
    .upsert({
      video_id: videoId,
      ...metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get video metadata
export async function getVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
  const { data, error } = await supabase
    .from('video_metadata')
    .select('*')
    .eq('video_id', videoId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }
  return data;
}

// Create video trim segment
export async function createVideoTrimSegment(
  videoId: string,
  startTime: number,
  endTime: number
): Promise<VideoTrimSegment> {
  const { data, error } = await supabase
    .from('video_trim_segments')
    .insert({
      video_id: videoId,
      start_time: startTime,
      end_time: endTime,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get video trim segments
export async function getVideoTrimSegments(videoId: string): Promise<VideoTrimSegment[]> {
  const { data, error } = await supabase
    .from('video_trim_segments')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Apply video trim
export async function applyVideoTrim(trimId: string): Promise<void> {
  const { error } = await supabase
    .from('video_trim_segments')
    .update({
      is_applied: true,
      applied_at: new Date().toISOString(),
    })
    .eq('id', trimId);

  if (error) throw error;
}

// Upload video file (simulated - in real implementation, this would upload to S3)
export async function uploadVideoFile(
  _file: File,
  onProgress?: (progress: number) => void
): Promise<{ videoId: string; videoUrl: string }> {
  // Simulate upload progress
  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    onProgress?.(i);
  }

  // In a real implementation, this would:
  // 1. Upload to S3 or similar storage
  // 2. Create a record in the videos table
  // 3. Return the video ID and URL

  const videoId = `video_${Date.now()}`;
  const videoUrl = `https://example.com/videos/${videoId}.mp4`;

  return { videoId, videoUrl };
}

// Start video processing pipeline
export async function startVideoProcessing(
  videoId: string,
  options: {
    autoTranscribe?: boolean;
    autoTagging?: boolean;
    generateThumbnails?: boolean;
  } = {}
): Promise<void> {
  const jobs: Promise<VideoProcessingJob>[] = [];

  // Always transcode
  jobs.push(
    createVideoProcessingJob(videoId, 'transcode', {
      quality: 'high',
      format: 'mp4',
    })
  );

  // Auto-transcribe if enabled
  if (options.autoTranscribe !== false) {
    jobs.push(
      createVideoProcessingJob(videoId, 'transcribe', {
        language: 'en',
        model: 'whisper-1',
      })
    );
  }

  // Generate thumbnails if enabled
  if (options.generateThumbnails !== false) {
    jobs.push(
      createVideoProcessingJob(videoId, 'thumbnail', {
        count: 5,
        quality: 'high',
      })
    );
  }

  // Auto-tagging if enabled
  if (options.autoTagging !== false) {
    jobs.push(
      createVideoProcessingJob(videoId, 'analyze', {
        includeTags: true,
        includeSummary: true,
      })
    );
  }

  await Promise.all(jobs);
}

// Get video analytics
export async function getVideoAnalytics(videoId: string) {
  const { data, error } = await supabase
    .from('videos')
    .select('view_count, download_count, bookmark_count, created_at')
    .eq('id', videoId)
    .single();

  if (error) throw error;

  return {
    views: data.view_count || 0,
    downloads: data.download_count || 0,
    bookmarks: data.bookmark_count || 0,
    createdAt: data.created_at,
  };
}

// Update video analytics (increment counters)
export async function incrementVideoAnalytics(
  videoId: string,
  type: 'view' | 'download' | 'bookmark'
): Promise<void> {
  const { error } = await supabase.rpc('increment_video_counter', {
    video_id: videoId,
    counter_type: type
  });

  if (error) throw error;
}

// Search videos with advanced filters
export async function searchVideos(
  query: string,
  filters: {
    tags?: string[];
    machineModel?: string;
    processType?: string;
    skillLevel?: string;
    author?: string;
    dateRange?: { start: string; end: string };
    duration?: { min: number; max: number };
  } = {}
) {
  let queryBuilder = supabase
    .from('search_index')
    .select('*')
    .textSearch('search_vector', query);

  // Apply filters
  if (filters.tags && filters.tags.length > 0) {
    queryBuilder = queryBuilder.overlaps('tags', filters.tags);
  }

  if (filters.machineModel) {
    queryBuilder = queryBuilder.eq('machine_model', filters.machineModel);
  }

  if (filters.processType) {
    queryBuilder = queryBuilder.eq('process_type', filters.processType);
  }

  if (filters.skillLevel) {
    queryBuilder = queryBuilder.eq('skill_level', filters.skillLevel);
  }

  if (filters.author) {
    queryBuilder = queryBuilder.eq('author_id', filters.author);
  }

  if (filters.dateRange) {
    queryBuilder = queryBuilder
      .gte('created_at', filters.dateRange.start)
      .lte('created_at', filters.dateRange.end);
  }

  if (filters.duration) {
    queryBuilder = queryBuilder
      .gte('duration', filters.duration.min)
      .lte('duration', filters.duration.max);
  }

  const { data, error } = await queryBuilder
    .order('view_count', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

// Get video suggestions based on current video
export async function getVideoSuggestions(videoId: string, limit: number = 5) {
  // Get current video details
  const { data: currentVideo, error: videoError } = await supabase
    .from('videos')
    .select('tags, machine_model, process_type, skill_level')
    .eq('id', videoId)
    .single();

  if (videoError) throw videoError;

  // Find similar videos
  const { data, error } = await supabase
    .from('search_index')
    .select('*')
    .neq('video_id', videoId)
    .overlaps('tags', currentVideo.tags || [])
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}