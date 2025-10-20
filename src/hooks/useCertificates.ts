import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getUserCertificates, 
  getCertificate, 
  verifyCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getCertificateStats,
  generateCertificatePDF,
  downloadCertificate,
  shareCertificate
} from '@/api/certificates';
import type { 
  CertificateInsert, 
  CertificateUpdate
} from '@/types/certificates';

// Query keys
export const certificateKeys = {
  all: ['certificates'] as const,
  lists: () => [...certificateKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...certificateKeys.lists(), { filters }] as const,
  details: () => [...certificateKeys.all, 'detail'] as const,
  detail: (id: string) => [...certificateKeys.details(), id] as const,
  verification: (code: string) => [...certificateKeys.all, 'verification', code] as const,
  stats: (userId?: string) => [...certificateKeys.all, 'stats', userId] as const,
};

// Get user certificates
export function useUserCertificates(userId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: certificateKeys.list({ userId, page, limit }),
    queryFn: () => getUserCertificates(userId, page, limit),
    enabled: !!userId,
  });
}

// Get certificate by ID
export function useCertificate(certificateId: string) {
  return useQuery({
    queryKey: certificateKeys.detail(certificateId),
    queryFn: () => getCertificate(certificateId),
    enabled: !!certificateId,
  });
}

// Verify certificate
export function useVerifyCertificate(verificationCode: string) {
  return useQuery({
    queryKey: certificateKeys.verification(verificationCode),
    queryFn: () => verifyCertificate(verificationCode),
    enabled: !!verificationCode && verificationCode.length === 8,
    retry: false,
  });
}

// Get certificate statistics
export function useCertificateStats(userId?: string) {
  return useQuery({
    queryKey: certificateKeys.stats(userId),
    queryFn: () => getCertificateStats(userId),
  });
}

// Create certificate mutation
export function useCreateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (certificateData: CertificateInsert) => createCertificate(certificateData),
    onSuccess: (data) => {
      // Invalidate and refetch certificates
      queryClient.invalidateQueries({ queryKey: certificateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: certificateKeys.stats(data.user_id) });
    },
  });
}

// Update certificate mutation
export function useUpdateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CertificateUpdate }) => 
      updateCertificate(id, updates),
    onSuccess: (data) => {
      // Update the certificate in cache
      queryClient.setQueryData(certificateKeys.detail(data.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: certificateKeys.lists() });
    },
  });
}

// Delete certificate mutation
export function useDeleteCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (certificateId: string) => deleteCertificate(certificateId),
    onSuccess: (_, certificateId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: certificateKeys.detail(certificateId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: certificateKeys.lists() });
    },
  });
}

// Generate certificate PDF mutation
export function useGenerateCertificatePDF() {
  return useMutation({
    mutationFn: (certificateId: string) => generateCertificatePDF(certificateId),
  });
}

// Download certificate mutation
export function useDownloadCertificate() {
  return useMutation({
    mutationFn: (certificateId: string) => downloadCertificate(certificateId),
  });
}

// Share certificate mutation
export function useShareCertificate() {
  return useMutation({
    mutationFn: ({ certificateId, platform }: { certificateId: string; platform: 'email' | 'social' | 'link' }) => 
      shareCertificate(certificateId, platform),
  });
}
