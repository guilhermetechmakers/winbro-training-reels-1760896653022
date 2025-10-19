import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadReel() {
  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">Upload Reel</h1>
          <p className="text-secondary-text">Upload and create new training reels</p>
        </div>
        
        <Card className="card">
          <CardHeader>
            <CardTitle>Upload Reel</CardTitle>
            <CardDescription>Guided uploader for short reels with metadata and auto-processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-primary-text mb-2">Upload Feature Coming Soon</h3>
              <p className="text-secondary-text">This feature will allow you to upload and process training videos.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}