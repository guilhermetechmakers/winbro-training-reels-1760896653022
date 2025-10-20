/**
 * Certificate-related types for Winbro Training Reels
 * Based on certificates table structure
 */

// Certificate status types
export type CertificateStatus = 'active' | 'revoked' | 'expired';

// Certificate interface
export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id: string;
  certificate_number: string;
  title: string;
  recipient_name: string;
  course_title: string;
  completion_date: string;
  score: number;
  template_id: string;
  issued_by: string;
  issuer_signature?: string;
  verification_code: string;
  status: CertificateStatus;
  expires_at?: string;
  pdf_url?: string;
  thumbnail_url?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Certificate creation data
export interface CertificateInsert {
  id?: string;
  user_id: string;
  course_id: string;
  enrollment_id: string;
  certificate_number: string;
  title: string;
  recipient_name: string;
  course_title: string;
  completion_date: string;
  score: number;
  template_id?: string;
  issued_by: string;
  issuer_signature?: string;
  verification_code: string;
  status?: CertificateStatus;
  expires_at?: string;
  pdf_url?: string;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}

// Certificate update data
export interface CertificateUpdate {
  title?: string;
  recipient_name?: string;
  status?: CertificateStatus;
  expires_at?: string;
  pdf_url?: string;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}

// Certificate verification result
export interface CertificateVerification {
  certificate: Certificate;
  is_valid: boolean;
  verification_message: string;
  verified_at: string;
}

// Certificate template
export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  template_data: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Certificate generation request
export interface CertificateGenerationRequest {
  user_id: string;
  course_id: string;
  enrollment_id: string;
  template_id?: string;
  custom_data?: Record<string, any>;
}

// Certificate generation result
export interface CertificateGenerationResult {
  certificate: Certificate;
  pdf_url: string;
  thumbnail_url: string;
  generated_at: string;
}

// Certificate statistics
export interface CertificateStats {
  total_certificates: number;
  active_certificates: number;
  revoked_certificates: number;
  expired_certificates: number;
  certificates_this_month: number;
  certificates_this_year: number;
  average_score: number;
  top_courses: Array<{
    course_id: string;
    course_title: string;
    certificate_count: number;
  }>;
}

// Certificate component props
export interface CertificateCardProps {
  certificate: Certificate;
  onDownload?: (certificate: Certificate) => void;
  onShare?: (certificate: Certificate) => void;
  onVerify?: (verificationCode: string) => void;
  showActions?: boolean;
}

export interface CertificateListProps {
  certificates: Certificate[];
  onDownload?: (certificate: Certificate) => void;
  onShare?: (certificate: Certificate) => void;
  onVerify?: (verificationCode: string) => void;
  isLoading?: boolean;
  error?: string;
}

export interface CertificateVerificationProps {
  verificationCode: string;
  onVerified?: (verification: CertificateVerification) => void;
  onError?: (error: string) => void;
}

// Certificate API response types
export interface CertificateResponse {
  certificate: Certificate;
  success: boolean;
  message?: string;
}

export interface CertificateListResponse {
  certificates: Certificate[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface CertificateVerificationResponse {
  verification: CertificateVerification;
  success: boolean;
  message?: string;
}

// Supabase query result type
export type CertificateRow = Certificate;
