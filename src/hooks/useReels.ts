import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Reel, CreateReelInput, SearchFilters } from '@/types';

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
    },
  });
};