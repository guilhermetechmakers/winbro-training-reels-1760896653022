import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">Help Center</h1>
          <p className="text-secondary-text">Documentation and support resources</p>
        </div>
        
        <Card className="card">
          <CardHeader>
            <CardTitle>Help Center</CardTitle>
            <CardDescription>Documentation and support resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-primary-text mb-2">Help Center Coming Soon</h3>
              <p className="text-secondary-text">This feature will provide comprehensive help and documentation.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}