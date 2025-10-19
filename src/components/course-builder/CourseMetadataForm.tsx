import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus, BookOpen, Users, Lock, Globe, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import type { Course } from '@/types';

interface CourseMetadataFormProps {
  course: Partial<Course>;
  onUpdate: (updates: Partial<Course>) => void;
  isEditing?: boolean;
}

export default function CourseMetadataForm({ course, onUpdate }: CourseMetadataFormProps) { 
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !course.tags?.includes(newTag.trim())) {
      onUpdate({ tags: [...(course.tags || []), newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate({ tags: course.tags?.filter(tag => tag !== tagToRemove) || [] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-6 w-6 text-accent-blue" />
            Course Details
          </CardTitle>
          <CardDescription>
            Configure the basic information and settings for your course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-primary-text">
                Course Title *
              </Label>
              <Input
                id="title"
                type="text"
                value={course?.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Enter a compelling course title"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-primary-text">
                Description
              </Label>
              <Textarea
                id="description"
                value={course?.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Describe what students will learn in this course"
                className="mt-2 h-24 resize-none"
              />
            </div>
          </div>

          {/* Course Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-primary-text">Difficulty Level</Label>
              <Select
                value={course?.difficultyLevel || 'beginner'}
                onValueChange={(value) => onUpdate({ difficultyLevel: value as any })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-primary-text">Category</Label>
              <Input
                value={course?.category || ''}
                onChange={(e) => onUpdate({ category: e.target.value })}
                placeholder="e.g., Machine Operation, Safety"
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-primary-text">Visibility</Label>
              <Select
                value={course?.visibility || 'private'}
                onValueChange={(value) => onUpdate({ visibility: value as any })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Private
                    </div>
                  </SelectItem>
                  <SelectItem value="organization">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Organization
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Public
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-primary-text">Pass Threshold (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={course?.passThreshold || 80}
                onChange={(e) => onUpdate({ passThreshold: parseInt(e.target.value) || 80 })}
                className="mt-2"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium text-primary-text">Tags</Label>
            <div className="mt-2 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="px-3 py-1 text-sm"
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-lg font-semibold text-primary-text flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent-blue" />
              Advanced Settings
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="requiresApproval"
                  checked={course?.requiresApproval || false}
                  onChange={(e) => onUpdate({ requiresApproval: e.target.checked })}
                  className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-300 rounded"
                />
                <Label htmlFor="requiresApproval" className="text-sm text-primary-text">
                  Requires approval before publishing
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowDownloads"
                  checked={course?.allowDownloads || false}
                  onChange={(e) => onUpdate({ allowDownloads: e.target.checked })}
                  className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-300 rounded"
                />
                <Label htmlFor="allowDownloads" className="text-sm text-primary-text">
                  Allow content downloads
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableCertificates"
                  checked={course?.enableCertificates !== false}
                  onChange={(e) => onUpdate({ enableCertificates: e.target.checked })}
                  className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-300 rounded"
                />
                <Label htmlFor="enableCertificates" className="text-sm text-primary-text">
                  Enable completion certificates
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
