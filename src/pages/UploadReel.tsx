import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, CheckCircle, AlertCircle, Clock, FileVideo } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UploadReel() {
  const [uploadStep, setUploadStep] = useState<'upload' | 'metadata' | 'processing' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const maxSize = 500 * 1024 * 1024; // 500MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file format: ${file.type}. Supported formats: ${allowedTypes.join(', ')}`
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large: ${formatFileSize(file.size)}. Maximum size: ${formatFileSize(maxSize)}`
      };
    }

    return { valid: true };
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setUploadStep('metadata');
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragOver(true);
    }
  }, [isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      handleFileSelect(videoFile);
    }
  }, [isUploading, handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStep('processing');

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsUploading(false);
          setUploadStep('complete');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Handle reset
  const handleReset = () => {
    setUploadStep('upload');
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">Upload Training Reel</h1>
          <p className="text-secondary-text">Upload and create new training videos with metadata</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { key: 'upload', label: 'Upload Video', icon: Upload },
              { key: 'metadata', label: 'Add Metadata', icon: FileVideo },
              { key: 'processing', label: 'Processing', icon: Clock },
              { key: 'complete', label: 'Complete', icon: CheckCircle }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = uploadStep === step.key;
              const isCompleted = ['upload', 'metadata', 'processing', 'complete'].indexOf(uploadStep) > index;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${isActive ? 'border-accent-blue bg-accent-blue text-white' : 
                      isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                      'border-gray-300 bg-white text-gray-400'}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-accent-blue' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Step */}
        {uploadStep === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="card">
              <CardHeader>
                <CardTitle>Upload Video File</CardTitle>
                <CardDescription>
                  Select a video file to upload. Supported formats: MP4, WebM, QuickTime, AVI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    'relative border-2 border-dashed rounded-lg transition-all duration-200 p-8 text-center',
                    isDragOver && !isUploading
                      ? 'border-blue-400 bg-blue-50'
                      : uploadError
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 bg-white hover:border-gray-400',
                    isUploading && 'pointer-events-none'
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />

                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ 
                      scale: isDragOver ? 1.05 : 1,
                      rotate: isUploading ? 360 : 0
                    }}
                    transition={{ 
                      scale: { duration: 0.2 },
                      rotate: { duration: 2, repeat: isUploading ? Infinity : 0 }
                    }}
                    className="mb-4"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  </motion.div>

                  <h3 className="text-lg font-semibold text-primary-text mb-2">
                    Drop your video here or click to browse
                  </h3>
                  <p className="text-secondary-text mb-4">
                    Supported formats: MP4, WebM, QuickTime, AVI
                  </p>
                  <p className="text-sm text-gray-500">
                    Maximum file size: 500MB
                  </p>
                </div>
                
                {uploadError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-700">{uploadError}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Metadata Step */}
        {uploadStep === 'metadata' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="card">
              <CardHeader>
                <CardTitle>Add Video Metadata</CardTitle>
                <CardDescription>
                  Provide details about your training video for better organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedFile && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileVideo className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-primary-text">{selectedFile.name}</p>
                          <p className="text-sm text-secondary-text">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadStep('upload')}
                      >
                        Change File
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter video title"
                      defaultValue={selectedFile?.name.replace(/\.[^/.]+$/, '')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      placeholder="Describe what this video demonstrates"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="machineModel">Machine Model</Label>
                      <Input
                        id="machineModel"
                        placeholder="e.g., Winbro 2000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="processType">Process Type</Label>
                      <Input
                        id="processType"
                        placeholder="e.g., Grinding, Polishing"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tooling">Tooling</Label>
                      <Input
                        id="tooling"
                        placeholder="e.g., Diamond wheel, Abrasive"
                      />
                    </div>
                    <div>
                      <Label htmlFor="skillLevel">Skill Level</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setUploadStep('upload')}>
                      Back
                    </Button>
                    <Button onClick={handleUpload}>
                      Upload Video
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Processing Step */}
        {uploadStep === 'processing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="card">
              <CardHeader>
                <CardTitle>Processing Video</CardTitle>
                <CardDescription>
                  Your video is being processed. This may take a few minutes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-blue mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-primary-text mb-2">Processing in Progress</h3>
                  <p className="text-secondary-text mb-4">
                    We're transcoding your video, generating thumbnails, and creating a transcript.
                  </p>
                  
                  <div className="mb-6">
                    <Progress value={uploadProgress} className="mb-2" />
                    <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Video uploaded</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-blue"></div>
                      <span className="text-sm text-gray-600">Transcoding video</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-blue"></div>
                      <span className="text-sm text-gray-600">Generating thumbnails</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-blue"></div>
                      <span className="text-sm text-gray-600">Creating transcript</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Complete Step */}
        {uploadStep === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="card">
              <CardHeader>
                <CardTitle>Upload Complete!</CardTitle>
                <CardDescription>
                  Your training video has been successfully uploaded and processed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-primary-text mb-2">Video Ready</h3>
                  <p className="text-secondary-text mb-6">
                    Your video is now available in your library and ready to be used in courses.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button onClick={handleReset} variant="outline">
                      Upload Another Video
                    </Button>
                    <Button onClick={() => window.location.href = '/content-library'}>
                      View in Library
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upload Guidelines */}
        <div className="mt-8">
          <Card className="card">
            <CardHeader>
              <CardTitle>Upload Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-primary-text mb-2">Video Requirements</h4>
                  <ul className="space-y-1 text-sm text-secondary-text">
                    <li>• Duration: 20-30 seconds recommended</li>
                    <li>• Format: MP4, WebM, QuickTime, AVI</li>
                    <li>• Size: Maximum 500MB</li>
                    <li>• Resolution: 720p or higher</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-text mb-2">Best Practices</h4>
                  <ul className="space-y-1 text-sm text-secondary-text">
                    <li>• Use good lighting and clear audio</li>
                    <li>• Focus on one specific task or technique</li>
                    <li>• Add descriptive title and tags</li>
                    <li>• Include machine model and process type</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}