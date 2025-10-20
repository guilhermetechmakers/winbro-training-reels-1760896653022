import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Lightbulb, 
  Mic, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface CaptureGuidanceProps {
  onComplete?: () => void;
  onReset?: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'setup' | 'lighting' | 'audio' | 'content';
  completed: boolean;
}

const initialChecklist: ChecklistItem[] = [
  // Setup
  {
    id: 'camera-stable',
    title: 'Camera is stable',
    description: 'Use a tripod or stable surface to avoid shaky footage',
    category: 'setup',
    completed: false,
  },
  {
    id: 'camera-position',
    title: 'Camera positioned correctly',
    description: 'Position camera to show the work area clearly without obstruction',
    category: 'setup',
    completed: false,
  },
  {
    id: 'duration-check',
    title: 'Target 20-30 seconds',
    description: 'Keep the video focused and concise for maximum impact',
    category: 'setup',
    completed: false,
  },
  
  // Lighting
  {
    id: 'good-lighting',
    title: 'Good lighting setup',
    description: 'Ensure the work area is well-lit without harsh shadows',
    category: 'lighting',
    completed: false,
  },
  {
    id: 'no-backlight',
    title: 'Avoid backlighting',
    description: 'Make sure the subject is not silhouetted against bright backgrounds',
    category: 'lighting',
    completed: false,
  },
  
  // Audio
  {
    id: 'clear-audio',
    title: 'Clear audio quality',
    description: 'Speak clearly and ensure background noise is minimal',
    category: 'audio',
    completed: false,
  },
  {
    id: 'microphone-position',
    title: 'Microphone positioned well',
    description: 'Keep microphone close enough to capture clear speech',
    category: 'audio',
    completed: false,
  },
  
  // Content
  {
    id: 'single-task',
    title: 'Focus on single task',
    description: 'Demonstrate one specific technique or process step',
    category: 'content',
    completed: false,
  },
  {
    id: 'step-by-step',
    title: 'Clear step-by-step process',
    description: 'Break down the process into logical, easy-to-follow steps',
    category: 'content',
    completed: false,
  },
  {
    id: 'safety-highlighted',
    title: 'Safety considerations highlighted',
    description: 'Mention any important safety precautions or warnings',
    category: 'content',
    completed: false,
  },
];

const categoryIcons = {
  setup: Camera,
  lighting: Lightbulb,
  audio: Mic,
  content: Play,
};

const categoryColors = {
  setup: 'bg-blue-100 text-blue-800',
  lighting: 'bg-yellow-100 text-yellow-800',
  audio: 'bg-green-100 text-green-800',
  content: 'bg-purple-100 text-purple-800',
};

export default function CaptureGuidance({ onComplete, onReset }: CaptureGuidanceProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<number | null>(null);

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const toggleItem = (id: string) => {
    setChecklist(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    setRecordingInterval(interval);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
  };

  const resetChecklist = () => {
    setChecklist(initialChecklist);
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    onReset?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-accent-blue" />
            Capture Guidance
          </CardTitle>
          <CardDescription>
            Follow this checklist to create high-quality training reels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-primary-text">
                {completedCount}/{totalCount}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-accent-blue h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm text-secondary-text mt-1">
                  {completionPercentage}% complete
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetChecklist}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              {completionPercentage === 100 && (
                <Button
                  onClick={onComplete}
                  className="btn-primary"
                  size="sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Ready to Record
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recording Timer */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent-blue" />
            Recording Timer
          </CardTitle>
          <CardDescription>
            Track your recording time to stay within the 20-30 second target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl font-bold text-primary-text mb-4">
              {formatTime(recordingTime)}
            </div>
            <div className="flex justify-center gap-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="btn-primary"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>
            <div className="mt-4 text-sm text-secondary-text">
              {recordingTime < 20 && (
                <span className="text-amber-600 flex items-center justify-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Aim for at least 20 seconds
                </span>
              )}
              {recordingTime >= 20 && recordingTime <= 30 && (
                <span className="text-green-600 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Perfect length!
                </span>
              )}
              {recordingTime > 30 && (
                <span className="text-red-600 flex items-center justify-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Consider trimming to 30 seconds or less
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedChecklist).map(([category, items]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          const categoryCompleted = items.filter(item => item.completed).length;
          const categoryTotal = items.length;
          
          return (
            <Card key={category} className="card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-accent-blue" />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <Badge 
                    variant="outline" 
                    className={categoryColors[category as keyof typeof categoryColors]}
                  >
                    {categoryCompleted}/{categoryTotal}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                        item.completed 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <Checkbox
                        id={item.id}
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={item.id}
                          className={`text-sm font-medium cursor-pointer ${
                            item.completed ? 'text-green-800' : 'text-primary-text'
                          }`}
                        >
                          {item.title}
                        </label>
                        <p className="text-xs text-secondary-text mt-1">
                          {item.description}
                        </p>
                      </div>
                      {item.completed && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tips and Best Practices */}
      <Card className="card">
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
            Additional tips for creating effective training reels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-primary-text mb-2">Before Recording</h4>
              <ul className="space-y-1 text-sm text-secondary-text">
                <li>• Test your setup with a short practice run</li>
                <li>• Prepare any tools or materials you'll need</li>
                <li>• Clear the work area of distractions</li>
                <li>• Plan your narration points in advance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary-text mb-2">During Recording</h4>
              <ul className="space-y-1 text-sm text-secondary-text">
                <li>• Speak clearly and at a steady pace</li>
                <li>• Show your hands and tools clearly</li>
                <li>• Use simple, direct language</li>
                <li>• Pause briefly between major steps</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}