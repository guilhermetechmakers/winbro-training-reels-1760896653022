import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  Shield, 
  Calendar, 
  Award,
  ExternalLink
} from 'lucide-react';
import type { CertificateCardProps } from '@/types/certificates';

export function CertificateCard({ 
  certificate, 
  onDownload, 
  onShare, 
  onVerify, 
  showActions = true 
}: CertificateCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Award className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {certificate.title}
            </h3>
            <p className="text-sm text-gray-600">
              {certificate.course_title}
            </p>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={getStatusColor(certificate.status)}
        >
          {certificate.status.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Completed on {formatDate(certificate.completion_date)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Award className="h-4 w-4" />
          <span>Score: {certificate.score}%</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="h-4 w-4" />
          <span>Certificate #{certificate.certificate_number}</span>
        </div>
      </div>

      {certificate.thumbnail_url && (
        <div className="mb-4">
          <img 
            src={certificate.thumbnail_url} 
            alt="Certificate thumbnail"
            className="w-full h-32 object-cover rounded-lg border"
          />
        </div>
      )}

      {showActions && (
        <div className="flex items-center gap-2 pt-4 border-t">
          {certificate.pdf_url && onDownload && (
            <Button
              onClick={() => onDownload(certificate)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
          
          {onShare && (
            <Button
              onClick={() => onShare(certificate)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          
          {onVerify && (
            <Button
              onClick={() => onVerify(certificate.verification_code)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Verify
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
