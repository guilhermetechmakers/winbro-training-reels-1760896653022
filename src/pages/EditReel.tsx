import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  ArrowLeft, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Download,
  Share,
  FileVideo,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Form validation schema
const videoEditSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  machineModel: z.string().optional(),
  processType: z.string().optional(),
  tooling: z.string().optional(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['private', 'public', 'organization']).default('private'),
  status: z.enum(['draft', 'pending_review', 'published', 'archived']).default('draft'),
  autoTranscribe: z.boolean().default(true),
  allowDownload: z.boolean().default(false),
  allowComments: z.boolean().default(true)
});

type VideoEditFormData = z.infer<typeof videoEditSchema>;

export default function EditReel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mock video data
  const [video, setVideo] = useState({
    id: id,
    title: "CNC Mill Setup - Tool Change",
    description: "Step-by-step guide for safely changing tools on the CNC mill, including proper setup and safety checks.",
    duration: 28,
    file_size: 15728640, // 15MB
    mime_type: "video/mp4",
    video_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    thumbnail_url: "https://via.placeholder.com/1280x720/2563EB/FFFFFF?text=Video+Thumbnail",
    processing_status: "completed",
    processing_progress: 100,
    machine_model: "CNC Mill 2000",
    process_type: "Tool Change",
    tooling: "Carbide Inserts",
    skill_level: "intermediate",
    tags: ["CNC", "Setup", "Tool Change"],
    visibility: "private",
    status: "published",
    view_count: 1247,
    download_count: 23,
    bookmark_count: 45,
    created_at: "2024-12-13T10:00:00Z",
    updated_at: "2024-12-13T10:00:00Z",
    author: {
      id: "1",
      name: "John Smith",
      role: "Senior Engineer"
    }
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<VideoEditFormData>({
    resolver: zodResolver(videoEditSchema),
    defaultValues: {
      title: video.title,
      description: video.description,
      machineModel: video.machine_model,
      processType: video.process_type,
      tooling: video.tooling,
      skillLevel: video.skill_level as 'beginner' | 'intermediate' | 'advanced',
      tags: video.tags,
      visibility: video.visibility as 'private' | 'public' | 'organization',
      status: video.status as 'draft' | 'pending_review' | 'published' | 'archived',
      autoTranscribe: true,
      allowDownload: false,
      allowComments: true
    }
  });

  const watchedTags = watch('tags') || [];

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle tag management
  const addTag = (tag: string) => {
    if (tag.trim() && !watchedTags.includes(tag.trim())) {
      setValue('tags', [...watchedTags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const onSubmit = async (data: VideoEditFormData) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update video data
      setVideo(prev => ({
        ...prev,
        ...data,
        updated_at: new Date().toISOString()
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reprocessing
  const handleReprocess = async () => {
    try {
      // Simulate reprocessing
      console.log('Reprocessing video...');
    } catch (error) {
      console.error('Reprocessing failed:', error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      try {
        // Simulate delete
        console.log('Deleting video...');
        navigate('/content-library');
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  useEffect(() => {
    // Simulate loading video data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-secondary-text">Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-primary-text">Edit Video</h1>
          </div>
          <p className="text-secondary-text">Update metadata, access controls, and processing settings</p>
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
          >
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">Changes saved successfully!</span>
          </motion.div>
        )}

        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
          >
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{saveError}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value="metadata" onValueChange={() => {}} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="access">Access Control</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
              </TabsList>

              {/* Metadata Tab */}
              <TabsContent value="metadata" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Video Information</CardTitle>
                    <CardDescription>
                      Update the basic information about your video
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        {...register('title')}
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...register('description')}
                        rows={3}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="machineModel">Machine Model</Label>
                        <Input
                          id="machineModel"
                          {...register('machineModel')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="processType">Process Type</Label>
                        <Input
                          id="processType"
                          {...register('processType')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tooling">Tooling</Label>
                        <Input
                          id="tooling"
                          {...register('tooling')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="skillLevel">Skill Level</Label>
                        <Select onValueChange={(value) => setValue('skillLevel', value as any)}>
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
                      <Label>Tags</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a tag"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag(e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder="Add a tag"]') as HTMLInputElement;
                              if (input) {
                                addTag(input.value);
                                input.value = '';
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        {watchedTags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {watchedTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Access Control Tab */}
              <TabsContent value="access" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Access Control</CardTitle>
                    <CardDescription>
                      Control who can view and access this video
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="visibility">Visibility</Label>
                      <Select onValueChange={(value) => setValue('visibility', value as any)}>
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

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select onValueChange={(value) => setValue('status', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="pending_review">Pending Review</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allowDownload">Allow Download</Label>
                          <p className="text-sm text-gray-500">Users can download this video</p>
                        </div>
                        <Switch
                          id="allowDownload"
                          checked={watch('allowDownload')}
                          onCheckedChange={(checked) => setValue('allowDownload', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allowComments">Allow Comments</Label>
                          <p className="text-sm text-gray-500">Users can add comments and notes</p>
                        </div>
                        <Switch
                          id="allowComments"
                          checked={watch('allowComments')}
                          onCheckedChange={(checked) => setValue('allowComments', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Processing Tab */}
              <TabsContent value="processing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Settings</CardTitle>
                    <CardDescription>
                      Manage video processing and reprocessing options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoTranscribe">Auto-Transcribe</Label>
                          <p className="text-sm text-gray-500">Automatically generate transcript</p>
                        </div>
                        <Switch
                          id="autoTranscribe"
                          checked={watch('autoTranscribe')}
                          onCheckedChange={(checked) => setValue('autoTranscribe', checked)}
                        />
                      </div>

                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Reprocessing Required</h4>
                            <p className="text-sm text-yellow-700">
                              Some changes require reprocessing the video. This may take several minutes.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={handleReprocess}
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reprocess Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Video Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileVideo className="h-4 w-4" />
                    {formatFileSize(video.file_size)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {formatTime(video.duration)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    {video.author.name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(video.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Video Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-text">{video.view_count.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-text">{video.download_count}</div>
                    <div className="text-sm text-gray-500">Downloads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-text">{video.bookmark_count}</div>
                    <div className="text-sm text-gray-500">Bookmarks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-text">100%</div>
                    <div className="text-sm text-gray-500">Processed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={!isDirty || isSaving}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Video
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}