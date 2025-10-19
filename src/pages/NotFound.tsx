import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-main-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <Card className="card animate-fade-in-up">
          <CardHeader>
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-red-600">404</span>
            </div>
            <CardTitle className="text-3xl font-bold text-primary-text">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-lg">
              Sorry, we couldn't find the page you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-secondary-text">
              The page you're looking for might have been moved, deleted, or doesn't exist.
            </p>
            
            <div className="space-y-3">
              <Button asChild className="w-full btn-primary">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/library">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Library
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-secondary-text">
                Need help?{' '}
                <Link to="/help" className="text-accent-blue hover:text-accent-blue/80">
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}