import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useSendVerificationEmail, useVerifyEmail, useVerificationStatus } from '@/hooks/useEmailVerification';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'motion/react';

type VerificationState = 'loading' | 'success' | 'error' | 'expired' | 'pending';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [verificationState, setVerificationState] = useState<VerificationState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const sendVerificationEmail = useSendVerificationEmail();
  const verifyEmail = useVerifyEmail();
  const { data: verificationStatus, refetch } = useVerificationStatus(user?.id);

  // Check for verification token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setVerificationState('error');
      setErrorMessage(errorDescription || 'Verification failed');
      return;
    }

    if (token && type === 'email') {
      handleEmailVerification(token);
    } else if (user?.email) {
      setEmail(user.email);
      checkVerificationStatus();
    } else {
      setVerificationState('pending');
    }
  }, [searchParams, user]);

  // Check if user is already verified
  useEffect(() => {
    if (verificationStatus?.email_verified) {
      setVerificationState('success');
    }
  }, [verificationStatus]);

  const checkVerificationStatus = async () => {
    if (user?.id) {
      try {
        await refetch();
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    }
  };

  const handleEmailVerification = async (token: string) => {
    try {
      setVerificationState('loading');
      await verifyEmail.mutateAsync(token);
      setVerificationState('success');
      
      // Redirect to dashboard after successful verification
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setVerificationState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await sendVerificationEmail.mutateAsync(email);
      setVerificationState('pending');
    } catch (error) {
      console.error('Error resending verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const renderContent = () => {
    switch (verificationState) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 mx-auto bg-accent-blue/10 rounded-full flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-accent-blue animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary-text mb-2">
                Verifying your email...
              </h2>
              <p className="text-secondary-text">
                Please wait while we verify your email address.
              </p>
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 mx-auto bg-status-green/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-status-green" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary-text mb-2">
                Email Verified Successfully!
              </h2>
              <p className="text-secondary-text">
                Your email has been verified. You can now access all features of Winbro Training Reels.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full btn-primary"
              >
                Go to Dashboard
              </Button>
              <p className="text-sm text-secondary-text">
                Redirecting automatically in a few seconds...
              </p>
            </div>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary-text mb-2">
                Verification Failed
              </h2>
              <p className="text-secondary-text mb-4">
                {errorMessage || 'There was an error verifying your email address.'}
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => setVerificationState('pending')}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
              <Link
                to="/login"
                className="block text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </motion.div>
        );

      case 'expired':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary-text mb-2">
                Verification Link Expired
              </h2>
              <p className="text-secondary-text">
                Your verification link has expired. Please request a new one.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="w-full btn-primary"
              >
                {isResending ? 'Sending...' : 'Send New Verification Email'}
              </Button>
            </div>
          </motion.div>
        );

      case 'pending':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-accent-blue/10 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-accent-blue" />
              </div>
              <h2 className="text-2xl font-bold text-primary-text mb-2">
                Verify Your Email Address
              </h2>
              <p className="text-secondary-text">
                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  className="form-input"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Didn't receive the email?</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Check your spam/junk folder</li>
                      <li>• Make sure the email address is correct</li>
                      <li>• Wait a few minutes for delivery</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || !email}
                  className="w-full btn-primary"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-main-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Home */}
        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-secondary-text hover:text-accent-blue transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Verification Card */}
        <Card className="card animate-fade-in-up">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary-text">
              Email Verification
            </CardTitle>
            <CardDescription className="text-lg">
              Complete your account setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="text-center space-y-2">
          <p className="text-sm text-secondary-text">
            Need help?{' '}
            <Link to="/help" className="text-accent-blue hover:text-accent-blue/80">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}