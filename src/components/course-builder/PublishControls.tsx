import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Play, 
  Save, 
  Users, 
  Clock, 
  AlertCircle,
  Globe,
  Lock,
  Shield
} from 'lucide-react';
import type { Course, CourseModule } from '@/types';

interface PublishControlsProps {
  course: Partial<Course>;
  modules: CourseModule[];
  onPublish: () => void;
  onSaveDraft: () => void;
  isPublishing: boolean;
  isSaving: boolean;
}

export default function PublishControls({ 
  course, 
  modules, 
  onPublish, 
  onSaveDraft, 
  isPublishing, 
  isSaving 
}: PublishControlsProps) {
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSettings, setPublishSettings] = useState({
    notifyLearners: true,
    sendEmailNotification: false,
    schedulePublish: false,
    publishDate: '',
    publishTime: '',
  });

  const totalDuration = modules.reduce((acc, module) => acc + (module.estimatedDuration || 0), 0);
  const requiredModules = modules.filter(module => module.isRequired).length;
  // const optionalModules = modules.length - requiredModules;
  const quizCount = modules.filter(module => module.type === 'quiz').length;
  const reelCount = modules.filter(module => module.type === 'reel').length;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4" />;
      case 'organization':
        return <Users className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const canPublish = course.title && modules.length > 0 && !isPublishing;

  const handlePublishClick = () => {
    if (canPublish) {
      setShowPublishModal(true);
    }
  };

  const handleConfirmPublish = () => {
    onPublish();
    setShowPublishModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Course Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-accent-blue" />
            Course Overview
          </CardTitle>
          <CardDescription>
            Review your course details before publishing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-primary-text mb-2">Course Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-secondary-text">Title:</span>
                  <span className="text-primary-text">{course.title || 'Untitled Course'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-secondary-text">Status:</span>
                  <Badge className={getStatusColor(course.status || 'draft')}>
                    {course.status || 'draft'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-secondary-text">Visibility:</span>
                  <div className="flex items-center gap-1">
                    {getVisibilityIcon(course.visibility || 'private')}
                    <span className="text-primary-text capitalize">
                      {course.visibility || 'private'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-secondary-text">Difficulty:</span>
                  <span className="text-primary-text capitalize">
                    {course.difficultyLevel || 'beginner'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-primary-text mb-2">Course Content</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-secondary-text" />
                  <span className="text-secondary-text">Duration:</span>
                  <span className="text-primary-text">{formatDuration(totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-secondary-text">Modules:</span>
                  <span className="text-primary-text">{modules.length}</span>
                  {requiredModules > 0 && (
                    <span className="text-xs text-green-600">
                      ({requiredModules} required)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-secondary-text">Video Reels:</span>
                  <span className="text-primary-text">{reelCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-secondary-text">Quizzes:</span>
                  <span className="text-primary-text">{quizCount}</span>
                </div>
              </div>
            </div>
          </div>

          {course.description && (
            <div>
              <h4 className="font-medium text-primary-text mb-2">Description</h4>
              <p className="text-sm text-secondary-text">{course.description}</p>
            </div>
          )}

          {course.tags && course.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-primary-text mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent-blue" />
            Course Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="requiresApproval"
                  checked={course.requiresApproval || false}
                  disabled
                  className="h-4 w-4"
                />
                <Label htmlFor="requiresApproval" className="text-sm text-primary-text">
                  Requires approval before publishing
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="allowDownloads"
                  checked={course.allowDownloads || false}
                  disabled
                  className="h-4 w-4"
                />
                <Label htmlFor="allowDownloads" className="text-sm text-primary-text">
                  Allow content downloads
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="enableCertificates"
                  checked={course.enableCertificates !== false}
                  disabled
                  className="h-4 w-4"
                />
                <Label htmlFor="enableCertificates" className="text-sm text-primary-text">
                  Enable completion certificates
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-primary-text">Pass Threshold</Label>
                <div className="mt-1 text-sm text-secondary-text">
                  {course.passThreshold || 80}% required to pass
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-primary-text">Customer Scope</Label>
                <div className="mt-1 text-sm text-secondary-text">
                  {course.customerScope && course.customerScope.length > 0
                    ? `${course.customerScope.length} customer(s)`
                    : 'All customers'
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-accent-blue" />
            Publishing Actions
          </CardTitle>
          <CardDescription>
            Save as draft or publish your course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSaving || !course.title}
              className="flex-1"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-accent-blue rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Draft
                </div>
              )}
            </Button>

            <Button
              onClick={handlePublishClick}
              disabled={!canPublish}
              className="flex-1 bg-accent-blue hover:bg-accent-blue/90"
            >
              {isPublishing ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Publish Course
                </div>
              )}
            </Button>
          </div>

          {!canPublish && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Course not ready for publishing</p>
                  <ul className="mt-1 space-y-1">
                    {!course.title && <li>• Course title is required</li>}
                    {modules.length === 0 && <li>• At least one module is required</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-primary-text mb-4">Publish Course</h3>
            
            <div className="space-y-4">
              <p className="text-sm text-secondary-text">
                Are you ready to publish "{course.title}"? This will make it available to learners.
              </p>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="notifyLearners"
                    checked={publishSettings.notifyLearners}
                    onCheckedChange={(checked) => 
                      setPublishSettings(prev => ({ ...prev, notifyLearners: !!checked }))
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="notifyLearners" className="text-sm text-primary-text">
                    Notify enrolled learners
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="sendEmailNotification"
                    checked={publishSettings.sendEmailNotification}
                    onCheckedChange={(checked) => 
                      setPublishSettings(prev => ({ ...prev, sendEmailNotification: !!checked }))
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="sendEmailNotification" className="text-sm text-primary-text">
                    Send email notification
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowPublishModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPublish}
                className="bg-accent-blue hover:bg-accent-blue/90"
              >
                <Play className="h-4 w-4 mr-2" />
                Publish Course
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
