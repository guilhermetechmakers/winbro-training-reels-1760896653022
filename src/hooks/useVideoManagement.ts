import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createVideoProcessingJob,
  getVideoProcessingStatus,
  getVideoProcessingJobs,
  updateVideoProcessingJob,
  createVideoThumbnail,
  getVideoThumbnails,
  setPrimaryThumbnail,
  upsertVideoMetadata,
  getVideoMetadata,
  createVideoTrimSegment,
  getVideoTrimSegments,
  applyVideoTrim,
  uploadVideoFile,
  startVideoProcessing,
  getVideoAnalytics,
  incrementVideoAnalytics,
  searchVideos,
  getVideoSuggestions,
  type VideoProcessingJob,
  type VideoThumbnail,
  type VideoMetadata,
} from '@/api/videoManagement';

// Query keys
export const videoManagementKeys = {
  all: ['videoManagement'] as const,
  processingStatus: (videoId: string) => [...videoManagementKeys.all, 'processingStatus', videoId] as const,
  processingJobs: (videoId: string) => [...videoManagementKeys.all, 'processingJobs', videoId] as const,
  thumbnails: (videoId: string) => [...videoManagementKeys.all, 'thumbnails', videoId] as const,
  metadata: (videoId: string) => [...videoManagementKeys.all, 'metadata', videoId] as const,
  trimSegments: (videoId: string) => [...videoManagementKeys.all, 'trimSegments', videoId] as const,
  analytics: (videoId: string) => [...videoManagementKeys.all, 'analytics', videoId] as const,
  search: (query: string, filters: any) => [...videoManagementKeys.all, 'search', query, filters] as const,
  suggestions: (videoId: string) => [...videoManagementKeys.all, 'suggestions', videoId] as const,
};

// Get video processing status
export function useVideoProcessingStatus(videoId: string) {
  return useQuery({
    queryKey: videoManagementKeys.processingStatus(videoId),
    queryFn: () => getVideoProcessingStatus(videoId),
    enabled: !!videoId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

// Get video processing jobs
export function useVideoProcessingJobs(videoId: string) {
  return useQuery({
    queryKey: videoManagementKeys.processingJobs(videoId),
    queryFn: () => getVideoProcessingJobs(videoId),
    enabled: !!videoId,
  });
}

// Create video processing job mutation
export function useCreateVideoProcessingJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, jobType, config, priority }: {
      videoId: string;
      jobType: VideoProcessingJob['job_type'];
      config?: Record<string, any>;
      priority?: number;
    }) => createVideoProcessingJob(videoId, jobType, config, priority),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: videoManagementKeys.processingJobs(variables.videoId),
      });
      queryClient.invalidateQueries({
        queryKey: videoManagementKeys.processingStatus(variables.videoId),
      });
      toast.success('Processing job created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create processing job');
      console.error('Error creating processing job:', error);
    },
  });
}

// Update video processing job mutation
export function useUpdateVideoProcessingJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, updates }: {
      jobId: string;
      updates: Partial<VideoProcessingJob>;
    }) => updateVideoProcessingJob(jobId, updates),
    onSuccess: (data, _variables) => {
      // Find video ID from the job data
      const videoId = data.video_id;
      queryClient.invalidateQueries({
        queryKey: videoManagementKeys.processingJobs(videoId),
      });
      queryClient.invalidateQueries({
        queryKey: videoManagementKeys.processingStatus(videoId),
      });
    },
    onError: (error) => {
      toast.error('Failed to update processing job');
      console.error('Error updating processing job:', error);
    },
  });
}

// Get video thumbnails
export function useVideoThumbnails(videoId: string) {
  return useQuery({
    queryKey: videoManagementKeys.thumbnails(videoId),
    queryFn: () => getVideoThumbnails(videoId),
    enabled: !!videoId,
  });
}

// Create video thumbnail mutation
export function useCreateVideoThumbnail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, thumbnailData }: {
      videoId: string;
      thumbnailData: Omit<VideoThumbnail, 'id' | 'video_id' | 'created_at' | 'updated_at'>;
    }) => createVideoThumbnail(videoId, thumbnailData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: videoManagementKeys.thumbnails(variables.videoId),
      });
      toast.success('Thumbnail created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create thumbnail');
      console.error('Error creating thumbnail:', error);
    },
  });
}

// Set primary thumbnail mutation
export function useSetPrimaryThumbnail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, thumbnailId }: {
      videoId: string;
      thumbnailId: string;
    }) => setPrimaryThumbnail(videoId, thumbnailId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: videoManagementKeys.thumbnails(variables.videoId),
      });
      toast.success('Primary thumbnail updated');
    },
    onError: (error) => {
      toast.error('Failed to update primary thumbnail');
      console.error('Error updating primary thumbnail:', error);
    },
  });
}

// Get video metadata
export function useVideoMetadata(videoId: string) {
  return useQuery({
    queryKey: videoManagementKeys.metadata(videoId),
    queryFn: () => getVideoMetadata(videoId),
    enabled: !!videoId,
  });
}

// Upsert video metadata mutation
export function useUpsertVideoMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, metadata }: {
      videoId: string;
      metadata: Partial<VideoMetadata>;
    }) => upsertVideoMetadata(videoId, metadata),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: videoManagementKeys.metadata(variables.videoId),
      });
      toast.success('Metadata updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update metadata');
      console.error('Error updating metadata:', error);
    },
  });
}

// Get video trim segments
export function useVideoTrimSegments(videoId: string) {
  return useQuery({
    queryKey: videoManagementKeys.trimSegments(videoId),
    queryFn: () => getVideoTrimSegments(videoId),
    enabled: !!videoId,
  });
}

// Create video trim segment mutation
export function useCreateVideoTrimSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, startTime, endTime }: {
      videoId: string;
      startTime: number;
      endTime: number;
    }) => createVideoTrimSegment(videoId, startTime, endTime),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: videoManagementKeys.trimSegments(variables.videoId),
      });
      toast.success('Trim segment created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create trim segment');
      console.error('Error creating trim segment:', error);
    },
  });
}

// Apply video trim mutation
export function useApplyVideoTrim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trimId: string) => applyVideoTrim(trimId),
    onSuccess: (_data, _variables) => {
      // Invalidate all trim segments queries since we don't know the video ID
      queryClient.invalidateQueries({
        queryKey: videoManagementKeys.all,
        predicate: (query) => query.queryKey[1] === 'trimSegments',
      });
      toast.success('Video trim applied successfully');
    },
    onError: (error) => {
      toast.error('Failed to apply video trim');
      console.error('Error applying video trim:', error);
    },
  });
}

// Upload video file mutation
export function useUploadVideoFile() {
  return useMutation({
    mutationFn: ({ file, onProgress }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => uploadVideoFile(file, onProgress),
    onSuccess: () => {
      toast.success('Video uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload video');
      console.error('Error uploading video:', error);
    },
  });
}

// Start video processing mutation
export function useStartVideoProcessing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, options }: {
      videoId: string;
      options?: {
        autoTranscribe?: boolean;
        autoTagging?: boolean;
        generateThumbnails?: boolean;
      };
    }) => startVideoProcessing(videoId, options),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: videoManagementKeys.processingJobs(variables.videoId),
      });
      queryClient.invalidateQueries({
        queryKey: videoManagementKeys.processingStatus(variables.videoId),
      });
      toast.success('Video processing started');
    },
    onError: (error) => {
      toast.error('Failed to start video processing');
      console.error('Error starting video processing:', error);
    },
  });
}

// Get video analytics
export function useVideoAnalytics(videoId: string) {
  return useQuery({
    queryKey: videoManagementKeys.analytics(videoId),
    queryFn: () => getVideoAnalytics(videoId),
    enabled: !!videoId,
  });
}

// Increment video analytics mutation
export function useIncrementVideoAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, type }: {
      videoId: string;
      type: 'view' | 'download' | 'bookmark';
    }) => incrementVideoAnalytics(videoId, type),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: videoManagementKeys.analytics(variables.videoId),
      });
    },
    onError: (error) => {
      console.error('Error incrementing analytics:', error);
    },
  });
}

// Search videos
export function useSearchVideos(
  query: string,
  filters: any = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: videoManagementKeys.search(query, filters),
    queryFn: () => searchVideos(query, filters),
    enabled: enabled && !!query,
  });
}

// Get video suggestions
export function useVideoSuggestions(videoId: string, limit: number = 5) {
  return useQuery({
    queryKey: videoManagementKeys.suggestions(videoId),
    queryFn: () => getVideoSuggestions(videoId, limit),
    enabled: !!videoId,
  });
}

// Combined hook for video processing status with real-time updates
export function useVideoProcessingStatusWithUpdates(videoId: string) {
  const processingStatus = useVideoProcessingStatus(videoId);
  const processingJobs = useVideoProcessingJobs(videoId);

  return {
    ...processingStatus,
    data: {
      ...processingStatus.data,
      jobs: processingJobs.data || [],
    },
    isLoading: processingStatus.isLoading || processingJobs.isLoading,
    error: processingStatus.error || processingJobs.error,
  };
}