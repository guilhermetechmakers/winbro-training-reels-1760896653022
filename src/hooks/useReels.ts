import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { Reel, CreateReelInput, SearchFilters } from '@/types';
import { toast } from 'sonner';

// Query keys
export const reelKeys = {
  all: ['reels'] as const,
  lists: () => [...reelKeys.all, 'list'] as const,
  list: (filters: SearchFilters) => [...reelKeys.lists(), { filters }] as const,
  details: () => [...reelKeys.all, 'detail'] as const,
  detail: (id: string) => [...reelKeys.details(), id] as const,
  search: (query: string) => [...reelKeys.all, 'search', query] as const,
};

// Get all reels
export const useReels = (filters?: SearchFilters) => {
  return useQuery({
    queryKey: reelKeys.list(filters || {}),
    queryFn: () => api.get<Reel[]>('/reels'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get reel by ID
export const useReel = (id: string) => {
  return useQuery({
    queryKey: reelKeys.detail(id),
    queryFn: () => api.get<Reel>(`/reels/${id}`),
    enabled: !!id,
  });
};

// Search reels
export const useSearchReels = (query: string) => {
  return useQuery({
    queryKey: reelKeys.search(query),
    queryFn: () => api.get<Reel[]>(`/reels/search?q=${encodeURIComponent(query)}`),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Create reel mutation
export const useCreateReel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reelData: CreateReelInput) => 
      api.post<Reel>('/reels', reelData),
    onSuccess: (newReel) => {
      // Invalidate and refetch reels list
      queryClient.invalidateQueries({ queryKey: reelKeys.lists() });
      
      // Add the new reel to the cache
      queryClient.setQueryData(reelKeys.detail(newReel.id), newReel);
    },
  });
};

// Update reel mutation
export const useUpdateReel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Reel> }) =>
      api.put<Reel>(`/reels/${id}`, updates),
    onSuccess: (updatedReel) => {
      // Update the reel in the cache
      queryClient.setQueryData(reelKeys.detail(updatedReel.id), updatedReel);
      
      // Invalidate reels list to ensure consistency
      queryClient.invalidateQueries({ queryKey: reelKeys.lists() });
    },
  });
};

// Delete reel mutation
export const useDeleteReel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/reels/${id}`),
    onSuccess: (_, deletedId) => {
      // Remove the reel from the cache
      queryClient.removeQueries({ queryKey: reelKeys.detail(deletedId) });
      
      // Invalidate reels list
      queryClient.invalidateQueries({ queryKey: reelKeys.lists() });
      
      toast.success('Reel deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete reel');
      console.error('Error deleting reel:', error);
    },
  });
};

// Upload video file with progress tracking
export const useUploadVideoFile = () => {
  return useMutation({
    mutationFn: async ({ file: _file, onProgress }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        onProgress?.(i);
      }

      // In a real implementation, this would upload to S3
      const videoId = `video_${Date.now()}`;
      const videoUrl = `https://example.com/videos/${videoId}.mp4`;

      return { videoId, videoUrl };
    },
    onSuccess: () => {
      toast.success('Video uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload video');
      console.error('Error uploading video:', error);
    },
  });
};

// Create reel with enhanced metadata
export const useCreateReelWithMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reelData: CreateReelInput & {
      machineModel?: string;
      processType?: string;
      tooling?: string;
      skillLevel?: 'beginner' | 'intermediate' | 'advanced';
      visibility?: 'private' | 'organization' | 'public';
      customerScope?: string[];
      autoTranscribe?: boolean;
      autoTagging?: boolean;
      generateThumbnails?: boolean;
    }) => {
      // Create the reel
      const reel = await api.post<Reel>('/reels', reelData);
      
      // Create video processing jobs if needed
      if (reelData.autoTranscribe || reelData.autoTagging || reelData.generateThumbnails) {
        const { error } = await supabase
          .from('video_processing_jobs')
          .insert([
            ...(reelData.autoTranscribe ? [{
              video_id: reel.id,
              job_type: 'transcribe',
              config: { language: 'en', model: 'whisper-1' },
              priority: 1,
            }] : []),
            ...(reelData.generateThumbnails ? [{
              video_id: reel.id,
              job_type: 'thumbnail',
              config: { count: 5, quality: 'high' },
              priority: 2,
            }] : []),
            ...(reelData.autoTagging ? [{
              video_id: reel.id,
              job_type: 'analyze',
              config: { includeTags: true, includeSummary: true },
              priority: 3,
            }] : []),
          ])
          .select();

        if (error) {
          console.error('Error creating processing jobs:', error);
        }
      }

      return reel;
    },
    onSuccess: (newReel) => {
      // Invalidate and refetch reels list
      queryClient.invalidateQueries({ queryKey: reelKeys.lists() });
      
      // Add the new reel to the cache
      queryClient.setQueryData(reelKeys.detail(newReel.id), newReel);
      
      toast.success('Reel created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create reel');
      console.error('Error creating reel:', error);
    },
  });
};

// Get reel with processing status
export const useReelWithProcessingStatus = (id: string) => {
  const reel = useReel(id);
  
  const processingStatus = useQuery({
    queryKey: ['videoProcessingStatus', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_video_processing_status', { p_video_id: id });
      
      if (error) throw error;
      return data[0];
    },
    enabled: !!id,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  return {
    ...reel,
    data: reel.data ? {
      ...reel.data,
      processingStatus: processingStatus.data,
    } : undefined,
    isLoading: reel.isLoading || processingStatus.isLoading,
    error: reel.error || processingStatus.error,
  };
};

// Get reel thumbnails
export const useReelThumbnails = (videoId: string) => {
  return useQuery({
    queryKey: ['reelThumbnails', videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_thumbnails')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!videoId,
  });
};

// Set primary thumbnail
export const useSetPrimaryThumbnail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, thumbnailId }: {
      videoId: string;
      thumbnailId: string;
    }) => {
      const { error } = await supabase
        .rpc('set_primary_thumbnail', {
          p_video_id: videoId,
          p_thumbnail_id: thumbnailId,
        });

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['reelThumbnails', variables.videoId],
      });
      toast.success('Primary thumbnail updated');
    },
    onError: (error) => {
      toast.error('Failed to update primary thumbnail');
      console.error('Error updating primary thumbnail:', error);
    },
  });
};