import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContentList() {
  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">Content List</h1>
          <p className="text-secondary-text">Admin listing of all reels with moderation actions</p>
        </div>
        
        <Card className="card">
          <CardHeader>
            <CardTitle>Content List</CardTitle>
            <CardDescription>Admin listing of all reels with moderation actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-primary-text mb-2">Content List Coming Soon</h3>
              <p className="text-secondary-text">This feature will show all content with moderation controls.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}