import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  GripVertical, 
  Play, 
  Clock, 
  Edit3, 
  Trash2, 
  Copy,
  Video,
  FileText,
  HelpCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CourseModule, Reel } from '@/types';

interface EnhancedDragDropTimelineProps {
  modules: CourseModule[];
  availableReels: Reel[];
  onAddModule: (module: Omit<CourseModule, 'id' | 'courseId' | 'orderIndex'>) => void;
  onUpdateModule: (moduleId: string, updates: Partial<CourseModule>) => void;
  onDeleteModule: (moduleId: string) => void;
  onReorderModules: (moduleIds: string[]) => void;
  isPreviewMode?: boolean;
}

interface DragState {
  draggedItem: CourseModule | null;
  draggedOverItem: CourseModule | null;
  dragPosition: 'above' | 'below' | null;
}

export default function EnhancedDragDropTimeline({
  modules,
  availableReels,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  onReorderModules,
  isPreviewMode = false,
}: EnhancedDragDropTimelineProps) {
  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    draggedOverItem: null,
    dragPosition: null,
  });
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleType, setNewModuleType] = useState<'reel' | 'text' | 'quiz'>('reel');
  const [newModuleData, setNewModuleData] = useState({
    title: '',
    description: '',
    content: '',
  });

  const dragRef = useRef<HTMLDivElement>(null);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, module: CourseModule) => {
    if (isPreviewMode) return;
    
    setDragState(prev => ({ ...prev, draggedItem: module }));
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', module.id);
  }, [isPreviewMode]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, module: CourseModule) => {
    if (isPreviewMode) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const position = e.clientY < midpoint ? 'above' : 'below';

    setDragState(prev => ({
      ...prev,
      draggedOverItem: module,
      dragPosition: position,
    }));
  }, [isPreviewMode]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      draggedOverItem: null,
      dragPosition: null,
    }));
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, targetModule: CourseModule) => {
    if (isPreviewMode) return;
    
    e.preventDefault();
    
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId === targetModule.id) return;

    const draggedModule = modules.find(m => m.id === draggedId);
    if (!draggedModule) return;

    const draggedIndex = modules.findIndex(m => m.id === draggedId);
    const targetIndex = modules.findIndex(m => m.id === targetModule.id);
    
    let newOrder: string[];
    
    if (dragState.dragPosition === 'above') {
      // Insert before target
      if (draggedIndex < targetIndex) {
        newOrder = [
          ...modules.slice(0, draggedIndex).map(m => m.id),
          ...modules.slice(draggedIndex + 1, targetIndex).map(m => m.id),
          draggedId,
          targetModule.id,
          ...modules.slice(targetIndex + 1).map(m => m.id),
        ];
      } else {
        newOrder = [
          ...modules.slice(0, targetIndex).map(m => m.id),
          draggedId,
          ...modules.slice(targetIndex, draggedIndex).map(m => m.id),
          ...modules.slice(draggedIndex + 1).map(m => m.id),
        ];
      }
    } else {
      // Insert after target
      if (draggedIndex < targetIndex) {
        newOrder = [
          ...modules.slice(0, draggedIndex).map(m => m.id),
          ...modules.slice(draggedIndex + 1, targetIndex + 1).map(m => m.id),
          draggedId,
          ...modules.slice(targetIndex + 1).map(m => m.id),
        ];
      } else {
        newOrder = [
          ...modules.slice(0, targetIndex + 1).map(m => m.id),
          draggedId,
          ...modules.slice(targetIndex + 1, draggedIndex).map(m => m.id),
          ...modules.slice(draggedIndex + 1).map(m => m.id),
        ];
      }
    }

    onReorderModules(newOrder);
    setDragState({
      draggedItem: null,
      draggedOverItem: null,
      dragPosition: null,
    });
  }, [isPreviewMode, modules, dragState.dragPosition, onReorderModules]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragState({
      draggedItem: null,
      draggedOverItem: null,
      dragPosition: null,
    });
  }, []);

  // Add new module
  const handleAddModule = useCallback(() => {
    if (!newModuleData.title.trim()) return;

    const moduleData: Omit<CourseModule, 'id' | 'courseId' | 'orderIndex'> = {
      title: newModuleData.title,
      description: newModuleData.description,
      type: newModuleType,
      content: newModuleType === 'text' 
        ? { text: newModuleData.content }
        : newModuleType === 'quiz'
        ? { 
            id: `quiz_${Date.now()}`,
            question: newModuleData.title, 
            type: 'multiple-choice' as const, 
            options: [], 
            correctAnswer: '',
            points: 10,
            courseId: '',
            orderIndex: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : availableReels[0] || null,
      order: modules.length,
      estimatedDuration: newModuleType === 'text' ? 0 : newModuleType === 'quiz' ? 300 : 0,
      isRequired: true,
      unlockAfterPrevious: true,
      contentId: newModuleType === 'reel' ? availableReels[0]?.id : undefined,
      contentData: newModuleType === 'text' ? { text: newModuleData.content } : {},
    };

    onAddModule(moduleData);
    setNewModuleData({ title: '', description: '', content: '' });
    setShowAddModule(false);
  }, [newModuleData, newModuleType, availableReels, modules.length, onAddModule]);

  // Duplicate module
  const handleDuplicateModule = useCallback((module: CourseModule) => {
    const duplicatedModule: Omit<CourseModule, 'id' | 'courseId' | 'orderIndex'> = {
      ...module,
      title: `${module.title} (Copy)`,
      order: modules.length,
    };
    onAddModule(duplicatedModule);
  }, [modules.length, onAddModule]);

  // Get module icon
  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'reel': return Video;
      case 'text': return FileText;
      case 'quiz': return HelpCircle;
      default: return FileText;
    }
  };

  // Get module color
  const getModuleColor = (type: string) => {
    switch (type) {
      case 'reel': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'text': return 'bg-green-100 text-green-800 border-green-200';
      case 'quiz': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary-text">Course Timeline</h3>
          <p className="text-sm text-secondary-text">
            Drag and drop to reorder modules. Click to edit details.
          </p>
        </div>
        {!isPreviewMode && (
          <Button
            onClick={() => setShowAddModule(true)}
            className="btn-primary"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <AnimatePresence>
          {modules.map((module, index) => {
            const Icon = getModuleIcon(module.type);
            const isDraggedOver = dragState.draggedOverItem?.id === module.id;
            const isDragging = dragState.draggedItem?.id === module.id;
            const isEditing = editingModule === module.id;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileDrag={{ scale: 1.05, rotate: 2 }}
                drag={!isPreviewMode}
                dragConstraints={dragRef}
                onDragStart={(e) => handleDragStart(e as any, module)}
                onDragOver={(e) => handleDragOver(e as any, module)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e as any, module)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'relative group',
                  isDragging && 'opacity-50',
                  isDraggedOver && dragState.dragPosition === 'above' && 'border-t-2 border-accent-blue',
                  isDraggedOver && dragState.dragPosition === 'below' && 'border-b-2 border-accent-blue'
                )}
              >
                <Card className={cn(
                  'card transition-all duration-200',
                  isDraggedOver && 'shadow-lg',
                  isEditing && 'ring-2 ring-accent-blue'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Drag Handle */}
                      {!isPreviewMode && (
                        <div className="flex-shrink-0 cursor-move">
                          <GripVertical className="h-5 w-5 text-icon-gray" />
                        </div>
                      )}

                      {/* Module Number */}
                      <div className="flex-shrink-0 w-8 h-8 bg-accent-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>

                      {/* Module Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={cn('text-xs', getModuleColor(module.type))}>
                            <Icon className="h-3 w-3 mr-1" />
                            {module.type}
                          </Badge>
                          {module.isRequired && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                          {module.unlockAfterPrevious && (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Sequential
                            </Badge>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="space-y-3">
                            <Input
                              value={module.title}
                              onChange={(e) => onUpdateModule(module.id, { title: e.target.value })}
                              placeholder="Module title"
                              className="font-medium"
                            />
                            <Textarea
                              value={module.description || ''}
                              onChange={(e) => onUpdateModule(module.id, { description: e.target.value })}
                              placeholder="Module description"
                              rows={2}
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => setEditingModule(null)}
                                size="sm"
                                className="btn-primary"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button
                                onClick={() => setEditingModule(null)}
                                size="sm"
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-medium text-primary-text mb-1">
                              {module.title}
                            </h4>
                            {module.description && (
                              <p className="text-sm text-secondary-text mb-2">
                                {module.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-secondary-text">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {module.estimatedDuration > 0 
                                  ? `${Math.floor(module.estimatedDuration / 60)}m`
                                  : 'N/A'
                                }
                              </div>
                              {module.type === 'reel' && (
                                <div className="flex items-center gap-1">
                                  <Play className="h-3 w-3" />
                                  Video
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Module Actions */}
                      {!isPreviewMode && !isEditing && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => setEditingModule(module.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDuplicateModule(module)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteModule(module.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {modules.length === 0 && (
          <Card className="card">
            <CardContent className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Video className="h-8 w-8 text-icon-gray" />
              </div>
              <h3 className="text-lg font-medium text-primary-text mb-2">
                No modules yet
              </h3>
              <p className="text-secondary-text mb-6">
                Add your first module to start building your course
              </p>
              {!isPreviewMode && (
                <Button
                  onClick={() => setShowAddModule(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Module
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Module Modal */}
      {showAddModule && (
        <Card className="card">
          <CardHeader>
            <CardTitle>Add New Module</CardTitle>
            <CardDescription>
              Choose the type of module you want to add to your course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-primary-text mb-2 block">
                Module Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'reel', label: 'Video Reel', icon: Video, description: 'Add a training video' },
                  { type: 'text', label: 'Text Content', icon: FileText, description: 'Add text or instructions' },
                  { type: 'quiz', label: 'Quiz', icon: HelpCircle, description: 'Add a quiz question' },
                ].map(({ type, label, icon: Icon, description }) => (
                  <button
                    key={type}
                    onClick={() => setNewModuleType(type as any)}
                    className={cn(
                      'p-4 border rounded-lg text-left transition-all',
                      newModuleType === type
                        ? 'border-accent-blue bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Icon className="h-6 w-6 mb-2 text-accent-blue" />
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-secondary-text">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Input
                value={newModuleData.title}
                onChange={(e) => setNewModuleData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Module title"
              />
              <Textarea
                value={newModuleData.description}
                onChange={(e) => setNewModuleData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Module description (optional)"
                rows={2}
              />
              {newModuleType === 'text' && (
                <Textarea
                  value={newModuleData.content}
                  onChange={(e) => setNewModuleData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Text content"
                  rows={4}
                />
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowAddModule(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddModule}
                disabled={!newModuleData.title.trim()}
                className="btn-primary"
              >
                Add Module
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}