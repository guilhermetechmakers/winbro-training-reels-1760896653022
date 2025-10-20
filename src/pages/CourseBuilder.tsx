import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Send, 
  FileText, 
  Video, 
  HelpCircle,
  CheckCircle,
  Clock,
  ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

import { CourseManagementService } from '@/services/courseManagementService';
import type { 
  Course, 
  CourseModule, 
  CourseQuiz 
} from '@/types';
import type {
  CourseBuilderStep,
  CourseMetadataForm,
  PublishSettings,
  CoursePreview,
  CourseBuilderValidationError
} from '@/types/courseBuilder';

// Step configuration
const COURSE_BUILDER_STEPS: CourseBuilderStep[] = [
  'metadata',
  'timeline', 
  'quizzes',
  'preview',
  'publish'
];

const STEP_TITLES = {
  metadata: 'Course Details',
  timeline: 'Course Content',
  quizzes: 'Assessments',
  preview: 'Preview',
  publish: 'Publish'
};

const STEP_DESCRIPTIONS = {
  metadata: 'Set up your course title, description, and basic information',
  timeline: 'Add and organize your course content including videos and resources',
  quizzes: 'Create quizzes and assessments to test learner knowledge',
  preview: 'Review your course before publishing',
  publish: 'Configure publishing settings and make your course live'
};

export default function CourseBuilder() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId?: string }>();
  
  // State management
  const [currentStep, setCurrentStep] = useState<CourseBuilderStep>('metadata');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [validationErrors] = useState<CourseBuilderValidationError[]>([]);

  // Course data
  const [_course, setCourse] = useState<Partial<Course>>({});
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [quizzes, setQuizzes] = useState<CourseQuiz[]>([]);
  const [preview, setPreview] = useState<CoursePreview | null>(null);

  // Form data
  const [metadata, setMetadata] = useState<CourseMetadataForm>({
    title: '',
    description: '',
    targetRole: '',
    estimatedTime: 0,
    prerequisites: [],
    difficultyLevel: 'beginner',
    category: '',
    tags: [],
    visibility: 'private',
    customerScope: [],
    requiresApproval: false,
    allowDownloads: false,
    enableCertificates: true,
    passThreshold: 80,
  });

  const [publishSettings, setPublishSettings] = useState<PublishSettings>({
    visibility: 'private',
    customerScope: [],
    requiresApproval: false,
    scheduledPublish: undefined,
    allowDownloads: false,
    enableCertificates: true,
    passThreshold: 80,
    notifyUsers: false,
    notificationMessage: '',
  });

  // Load course data on mount
  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && !isSaving) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [isDirty, isSaving]);

  const loadCourse = async () => {
    if (!courseId) return;
    
    setIsLoading(true);
    try {
      const courseData = await CourseManagementService.getCourseWithDetails(courseId);
      if (courseData) {
        setCourse(courseData);
        setModules(courseData.modules || []);
        
        // Load metadata form
        setMetadata({
          title: courseData.title || '',
          description: courseData.description || '',
          targetRole: courseData.metadata?.targetRole || '',
          estimatedTime: Math.round((courseData.totalDuration || 0) / 60), // Convert to minutes
          prerequisites: courseData.metadata?.prerequisites || [],
          difficultyLevel: courseData.difficultyLevel || 'beginner',
          category: courseData.category || '',
          tags: courseData.tags || [],
          visibility: courseData.visibility || 'private',
          customerScope: courseData.customerScope || [],
          requiresApproval: courseData.requiresApproval || false,
          allowDownloads: courseData.allowDownloads || false,
          enableCertificates: courseData.enableCertificates !== false,
          passThreshold: courseData.passThreshold || 80,
        });

        // Load publish settings
        setPublishSettings({
          visibility: courseData.visibility || 'private',
          customerScope: courseData.customerScope || [],
          requiresApproval: courseData.requiresApproval || false,
          allowDownloads: courseData.allowDownloads || false,
          enableCertificates: courseData.enableCertificates !== false,
          passThreshold: courseData.passThreshold || 80,
          notifyUsers: false,
          notificationMessage: '',
        });
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!isDirty || isSaving) return;
    
    setIsSaving(true);
    try {
      if (courseId) {
        await CourseManagementService.updateCourseFromBuilder(courseId, metadata);
        setLastSaved(new Date().toISOString());
        setIsDirty(false);
        toast.success('Course auto-saved');
      }
    } catch (error) {
      console.error('Error auto-saving course:', error);
      toast.error('Auto-save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (courseId) {
        await CourseManagementService.updateCourseFromBuilder(courseId, metadata);
      } else {
        const newCourse = await CourseManagementService.createCourseFromBuilder(metadata);
        navigate(`/course-builder/${newCourse.id}`, { replace: true });
      }
      
      setLastSaved(new Date().toISOString());
      setIsDirty(false);
      toast.success('Course saved successfully');
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = () => {
    const currentIndex = COURSE_BUILDER_STEPS.indexOf(currentStep);
    if (currentIndex < COURSE_BUILDER_STEPS.length - 1) {
      setCurrentStep(COURSE_BUILDER_STEPS[currentIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = COURSE_BUILDER_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(COURSE_BUILDER_STEPS[currentIndex - 1]);
    }
  };

  const handlePublish = async () => {
    if (!courseId) return;
    
    setIsSaving(true);
    try {
      await CourseManagementService.publishCourseWithSettings(courseId, publishSettings);
      toast.success('Course published successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error('Failed to publish course');
    } finally {
      setIsSaving(false);
    }
  };

  const generatePreview = async () => {
    if (!courseId) return;
    
    try {
      const previewData = await CourseManagementService.generateCoursePreview(courseId);
      setPreview(previewData);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview');
    }
  };

  // Validation function (currently unused but kept for future use)
  // const validateCurrentStep = (): boolean => {
  //   const errors: CourseBuilderValidationError[] = [];
  //   
  //   if (currentStep === 'metadata') {
  //     if (!metadata.title.trim()) {
  //       errors.push({
  //         field: 'title',
  //         message: 'Course title is required',
  //         severity: 'error',
  //         step: 'metadata',
  //       });
  //     }
  //     if (!metadata.description.trim()) {
  //       errors.push({
  //         field: 'description',
  //         message: 'Course description is required',
  //         severity: 'error',
  //         step: 'metadata',
  //       });
  //     }
  //   }
  //   
  //   setValidationErrors(errors);
  //   return errors.length === 0;
  // };

  const currentStepIndex = COURSE_BUILDER_STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / COURSE_BUILDER_STEPS.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {courseId ? 'Edit Course' : 'Create New Course'}
                </h1>
                <p className="text-sm text-gray-500">
                  {STEP_TITLES[currentStep]}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {lastSaved && (
                <div className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Saved {new Date(lastSaved).toLocaleTimeString()}
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !isDirty}
                className="text-gray-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={generatePreview}
                disabled={!courseId}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>

              {currentStep === 'publish' && (
                <Button
                  onClick={handlePublish}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSaving ? 'Publishing...' : 'Publish Course'}
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStepIndex + 1} of {COURSE_BUILDER_STEPS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Step Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Builder</CardTitle>
                <CardDescription>
                  Follow these steps to create your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {COURSE_BUILDER_STEPS.map((step, index) => (
                  <motion.div
                    key={step}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      currentStep === step
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentStep(step)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step
                        ? 'bg-blue-600 text-white'
                        : index < currentStepIndex
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index < currentStepIndex ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        currentStep === step ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {STEP_TITLES[step]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {STEP_DESCRIPTIONS[step]}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 'metadata' && (
                  <CourseMetadataStep
                    metadata={metadata}
                    onChange={setMetadata}
                    errors={validationErrors}
                    onNext={handleNextStep}
                  />
                )}
                
                {currentStep === 'timeline' && (
                  <CourseTimelineStep
                    modules={modules}
                    onModulesChange={setModules}
                    onNext={handleNextStep}
                    onBack={handlePreviousStep}
                  />
                )}
                
                {currentStep === 'quizzes' && (
                  <CourseQuizzesStep
                    quizzes={quizzes}
                    onQuizzesChange={setQuizzes}
                    onNext={handleNextStep}
                    onBack={handlePreviousStep}
                  />
                )}
                
                {currentStep === 'preview' && (
                  <CoursePreviewStep
                    preview={preview}
                    onGeneratePreview={generatePreview}
                    onNext={handleNextStep}
                    onBack={handlePreviousStep}
                  />
                )}
                
                {currentStep === 'publish' && (
                  <CoursePublishStep
                    settings={publishSettings}
                    onSettingsChange={setPublishSettings}
                    onPublish={handlePublish}
                    onBack={handlePreviousStep}
                    isPublishing={isSaving}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Course Metadata Step Component
function CourseMetadataStep({
  metadata,
  onChange,
  errors,
  onNext
}: {
  metadata: CourseMetadataForm;
  onChange: (metadata: CourseMetadataForm) => void;
  errors: CourseBuilderValidationError[];
  onNext: () => void;
}) {
  const handleChange = (field: keyof CourseMetadataForm, value: any) => {
    onChange({ ...metadata, [field]: value });
  };

  const handleTagsChange = (tags: string[]) => {
    onChange({ ...metadata, tags });
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !metadata.tags.includes(tag.trim())) {
      handleTagsChange([...metadata.tags, tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleTagsChange(metadata.tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Course Details
        </CardTitle>
        <CardDescription>
          Set up the basic information for your course
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Course Title *</Label>
          <Input
            id="title"
            value={metadata.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter course title"
            className={errors.some(e => e.field === 'title') ? 'border-red-500' : ''}
          />
          {errors.some(e => e.field === 'title') && (
            <p className="text-sm text-red-600">
              {errors.find(e => e.field === 'title')?.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Course Description *</Label>
          <Textarea
            id="description"
            value={metadata.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe what learners will learn in this course"
            rows={4}
            className={errors.some(e => e.field === 'description') ? 'border-red-500' : ''}
          />
          {errors.some(e => e.field === 'description') && (
            <p className="text-sm text-red-600">
              {errors.find(e => e.field === 'description')?.message}
            </p>
          )}
        </div>

        {/* Target Role and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="targetRole">Target Role</Label>
            <Input
              id="targetRole"
              value={metadata.targetRole}
              onChange={(e) => handleChange('targetRole', e.target.value)}
              placeholder="e.g., Machine Operators, Engineers"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={metadata.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g., Machine Setup, Maintenance"
            />
          </div>
        </div>

        {/* Difficulty Level and Estimated Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="difficultyLevel">Difficulty Level</Label>
            <Select
              value={metadata.difficultyLevel}
              onValueChange={(value) => handleChange('difficultyLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
            <Input
              id="estimatedTime"
              type="number"
              value={metadata.estimatedTime}
              onChange={(e) => handleChange('estimatedTime', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {metadata.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add a tag and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>

        {/* Prerequisites */}
        <div className="space-y-2">
          <Label>Prerequisites</Label>
          <Textarea
            value={metadata.prerequisites.join('\n')}
            onChange={(e) => handleChange('prerequisites', e.target.value.split('\n').filter(p => p.trim()))}
            placeholder="List any prerequisites for this course (one per line)"
            rows={3}
          />
        </div>

        {/* Course Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Course Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={metadata.visibility}
                onValueChange={(value) => handleChange('visibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passThreshold">Pass Threshold (%)</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[metadata.passThreshold]}
                  onValueChange={([value]) => handleChange('passThreshold', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {metadata.passThreshold}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="requiresApproval">Requires Approval</Label>
              <Switch
                id="requiresApproval"
                checked={metadata.requiresApproval}
                onCheckedChange={(checked) => handleChange('requiresApproval', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowDownloads">Allow Downloads</Label>
              <Switch
                id="allowDownloads"
                checked={metadata.allowDownloads}
                onCheckedChange={(checked) => handleChange('allowDownloads', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enableCertificates">Enable Certificates</Label>
              <Switch
                id="enableCertificates"
                checked={metadata.enableCertificates}
                onCheckedChange={(checked) => handleChange('enableCertificates', checked)}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-6">
          <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
            Next: Course Content
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Placeholder components for other steps
function CourseTimelineStep({ onNext }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Video className="h-5 w-5 mr-2" />
          Course Content
        </CardTitle>
        <CardDescription>
          Add and organize your course content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline Builder</h3>
          <p className="text-gray-600 mb-4">Drag and drop content to build your course timeline</p>
          <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
            Next: Assessments
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseQuizzesStep({ onNext }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HelpCircle className="h-5 w-5 mr-2" />
          Assessments
        </CardTitle>
        <CardDescription>
          Create quizzes and assessments for your course
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz Builder</h3>
          <p className="text-gray-600 mb-4">Create interactive quizzes to test learner knowledge</p>
          <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
            Next: Preview
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CoursePreviewStep({ onNext }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Course Preview
        </CardTitle>
        <CardDescription>
          Review your course before publishing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Mode</h3>
          <p className="text-gray-600 mb-4">See how your course will look to learners</p>
          <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
            Next: Publish
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CoursePublishStep({ onPublish, isPublishing }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Send className="h-5 w-5 mr-2" />
          Publish Course
        </CardTitle>
        <CardDescription>
          Configure publishing settings and make your course live
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Publish Settings</h3>
          <p className="text-gray-600 mb-4">Configure how your course will be published</p>
          <Button 
            onClick={onPublish} 
            disabled={isPublishing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPublishing ? 'Publishing...' : 'Publish Course'}
            <Send className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}