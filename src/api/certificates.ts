/**
 * Certificate API functions for Winbro Training Reels
 */

import { supabase } from '@/lib/supabase';
import type { 
  Certificate, 
  CertificateInsert, 
  CertificateUpdate,
  CertificateVerification,
  CertificateStats,
  CertificateListResponse
} from '@/types/certificates';

// Get certificates for a user
export async function getUserCertificates(userId: string, page = 1, limit = 20): Promise<CertificateListResponse> {
  const offset = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from('certificates')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('completion_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    certificates: data as Certificate[],
    total: count || 0,
    page,
    limit,
    has_more: (count || 0) > offset + limit
  };
}

// Get certificate by ID
export async function getCertificate(certificateId: string): Promise<Certificate> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('id', certificateId)
    .single();

  if (error) throw error;
  return data as Certificate;
}

// Get certificate by verification code
export async function getCertificateByVerificationCode(verificationCode: string): Promise<Certificate> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('verification_code', verificationCode)
    .eq('status', 'active')
    .single();

  if (error) throw error;
  return data as Certificate;
}

// Verify certificate
export async function verifyCertificate(verificationCode: string): Promise<CertificateVerification> {
  try {
    const certificate = await getCertificateByVerificationCode(verificationCode);
    
    return {
      certificate,
      is_valid: true,
      verification_message: 'Certificate is valid and active',
      verified_at: new Date().toISOString()
    };
  } catch (error) {
    return {
      certificate: {} as Certificate,
      is_valid: false,
      verification_message: 'Certificate not found or invalid',
      verified_at: new Date().toISOString()
    };
  }
}

// Create certificate
export async function createCertificate(certificateData: CertificateInsert): Promise<Certificate> {
  const { data, error } = await supabase
    .from('certificates')
    .insert(certificateData)
    .select()
    .single();

  if (error) throw error;
  return data as Certificate;
}

// Update certificate
export async function updateCertificate(certificateId: string, updates: CertificateUpdate): Promise<Certificate> {
  const { data, error } = await supabase
    .from('certificates')
    .update(updates)
    .eq('id', certificateId)
    .select()
    .single();

  if (error) throw error;
  return data as Certificate;
}

// Delete certificate (soft delete by updating status)
export async function deleteCertificate(certificateId: string): Promise<void> {
  const { error } = await supabase
    .from('certificates')
    .update({ status: 'revoked' })
    .eq('id', certificateId);

  if (error) throw error;
}

// Get certificate statistics
export async function getCertificateStats(userId?: string): Promise<CertificateStats> {
  let query = supabase
    .from('certificates')
    .select('*');

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const certificates = data as Certificate[];
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisYear = new Date(now.getFullYear(), 0, 1);

  const stats: CertificateStats = {
    total_certificates: certificates.length,
    active_certificates: certificates.filter(c => c.status === 'active').length,
    revoked_certificates: certificates.filter(c => c.status === 'revoked').length,
    expired_certificates: certificates.filter(c => c.status === 'expired').length,
    certificates_this_month: certificates.filter(c => 
      new Date(c.completion_date) >= thisMonth
    ).length,
    certificates_this_year: certificates.filter(c => 
      new Date(c.completion_date) >= thisYear
    ).length,
    average_score: certificates.length > 0 
      ? Math.round(certificates.reduce((sum, c) => sum + c.score, 0) / certificates.length)
      : 0,
    top_courses: []
  };

  // Calculate top courses
  const courseCounts = certificates.reduce((acc, cert) => {
    const existing = acc.find(c => c.course_id === cert.course_id);
    if (existing) {
      existing.certificate_count++;
    } else {
      acc.push({
        course_id: cert.course_id,
        course_title: cert.course_title,
        certificate_count: 1
      });
    }
    return acc;
  }, [] as Array<{ course_id: string; course_title: string; certificate_count: number }>);

  stats.top_courses = courseCounts
    .sort((a, b) => b.certificate_count - a.certificate_count)
    .slice(0, 10);

  return stats;
}

// Generate certificate PDF (placeholder - would integrate with PDF generation service)
export async function generateCertificatePDF(certificateId: string): Promise<{ pdf_url: string; thumbnail_url: string }> {
  // This would typically call a PDF generation service
  // For now, return placeholder URLs
  return {
    pdf_url: `/api/certificates/${certificateId}/pdf`,
    thumbnail_url: `/api/certificates/${certificateId}/thumbnail`
  };
}

// Download certificate
export async function downloadCertificate(certificateId: string): Promise<Blob> {
  const response = await fetch(`/api/certificates/${certificateId}/download`);
  if (!response.ok) throw new Error('Failed to download certificate');
  return response.blob();
}

// Share certificate
export async function shareCertificate(certificateId: string, _platform: 'email' | 'social' | 'link'): Promise<{ share_url: string }> {
  // This would typically generate a shareable link or handle social sharing
  const certificate = await getCertificate(certificateId);
  return {
    share_url: `${window.location.origin}/certificates/verify/${certificate.verification_code}`
  };
}
