import { useMutation, useQuery } from '@tanstack/react-query';
import { emailVerificationApi } from '@/lib/api';
import { toast } from 'sonner';

// Query keys
export const emailVerificationKeys = {
  verificationStatus: ['email-verification', 'status'] as const,
};

// Check verification status
export const useVerificationStatus = (userId?: string) => {
  return useQuery({
    queryKey: [...emailVerificationKeys.verificationStatus, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const response = await emailVerificationApi.checkVerificationStatus(userId);
      return { email_verified: response.emailVerified };
    },
    enabled: !!userId,
    retry: false,
  });
};

// Send verification email
export const useSendVerificationEmail = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await emailVerificationApi.sendVerificationEmail(email);
      if (!response.success) {
        throw new Error(response.message || 'Failed to send verification email');
      }
      return response;
    },
    onSuccess: () => {
      toast.success('Verification email sent! Check your inbox.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to send verification email: ${error.message}`);
    },
  });
};

// Verify email with token
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await emailVerificationApi.verifyEmail(token);
      if (!response.success) {
        throw new Error('Email verification failed');
      }
      return response;
    },
    onSuccess: () => {
      toast.success('Email verified successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Verification failed: ${error.message}`);
    },
  });
};