import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Search,
  Award,
  Calendar,
  User
} from 'lucide-react';
import type { CertificateVerificationProps, CertificateVerification } from '@/types/certificates';

export function CertificateVerification({ 
  verificationCode, 
  onVerified, 
  onError 
}: CertificateVerificationProps) {
  const [code, setCode] = useState(verificationCode || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verification, setVerification] = useState<CertificateVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Please enter a verification code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // This would call the API to verify the certificate
      // For now, we'll simulate the verification
      const response = await fetch(`/api/certificates/verify/${code}`);
      
      if (!response.ok) {
        throw new Error('Certificate not found or invalid');
      }

      const result = await response.json();
      setVerification(result);
      onVerified?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify certificate';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (verification) {
    return (
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          {verification.is_valid ? (
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <CheckCircle className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Certificate Verified</h2>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
              <XCircle className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Certificate Invalid</h2>
            </div>
          )}
          <p className="text-gray-600">{verification.verification_message}</p>
        </div>

        {verification.is_valid && verification.certificate && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Award className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {verification.certificate.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {verification.certificate.course_title}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {verification.certificate.recipient_name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatDate(verification.certificate.completion_date)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Score: {verification.certificate.score}%
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    #{verification.certificate.certificate_number}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Verified on {formatDate(verification.verified_at)}
              </p>
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
          <Shield className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Verify Certificate</h2>
        </div>
        <p className="text-gray-600">
          Enter the verification code to validate a certificate
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="Enter 8-character code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            className="text-center font-mono"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleVerify}
          disabled={isVerifying || !code.trim()}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verifying...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Verify Certificate
            </>
          )}
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Certificate verification codes are 8 characters long and can be found on the certificate.
        </p>
      </div>
    </Card>
  );
}
