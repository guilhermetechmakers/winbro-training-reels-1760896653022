import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Analytics } from '@/types';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: () => [...analyticsKeys.all, 'overview'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
};

// Get analytics overview
export const useAnalytics = () => {
  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: () => api.get<Analytics>('/analytics'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get dashboard analytics
export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: analyticsKeys.dashboard(),
    queryFn: () => api.get<Analytics>('/analytics/dashboard'),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};