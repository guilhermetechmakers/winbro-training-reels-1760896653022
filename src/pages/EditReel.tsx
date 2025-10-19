import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditReel() {
  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">Edit Reel</h1>
          <p className="text-secondary-text">Update metadata, access controls, and reprocessing</p>
        </div>
        
        <Card className="card">
          <CardHeader>
            <CardTitle>Edit Reel</CardTitle>
            <CardDescription>Update metadata, access controls, and reprocessing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-primary-text mb-2">Edit Feature Coming Soon</h3>
              <p className="text-secondary-text">This feature will allow you to edit reel metadata and settings.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}