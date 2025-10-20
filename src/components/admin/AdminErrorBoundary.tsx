/**
 * Admin Error Boundary Component
 * Comprehensive error handling for admin dashboard components
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { toast } from 'sonner';

// =====================================================
// Error Boundary Props and State
// =====================================================

interface AdminErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

// =====================================================
// Error Boundary Component
// =====================================================

export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AdminErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('Admin Error Boundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Show error toast
    toast.error('An error occurred in the admin dashboard', {
      description: 'Please try refreshing the page or contact support if the issue persists.',
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleReportBug = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In a real app, this would send to error reporting service
    console.log('Bug report data:', errorDetails);
    
    // Copy error details to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    toast.success('Error details copied to clipboard');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-main-bg flex items-center justify-center p-4">
          <Card className="card max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-primary-text">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-lg">
                The admin dashboard encountered an unexpected error
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Details */}
              {this.props.showDetails && this.state.error && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-primary-text mb-2">Error Details</h4>
                  <div className="text-sm text-secondary-text space-y-1">
                    <p><strong>Error ID:</strong> {this.state.errorId}</p>
                    <p><strong>Message:</strong> {this.state.error.message}</p>
                    <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                  </div>
                  
                  {this.state.error.stack && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-primary-text">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs text-secondary-text bg-white p-2 rounded border overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="btn-primary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button onClick={this.handleGoHome} variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
                
                <Button onClick={this.handleReportBug} variant="outline">
                  <Bug className="h-4 w-4 mr-2" />
                  Report Bug
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-secondary-text">
                <p>
                  If this error persists, please contact support with the Error ID above.
                </p>
                <p className="mt-1">
                  You can also try refreshing the page or clearing your browser cache.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// =====================================================
// Error Fallback Components
// =====================================================

export function AdminErrorFallback({ 
  error: _error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void; 
}) {
  return (
    <Card className="card">
      <CardContent className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-primary-text mb-2">
          Component Error
        </h3>
        <p className="text-secondary-text mb-4">
          This component encountered an error and couldn't render properly.
        </p>
        <Button onClick={resetError} className="btn-primary">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Component
        </Button>
      </CardContent>
    </Card>
  );
}

// =====================================================
// Error Handler Hook
// =====================================================

export function useAdminErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    console.error(`Admin Error${context ? ` in ${context}` : ''}:`, error);
    
    // In a real app, this would send to error reporting service
    // errorReportingService.captureException(error, { context });
    
    toast.error('An error occurred', {
      description: context ? `Error in ${context}` : 'Please try again',
    });
  };

  const handleAsyncError = (error: unknown, context?: string) => {
    const errorMessage = error instanceof Error ? error : new Error(String(error));
    handleError(errorMessage, context);
  };

  return {
    handleError,
    handleAsyncError,
  };
}

// =====================================================
// Error Boundary Wrapper
// =====================================================

interface AdminErrorWrapperProps {
  children: ReactNode;
  context?: string;
  fallback?: ReactNode;
}

export function AdminErrorWrapper({ 
  children, 
  context, 
  fallback 
}: AdminErrorWrapperProps) {
  return (
    <AdminErrorBoundary
      showDetails={import.meta.env.DEV}
      onError={(error, errorInfo) => {
        console.error(`Admin Error in ${context || 'Unknown'}:`, error, errorInfo);
      }}
      fallback={fallback}
    >
      {children}
    </AdminErrorBoundary>
  );
}
