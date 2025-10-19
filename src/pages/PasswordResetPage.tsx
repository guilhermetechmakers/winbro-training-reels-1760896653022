import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useRequestPasswordReset, useUpdatePassword } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { PasswordResetRequestForm, PasswordResetForm } from '@/types/auth';

// Validation schemas
const requestResetSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const requestResetMutation = useRequestPasswordReset();
  const updatePasswordMutation = useUpdatePassword();

  // Request reset form
  const requestForm = useForm<PasswordResetRequestForm>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: '',
    },
  });

  // Reset password form
  const resetForm = useForm<PasswordResetForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = resetForm.watch('password');

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  // Update password strength when password changes
  useState(() => {
    const subscription = resetForm.watch((value) => {
      if (value.password) {
        setPasswordStrength(calculatePasswordStrength(value.password));
      }
    });
    return () => subscription.unsubscribe();
  });

  const onRequestReset = async (data: PasswordResetRequestForm) => {
    try {
      await requestResetMutation.mutateAsync(data.email);
      setIsRequestSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
    }
  };

  const onResetPassword = async (data: PasswordResetForm) => {
    try {
      await updatePasswordMutation.mutateAsync(data.password);
      toast.success('Password updated successfully! You can now sign in.');
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  // If token is present, show reset form
  if (token) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md w-full space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back to Login */}
          <div className="text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-secondary-text hover:text-accent-blue transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>

          {/* Reset Password Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="card">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-primary-text">Reset Password</CardTitle>
                <CardDescription className="text-lg">
                  Enter your new password below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-primary-text mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        {...resetForm.register('password')}
                        className={`w-full pr-10 ${resetForm.formState.errors.password ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-secondary-text" />
                        ) : (
                          <Eye className="h-4 w-4 text-secondary-text" />
                        )}
                      </button>
                    </div>
                    {resetForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {resetForm.formState.errors.password.message}
                      </p>
                    )}
                    {password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary-text">Password strength:</span>
                          <span className={passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 3 ? 'text-yellow-500' : passwordStrength <= 4 ? 'text-blue-500' : 'text-green-500'}>
                            {getPasswordStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-text mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        {...resetForm.register('confirmPassword')}
                        className={`w-full pr-10 ${resetForm.formState.errors.confirmPassword ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-secondary-text" />
                        ) : (
                          <Eye className="h-4 w-4 text-secondary-text" />
                        )}
                      </button>
                    </div>
                    {resetForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {resetForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                    {resetForm.watch('confirmPassword') && resetForm.watch('password') === resetForm.watch('confirmPassword') && (
                      <p className="text-green-500 text-sm mt-1 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Passwords match
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-primary"
                    disabled={resetForm.formState.isSubmitting || updatePasswordMutation.isPending}
                  >
                    {resetForm.formState.isSubmitting || updatePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // If no token, show request form
  return (
    <div className="min-h-screen bg-main-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back to Login */}
        <div className="text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center text-secondary-text hover:text-accent-blue transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>

        {/* Request Reset Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="card">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-primary-text">Forgot Password?</CardTitle>
              <CardDescription className="text-lg">
                {isRequestSent 
                  ? 'Check your email for reset instructions' 
                  : 'Enter your email address and we\'ll send you a link to reset your password'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isRequestSent ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-primary-text">Email Sent!</h3>
                    <p className="text-secondary-text mt-2">
                      We've sent password reset instructions to your email address.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-secondary-text">
                      Didn't receive the email? Check your spam folder or{' '}
                      <button
                        onClick={() => setIsRequestSent(false)}
                        className="text-accent-blue hover:text-accent-blue/80 font-medium"
                      >
                        try again
                      </button>
                    </p>
                    <Link
                      to="/login"
                      className="inline-block text-accent-blue hover:text-accent-blue/80 font-medium"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={requestForm.handleSubmit(onRequestReset)} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary-text mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      {...requestForm.register('email')}
                      className={`w-full ${requestForm.formState.errors.email ? 'border-red-500' : ''}`}
                    />
                    {requestForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {requestForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-primary"
                    disabled={requestForm.formState.isSubmitting || requestResetMutation.isPending}
                  >
                    {requestForm.formState.isSubmitting || requestResetMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Reset Email...
                      </>
                    ) : (
                      'Send Reset Email'
                    )}
                  </Button>
                </form>
              )}

              {/* Additional Help */}
              <div className="text-center space-y-2">
                <p className="text-sm text-secondary-text">
                  Need help?{' '}
                  <Link to="/help" className="text-accent-blue hover:text-accent-blue/80">
                    Contact Support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
