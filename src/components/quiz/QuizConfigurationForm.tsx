import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Save, 
  RotateCcw
} from 'lucide-react';
import type { 
  QuizConfigurationProps, 
  QuizConfiguration, 
  QuizConfigurationForm
} from '@/types/quiz';
import type { QuizConfigurationPreset } from '@/types/quiz-configuration';

export function QuizConfigurationForm({
  courseId: _courseId,
  quizId,
  configuration,
  onSave,
  onCancel
}: QuizConfigurationProps) {
  const [formData, setFormData] = useState<QuizConfigurationForm>({
    allow_retake: true,
    max_attempts: 3,
    show_correct_answers: true,
    show_explanations: true,
    randomize_questions: false,
    randomize_answers: false,
    time_limit: undefined,
    pass_threshold: 80,
    require_all_questions: true,
    allow_skip_questions: false,
    show_progress: true,
    show_timer: true,
    auto_submit: false,
    immediate_feedback: false,
    show_score_breakdown: true,
    custom_feedback: undefined
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presets, setPresets] = useState<QuizConfigurationPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // Initialize form data
  useEffect(() => {
    if (configuration) {
      setFormData({
        allow_retake: configuration.allow_retake,
        max_attempts: configuration.max_attempts,
        show_correct_answers: configuration.show_correct_answers,
        show_explanations: configuration.show_explanations,
        randomize_questions: configuration.randomize_questions,
        randomize_answers: configuration.randomize_answers,
        time_limit: configuration.time_limit,
        pass_threshold: configuration.pass_threshold,
        require_all_questions: configuration.require_all_questions,
        allow_skip_questions: configuration.allow_skip_questions,
        show_progress: configuration.show_progress,
        show_timer: configuration.show_timer,
        auto_submit: configuration.auto_submit,
        immediate_feedback: configuration.immediate_feedback,
        show_score_breakdown: configuration.show_score_breakdown,
        custom_feedback: configuration.custom_feedback
      });
    }
  }, [configuration]);

  // Load presets
  useEffect(() => {
    // This would load presets from API
    const mockPresets: QuizConfigurationPreset[] = [
      {
        id: 'default',
        name: 'Default Configuration',
        description: 'Standard quiz settings with moderate restrictions',
        configuration: {
          allow_retake: true,
          max_attempts: 3,
          show_correct_answers: true,
          show_explanations: true,
          randomize_questions: false,
          randomize_answers: false,
          pass_threshold: 80,
          require_all_questions: true,
          allow_skip_questions: false,
          show_progress: true,
          show_timer: true,
          auto_submit: false,
          immediate_feedback: false,
          show_score_breakdown: true
        },
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'strict',
        name: 'Strict Configuration',
        description: 'High security settings with limited attempts and no retakes',
        configuration: {
          allow_retake: false,
          max_attempts: 1,
          show_correct_answers: false,
          show_explanations: false,
          randomize_questions: true,
          randomize_answers: true,
          pass_threshold: 90,
          require_all_questions: true,
          allow_skip_questions: false,
          show_progress: false,
          show_timer: true,
          auto_submit: true,
          immediate_feedback: false,
          show_score_breakdown: false
        },
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'learning',
        name: 'Learning Configuration',
        description: 'Educational settings with immediate feedback and multiple attempts',
        configuration: {
          allow_retake: true,
          max_attempts: 5,
          show_correct_answers: true,
          show_explanations: true,
          randomize_questions: false,
          randomize_answers: false,
          pass_threshold: 70,
          require_all_questions: false,
          allow_skip_questions: true,
          show_progress: true,
          show_timer: false,
          auto_submit: false,
          immediate_feedback: true,
          show_score_breakdown: true
        },
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setPresets(mockPresets);
  }, []);

  const handleInputChange = (field: keyof QuizConfigurationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setFormData(prev => ({ ...prev, ...preset.configuration }));
      setSelectedPreset(presetId);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onSave(formData as QuizConfiguration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (configuration) {
      setFormData({
        allow_retake: configuration.allow_retake,
        max_attempts: configuration.max_attempts,
        show_correct_answers: configuration.show_correct_answers,
        show_explanations: configuration.show_explanations,
        randomize_questions: configuration.randomize_questions,
        randomize_answers: configuration.randomize_answers,
        time_limit: configuration.time_limit,
        pass_threshold: configuration.pass_threshold,
        require_all_questions: configuration.require_all_questions,
        allow_skip_questions: configuration.allow_skip_questions,
        show_progress: configuration.show_progress,
        show_timer: configuration.show_timer,
        auto_submit: configuration.auto_submit,
        immediate_feedback: configuration.immediate_feedback,
        show_score_breakdown: configuration.show_score_breakdown,
        custom_feedback: configuration.custom_feedback
      });
    }
    setSelectedPreset('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quiz Configuration</h2>
              <p className="text-gray-600">Configure quiz settings and behavior</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {quizId ? 'Quiz-specific' : 'Course-wide'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Presets */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Quick Presets</Label>
            <p className="text-sm text-gray-600 mb-4">
              Choose a preset configuration or customize manually
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPreset === preset.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePresetSelect(preset.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-900">{preset.name}</h3>
                  {preset.is_default && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{preset.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Basic Settings */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow_retake">Allow Retakes</Label>
                  <p className="text-sm text-gray-600">Let students retake the quiz</p>
                </div>
                <Switch
                  id="allow_retake"
                  checked={formData.allow_retake}
                  onCheckedChange={(checked) => handleInputChange('allow_retake', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_attempts">Maximum Attempts</Label>
                <Input
                  id="max_attempts"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.max_attempts}
                  onChange={(e) => handleInputChange('max_attempts', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pass_threshold">Pass Threshold (%)</Label>
                <Input
                  id="pass_threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.pass_threshold}
                  onChange={(e) => handleInputChange('pass_threshold', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_limit">Time Limit (seconds)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  min="1"
                  placeholder="No limit"
                  value={formData.time_limit || ''}
                  onChange={(e) => handleInputChange('time_limit', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="require_all_questions">Require All Questions</Label>
                  <p className="text-sm text-gray-600">Students must answer all questions</p>
                </div>
                <Switch
                  id="require_all_questions"
                  checked={formData.require_all_questions}
                  onCheckedChange={(checked) => handleInputChange('require_all_questions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow_skip_questions">Allow Skipping Questions</Label>
                  <p className="text-sm text-gray-600">Let students skip questions</p>
                </div>
                <Switch
                  id="allow_skip_questions"
                  checked={formData.allow_skip_questions}
                  onCheckedChange={(checked) => handleInputChange('allow_skip_questions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto_submit">Auto Submit</Label>
                  <p className="text-sm text-gray-600">Automatically submit when time expires</p>
                </div>
                <Switch
                  id="auto_submit"
                  checked={formData.auto_submit}
                  onCheckedChange={(checked) => handleInputChange('auto_submit', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Display Settings */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show_progress">Show Progress</Label>
                  <p className="text-sm text-gray-600">Display progress bar during quiz</p>
                </div>
                <Switch
                  id="show_progress"
                  checked={formData.show_progress}
                  onCheckedChange={(checked) => handleInputChange('show_progress', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show_timer">Show Timer</Label>
                  <p className="text-sm text-gray-600">Display countdown timer</p>
                </div>
                <Switch
                  id="show_timer"
                  checked={formData.show_timer}
                  onCheckedChange={(checked) => handleInputChange('show_timer', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show_correct_answers">Show Correct Answers</Label>
                  <p className="text-sm text-gray-600">Display correct answers after completion</p>
                </div>
                <Switch
                  id="show_correct_answers"
                  checked={formData.show_correct_answers}
                  onCheckedChange={(checked) => handleInputChange('show_correct_answers', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show_explanations">Show Explanations</Label>
                  <p className="text-sm text-gray-600">Display explanations for answers</p>
                </div>
                <Switch
                  id="show_explanations"
                  checked={formData.show_explanations}
                  onCheckedChange={(checked) => handleInputChange('show_explanations', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="show_score_breakdown">Show Score Breakdown</Label>
                  <p className="text-sm text-gray-600">Display detailed score information</p>
                </div>
                <Switch
                  id="show_score_breakdown"
                  checked={formData.show_score_breakdown}
                  onCheckedChange={(checked) => handleInputChange('show_score_breakdown', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="immediate_feedback">Immediate Feedback</Label>
                  <p className="text-sm text-gray-600">Show feedback immediately after answering</p>
                </div>
                <Switch
                  id="immediate_feedback"
                  checked={formData.immediate_feedback}
                  onCheckedChange={(checked) => handleInputChange('immediate_feedback', checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Randomization Settings */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Randomization Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="randomize_questions">Randomize Questions</Label>
                <p className="text-sm text-gray-600">Present questions in random order</p>
              </div>
              <Switch
                id="randomize_questions"
                checked={formData.randomize_questions}
                onCheckedChange={(checked) => handleInputChange('randomize_questions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="randomize_answers">Randomize Answers</Label>
                <p className="text-sm text-gray-600">Present answer options in random order</p>
              </div>
              <Switch
                id="randomize_answers"
                checked={formData.randomize_answers}
                onCheckedChange={(checked) => handleInputChange('randomize_answers', checked)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Custom Feedback */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Feedback</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_feedback">Custom Feedback Message</Label>
            <Textarea
              id="custom_feedback"
              placeholder="Enter custom feedback message to display after quiz completion..."
              value={formData.custom_feedback || ''}
              onChange={(e) => handleInputChange('custom_feedback', e.target.value)}
              rows={3}
            />
            <p className="text-sm text-gray-600">
              This message will be displayed to students after completing the quiz.
            </p>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={onCancel}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
