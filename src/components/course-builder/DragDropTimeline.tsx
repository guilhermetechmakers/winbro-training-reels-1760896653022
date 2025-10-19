import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GripVertical, 
  Play, 
  FileText, 
  HelpCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import type { CourseModule, DragDropItem } from '@/types';

interface DragDropTimelineProps {
  modules: CourseModule[];
  availableReels: DragDropItem[];
  onAddModule: (module: Omit<CourseModule, 'id' | 'courseId' | 'orderIndex'>) => void;
  onUpdateModule: (moduleId: string, updates: Partial<CourseModule>) => void;
  onDeleteModule: (moduleId: string) => void;
  onReorderModules: (moduleIds: string[]) => void;
  isPreviewMode?: boolean;
}

interface ModuleFormData {
  title: string;
  description: string;
  type: 'reel' | 'text' | 'quiz';
  contentId?: string;
  contentData?: Record<string, any>;
  estimatedDuration: number;
  isRequired: boolean;
  unlockAfterPrevious: boolean;
}

export default function DragDropTimeline({
  modules,
  availableReels,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  onReorderModules,
  isPreviewMode = false
}: DragDropTimelineProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [moduleForm, setModuleForm] = useState<ModuleFormData>({
    title: '',
    description: '',
    type: 'reel',
    estimatedDuration: 0,
    isRequired: true,
    unlockAfterPrevious: true,
  });
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  // const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newModules = [...modules];
    const draggedModule = newModules[draggedIndex];
    newModules.splice(draggedIndex, 1);
    newModules.splice(dropIndex, 0, draggedModule);

    // Update order indices
    const reorderedModules = newModules.map((module, index) => ({
      ...module,
      orderIndex: index,
    }));

    onReorderModules(reorderedModules.map(m => m.id));
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAddModuleSubmit = () => {
    if (!moduleForm.title.trim()) return;

    onAddModule({
      title: moduleForm.title,
      description: moduleForm.description,
      type: moduleForm.type,
      content: {} as any, // Will be populated based on type
      order: modules.length,
      contentId: moduleForm.contentId,
      contentData: moduleForm.contentData,
      estimatedDuration: moduleForm.estimatedDuration,
      isRequired: moduleForm.isRequired,
      unlockAfterPrevious: moduleForm.unlockAfterPrevious,
    });

    setModuleForm({
      title: '',
      description: '',
      type: 'reel',
      estimatedDuration: 0,
      isRequired: true,
      unlockAfterPrevious: true,
    });
    setShowAddModule(false);
  };

  const handleEditModule = (module: CourseModule) => {
    setEditingModule(module.id);
    setModuleForm({
      title: module.title,
      description: module.description || '',
      type: module.type,
      contentId: module.contentId,
      contentData: module.contentData,
      estimatedDuration: module.estimatedDuration,
      isRequired: module.isRequired,
      unlockAfterPrevious: module.unlockAfterPrevious,
    });
  };

  const handleUpdateModuleSubmit = () => {
    if (!editingModule || !moduleForm.title.trim()) return;

    onUpdateModule(editingModule, {
      title: moduleForm.title,
      description: moduleForm.description,
      type: moduleForm.type,
      contentId: moduleForm.contentId,
      contentData: moduleForm.contentData,
      estimatedDuration: moduleForm.estimatedDuration,
      isRequired: moduleForm.isRequired,
      unlockAfterPrevious: moduleForm.unlockAfterPrevious,
    });

    setEditingModule(null);
    setModuleForm({
      title: '',
      description: '',
      type: 'reel',
      estimatedDuration: 0,
      isRequired: true,
      unlockAfterPrevious: true,
    });
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'reel':
        return <Play className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary-text">Course Timeline</h3>
          <p className="text-sm text-secondary-text">
            Drag and drop to reorder modules. Click edit to modify details.
          </p>
        </div>
        {!isPreviewMode && (
          <Button
            onClick={() => setShowAddModule(true)}
            className="bg-accent-blue hover:bg-accent-blue/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        )}
      </div>

      {/* Modules List */}
      <div className="space-y-3">
        <AnimatePresence>
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              draggable={!isPreviewMode}
              onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`
                group relative bg-white rounded-lg border transition-all duration-200
                ${dragOverIndex === index ? 'border-accent-blue shadow-lg' : 'border-gray-200 hover:border-gray-300'}
                ${draggedIndex === index ? 'opacity-50' : ''}
                ${isPreviewMode ? 'cursor-default' : 'cursor-move hover:shadow-md'}
              `}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  {!isPreviewMode && (
                    <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600">
                      <GripVertical className="h-5 w-5" />
                    </div>
                  )}

                  {/* Module Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-accent-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>

                  {/* Module Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-accent-blue">
                        {getModuleIcon(module.type)}
                      </div>
                      <h4 className="font-medium text-primary-text truncate">
                        {module.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {module.type}
                      </Badge>
                    </div>
                    
                    {module.description && (
                      <p className="text-sm text-secondary-text mb-2 line-clamp-2">
                        {module.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-secondary-text">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(module.estimatedDuration)}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {module.isRequired ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-orange-500" />
                        )}
                        {module.isRequired ? 'Required' : 'Optional'}
                      </div>

                      <div className="flex items-center gap-1">
                        {module.unlockAfterPrevious ? (
                          <Lock className="h-3 w-3 text-blue-500" />
                        ) : (
                          <Unlock className="h-3 w-3 text-gray-500" />
                        )}
                        {module.unlockAfterPrevious ? 'Sequential' : 'Independent'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isPreviewMode && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditModule(module)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteModule(module.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {modules.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-primary-text mb-2">No modules yet</h3>
            <p className="text-secondary-text mb-4">
              Start building your course by adding modules
            </p>
            {!isPreviewMode && (
              <Button
                onClick={() => setShowAddModule(true)}
                className="bg-accent-blue hover:bg-accent-blue/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Module
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-primary-text mb-4">Add Module</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary-text">Title *</label>
                <Input
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter module title"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-text">Description</label>
                <Textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter module description"
                  className="mt-1 h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-text">Type</label>
                <Select
                  value={moduleForm.type}
                  onValueChange={(value) => setModuleForm(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reel">
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Video Reel
                      </div>
                    </SelectItem>
                    <SelectItem value="text">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Text Content
                      </div>
                    </SelectItem>
                    <SelectItem value="quiz">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Quiz
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {moduleForm.type === 'reel' && (
                <div>
                  <label className="text-sm font-medium text-primary-text">Select Reel</label>
                  <Select
                    value={moduleForm.contentId || ''}
                    onValueChange={(value) => setModuleForm(prev => ({ ...prev, contentId: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a reel" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableReels.map((reel) => (
                        <SelectItem key={reel.id} value={reel.id}>
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            {reel.title}
                            {reel.duration && (
                              <span className="text-xs text-gray-500">
                                ({formatDuration(reel.duration)})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-primary-text">Duration (seconds)</label>
                <Input
                  type="number"
                  min="0"
                  value={moduleForm.estimatedDuration}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={moduleForm.isRequired}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-300 rounded"
                  />
                  <label htmlFor="isRequired" className="text-sm text-primary-text">
                    Required module
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="unlockAfterPrevious"
                    checked={moduleForm.unlockAfterPrevious}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, unlockAfterPrevious: e.target.checked }))}
                    className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-300 rounded"
                  />
                  <label htmlFor="unlockAfterPrevious" className="text-sm text-primary-text">
                    Unlock after previous module
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModule(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddModuleSubmit}
                disabled={!moduleForm.title.trim()}
                className="bg-accent-blue hover:bg-accent-blue/90"
              >
                Add Module
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Module Modal */}
      {editingModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-primary-text mb-4">Edit Module</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary-text">Title *</label>
                <Input
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter module title"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-text">Description</label>
                <Textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter module description"
                  className="mt-1 h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-primary-text">Duration (seconds)</label>
                <Input
                  type="number"
                  min="0"
                  value={moduleForm.estimatedDuration}
                  onChange={(e) => setModuleForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="editIsRequired"
                    checked={moduleForm.isRequired}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-300 rounded"
                  />
                  <label htmlFor="editIsRequired" className="text-sm text-primary-text">
                    Required module
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="editUnlockAfterPrevious"
                    checked={moduleForm.unlockAfterPrevious}
                    onChange={(e) => setModuleForm(prev => ({ ...prev, unlockAfterPrevious: e.target.checked }))}
                    className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-300 rounded"
                  />
                  <label htmlFor="editUnlockAfterPrevious" className="text-sm text-primary-text">
                    Unlock after previous module
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingModule(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateModuleSubmit}
                disabled={!moduleForm.title.trim()}
                className="bg-accent-blue hover:bg-accent-blue/90"
              >
                Update Module
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
