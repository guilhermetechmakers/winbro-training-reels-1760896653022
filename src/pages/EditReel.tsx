import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Download, 
  Trash2, 
  RefreshCw, 
  Clock,
  Tag,
  Play,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useReels, useUpdateReel, useDeleteReel } from '@/hooks/useReels';

export default function EditReel() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('metadata');
  const [hasChanges, setHasChanges] = useState(false);

  // API hooks
  const { data: reels, isLoading } = useReels();
  const updateReelMutation = useUpdateReel();
  const deleteReelMutation = useDeleteReel();

  // Find the current reel
  const reel = reels?.find(r => r.id === id);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    machineModel: '',
    processType: '',
    tooling: '',
    skillLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    visibility: 'private' as 'private' | 'organization' | 'public',
    tags: [] as string[],
    customerScope: [] as string[],
  });

  // Processing options
  const [processingOptions, setProcessingOptions] = useState({
    autoTranscribe: true,
    autoTagging: true,
    generateThumbnails: true,
  });

  // Initialize form data when reel loads
  useEffect(() => {
    if (reel) {
      setFormData({
        title: reel.title,
        description: reel.description,
        machineModel: reel.machineModel || '',
        processType: reel.processType || '',
        tooling: reel.tooling || '',
        skillLevel: reel.skillLevel || 'beginner',
        visibility: reel.visibility || 'private',
        tags: reel.tags || [],
        customerScope: reel.customerScope || [],
      });
    }
  }, [reel]);

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Handle processing options change
  const handleProcessingOptionsChange = (field: string, value: boolean) => {
    setProcessingOptions(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Handle tags change
  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({ ...prev, tags }));
    setHasChanges(true);
  };

  // Save changes
  const handleSave = useCallback(async () => {
    if (!reel) return;

    try {
      await updateReelMutation.mutateAsync({
        id: reel.id,
        updates: {
          title: formData.title,
          description: formData.description,
          machineModel: formData.machineModel,
          processType: formData.processType,
          tooling: formData.tooling,
          skillLevel: formData.skillLevel,
          visibility: formData.visibility,
          tags: formData.tags,
          customerScope: formData.customerScope,
        },
      });
      
      setHasChanges(false);
      toast.success('Reel updated successfully');
    } catch (error) {
      toast.error('Failed to update reel');
      console.error('Error updating reel:', error);
    }
  }, [reel, formData, updateReelMutation]);

  // Delete reel
  const handleDelete = useCallback(async () => {
    if (!reel) return;

    if (window.confirm('Are you sure you want to delete this reel? This action cannot be undone.')) {
      try {
        await deleteReelMutation.mutateAsync(reel.id);
        toast.success('Reel deleted successfully');
        navigate('/library');
      } catch (error) {
        toast.error('Failed to delete reel');
        console.error('Error deleting reel:', error);
      }
    }
  }, [reel, deleteReelMutation, navigate]);

  // Reprocess video
  const handleReprocess = useCallback(async () => {
    if (!reel) return;

    try {
      // TODO: Implement reprocessing API call
      toast.success('Reprocessing started');
    } catch (error) {
      toast.error('Failed to start reprocessing');
      console.error('Error reprocessing:', error);
    }
  }, [reel]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-secondary-text">Loading reel...</p>
        </div>
      </div>
    );
  }

  if (!reel) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-text mb-2">Reel Not Found</h2>
          <p className="text-secondary-text mb-6">The reel you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/library')} className="btn-primary">
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/library')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-primary-text mb-2">Edit Reel</h1>
                <p className="text-secondary-text">Manage your training video content and settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge variant="outline" className="text-amber-600 border-amber-200">
                  Unsaved changes
                </Badge>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || updateReelMutation.isPending}
                className="btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateReelMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="access">Access</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Metadata Tab */}
              <TabsContent value="metadata" className="space-y-6">
                <Card className="card">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Update the basic information about your training reel
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        placeholder="Enter video title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        rows={3}
                        placeholder="Describe what this video demonstrates"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="machineModel">Machine Model</Label>
                        <Input
                          id="machineModel"
                          value={formData.machineModel}
                          onChange={(e) => handleFormChange('machineModel', e.target.value)}
                          placeholder="e.g., Winbro 2000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="processType">Process Type</Label>
                        <Input
                          id="processType"
                          value={formData.processType}
                          onChange={(e) => handleFormChange('processType', e.target.value)}
                          placeholder="e.g., Grinding, Polishing"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tooling">Tooling</Label>
                        <Input
                          id="tooling"
                          value={formData.tooling}
                          onChange={(e) => handleFormChange('tooling', e.target.value)}
                          placeholder="e.g., Diamond wheel, Abrasive"
                        />
                      </div>
                      <div>
                        <Label htmlFor="skillLevel">Skill Level</Label>
                        <Select
                          value={formData.skillLevel}
                          onValueChange={(value) => handleFormChange('skillLevel', value)}
                        >
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
                      <Label htmlFor="tags">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => {
                                const newTags = formData.tags.filter((_, i) => i !== index);
                                handleTagsChange(newTags);
                              }}
                              className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                        <Input
                          placeholder="Add tag..."
                          className="w-32"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const newTag = e.currentTarget.value.trim();
                              if (newTag && !formData.tags.includes(newTag)) {
                                handleTagsChange([...formData.tags, newTag]);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Processing Tab */}
              <TabsContent value="processing" className="space-y-6">
                <Card className="card">
                  <CardHeader>
                    <CardTitle>Processing Options</CardTitle>
                    <CardDescription>
                      Configure how your video is processed and analyzed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoTranscribe">Auto-Transcribe</Label>
                        <p className="text-xs text-secondary-text">
                          Automatically generate transcript from audio
                        </p>
                      </div>
                      <Switch
                        id="autoTranscribe"
                        checked={processingOptions.autoTranscribe}
                        onCheckedChange={(checked) => handleProcessingOptionsChange('autoTranscribe', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoTagging">Auto-Tagging</Label>
                        <p className="text-xs text-secondary-text">
                          AI-suggested tags based on content analysis
                        </p>
                      </div>
                      <Switch
                        id="autoTagging"
                        checked={processingOptions.autoTagging}
                        onCheckedChange={(checked) => handleProcessingOptionsChange('autoTagging', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="generateThumbnails">Generate Thumbnails</Label>
                        <p className="text-xs text-secondary-text">
                          Create multiple thumbnail options
                        </p>
                      </div>
                      <Switch
                        id="generateThumbnails"
                        checked={processingOptions.generateThumbnails}
                        onCheckedChange={(checked) => handleProcessingOptionsChange('generateThumbnails', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="card">
                  <CardHeader>
                    <CardTitle>Reprocess Video</CardTitle>
                    <CardDescription>
                      Reprocess your video with updated settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-secondary-text">
                          This will re-run all processing jobs with current settings
                        </p>
                      </div>
                      <Button
                        onClick={handleReprocess}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reprocess
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Access Tab */}
              <TabsContent value="access" className="space-y-6">
                <Card className="card">
                  <CardHeader>
                    <CardTitle>Visibility & Access</CardTitle>
                    <CardDescription>
                      Control who can view and access this reel
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="visibility">Visibility</Label>
                      <Select
                        value={formData.visibility}
                        onValueChange={(value) => handleFormChange('visibility', value)}
                      >
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
                      <Label htmlFor="customerScope">Customer Scope</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.customerScope.map((customer, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {customer}
                            <button
                              onClick={() => {
                                const newScope = formData.customerScope.filter((_, i) => i !== index);
                                handleFormChange('customerScope', newScope);
                              }}
                              className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                        <Input
                          placeholder="Add customer..."
                          className="w-32"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const newCustomer = e.currentTarget.value.trim();
                              if (newCustomer && !formData.customerScope.includes(newCustomer)) {
                                handleFormChange('customerScope', [...formData.customerScope, newCustomer]);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <Card className="card">
                  <CardHeader>
                    <CardTitle>Video Analytics</CardTitle>
                    <CardDescription>
                      View performance metrics for this reel
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-text">{reel.views}</div>
                        <div className="text-sm text-secondary-text">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-text">0</div>
                        <div className="text-sm text-secondary-text">Downloads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-text">0</div>
                        <div className="text-sm text-secondary-text">Bookmarks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-text">
                          {Math.floor(reel.duration / 60)}m
                        </div>
                        <div className="text-sm text-secondary-text">Duration</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Preview */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-accent-blue" />
                  Video Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  {reel.thumbnailUrl ? (
                    <img 
                      src={reel.thumbnailUrl} 
                      alt={reel.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Play className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-icon-gray" />
                    <span className="text-secondary-text">
                      {Math.floor(reel.duration / 60)}m {reel.duration % 60}s
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-icon-gray" />
                    <span className="text-secondary-text">
                      {reel.tags.length} tags
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status & Actions */}
            <Card className="card">
              <CardHeader>
                <CardTitle>Status & Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-text">Status</span>
                  <Badge 
                    variant={reel.status === 'published' ? 'default' : 'secondary'}
                    className={cn(
                      'text-xs',
                      reel.status === 'published' 
                        ? 'bg-status-green text-white' 
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {reel.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(`/video/${reel.id}`)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Video
                  </Button>
                  <Button
                    onClick={() => {/* TODO: Implement download */}}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    className="w-full justify-start"
                    disabled={deleteReelMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteReelMutation.isPending ? 'Deleting...' : 'Delete Reel'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}