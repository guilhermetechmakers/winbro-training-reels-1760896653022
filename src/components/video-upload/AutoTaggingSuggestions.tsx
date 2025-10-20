import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  Tag, 
  Plus, 
  X, 
  Loader2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface TagSuggestion {
  id: string;
  tag: string;
  confidence: number;
  category: 'machine' | 'process' | 'tooling' | 'skill' | 'general';
  source: 'transcript' | 'metadata' | 'ai_analysis';
}

interface AutoTaggingSuggestionsProps {
  title?: string;
  description?: string;
  machineModel?: string;
  processType?: string;
  tooling?: string;
  skillLevel?: string;
  transcript?: string;
  onTagsChange: (tags: string[]) => void;
  initialTags?: string[];
}

const mockSuggestions: TagSuggestion[] = [
  // Machine suggestions
  { id: '1', tag: 'Winbro 2000', confidence: 0.95, category: 'machine', source: 'metadata' },
  { id: '2', tag: 'Grinding Machine', confidence: 0.88, category: 'machine', source: 'transcript' },
  { id: '3', tag: 'CNC Machine', confidence: 0.75, category: 'machine', source: 'ai_analysis' },
  
  // Process suggestions
  { id: '4', tag: 'Surface Grinding', confidence: 0.92, category: 'process', source: 'transcript' },
  { id: '5', tag: 'Precision Grinding', confidence: 0.85, category: 'process', source: 'ai_analysis' },
  { id: '6', tag: 'Finishing', confidence: 0.78, category: 'process', source: 'transcript' },
  
  // Tooling suggestions
  { id: '7', tag: 'Diamond Wheel', confidence: 0.90, category: 'tooling', source: 'transcript' },
  { id: '8', tag: 'Abrasive', confidence: 0.82, category: 'tooling', source: 'ai_analysis' },
  { id: '9', tag: 'Coolant', confidence: 0.70, category: 'tooling', source: 'transcript' },
  
  // Skill level suggestions
  { id: '10', tag: 'Intermediate', confidence: 0.88, category: 'skill', source: 'ai_analysis' },
  { id: '11', tag: 'Advanced', confidence: 0.75, category: 'skill', source: 'metadata' },
  
  // General suggestions
  { id: '12', tag: 'Safety', confidence: 0.85, category: 'general', source: 'transcript' },
  { id: '13', tag: 'Setup', confidence: 0.80, category: 'general', source: 'transcript' },
  { id: '14', tag: 'Maintenance', confidence: 0.72, category: 'general', source: 'ai_analysis' },
];

const categoryColors = {
  machine: 'bg-blue-100 text-blue-800 border-blue-200',
  process: 'bg-green-100 text-green-800 border-green-200',
  tooling: 'bg-purple-100 text-purple-800 border-purple-200',
  skill: 'bg-orange-100 text-orange-800 border-orange-200',
  general: 'bg-gray-100 text-gray-800 border-gray-200',
};

const categoryIcons = {
  machine: '⚙️',
  process: '🔄',
  tooling: '🔧',
  skill: '📚',
  general: '🏷️',
};

export default function AutoTaggingSuggestions({
  title = '',
  description = '',
  transcript = '',
  onTagsChange,
  initialTags = [],
}: AutoTaggingSuggestionsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [customTag, setCustomTag] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Simulate AI analysis
  useEffect(() => {
    if (title || description || transcript) {
      setIsAnalyzing(true);
      
      // Simulate API call delay
      const timer = setTimeout(() => {
        // Filter suggestions based on content
        const filteredSuggestions = mockSuggestions.filter(suggestion => {
          const content = `${title} ${description} ${transcript}`.toLowerCase();
          return content.includes(suggestion.tag.toLowerCase()) || 
                 suggestion.confidence > 0.8;
        });
        
        setSuggestions(filteredSuggestions);
        setIsAnalyzing(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [title, description, transcript]);

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      onTagsChange(newTags);
    }
  };

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    onTagsChange(newTags);
  };

  const addCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !selectedTags.includes(tag)) {
      addTag(tag);
      setCustomTag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  };

  const filteredSuggestions = filterCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === filterCategory);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.8) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-blue" />
            Auto-Tagging Suggestions
          </CardTitle>
          <CardDescription>
            AI-powered tag suggestions based on your video content and metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent-blue mx-auto mb-4" />
                <p className="text-secondary-text">Analyzing content for tag suggestions...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Tags */}
              <div>
                <h4 className="text-sm font-medium text-primary-text mb-2">Selected Tags</h4>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-gray-200 rounded-lg">
                  {selectedTags.length > 0 ? (
                    selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-secondary-text text-sm">No tags selected</span>
                  )}
                </div>
              </div>

              {/* Add Custom Tag */}
              <div>
                <h4 className="text-sm font-medium text-primary-text mb-2">Add Custom Tag</h4>
                <div className="flex gap-2">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter custom tag..."
                    className="flex-1"
                  />
                  <Button
                    onClick={addCustomTag}
                    disabled={!customTag.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions */}
      {!isAnalyzing && suggestions.length > 0 && (
        <Card className="card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent-blue" />
                  Suggested Tags
                </CardTitle>
                <CardDescription>
                  Click on suggestions to add them to your video
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="machine">Machine</option>
                  <option value="process">Process</option>
                  <option value="tooling">Tooling</option>
                  <option value="skill">Skill Level</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                filteredSuggestions.reduce((acc, suggestion) => {
                  if (!acc[suggestion.category]) {
                    acc[suggestion.category] = [];
                  }
                  acc[suggestion.category].push(suggestion);
                  return acc;
                }, {} as Record<string, TagSuggestion[]>)
              ).map(([category, categorySuggestions]) => (
                <div key={category}>
                  <h5 className="text-sm font-medium text-primary-text mb-2 flex items-center gap-2">
                    <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {categorySuggestions.map((suggestion) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <button
                          onClick={() => addTag(suggestion.tag)}
                          disabled={selectedTags.includes(suggestion.tag)}
                          className={`
                            flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
                            transition-all duration-200 border
                            ${selectedTags.includes(suggestion.tag)
                              ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                              : `hover:shadow-md cursor-pointer ${categoryColors[suggestion.category]}`
                            }
                          `}
                        >
                          <Tag className="h-3 w-3" />
                          {suggestion.tag}
                          <div className="flex items-center gap-1">
                            <span className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                              {getConfidenceLabel(suggestion.confidence)}
                            </span>
                            {suggestion.source === 'transcript' && (
                              <span className="text-xs text-blue-600">📝</span>
                            )}
                            {suggestion.source === 'metadata' && (
                              <span className="text-xs text-green-600">ℹ️</span>
                            )}
                            {suggestion.source === 'ai_analysis' && (
                              <span className="text-xs text-purple-600">🤖</span>
                            )}
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Suggestions */}
      {!isAnalyzing && suggestions.length === 0 && (
        <Card className="card">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-primary-text mb-2">
              No suggestions available
            </h3>
            <p className="text-secondary-text">
              Add more details to your title, description, or transcript to get better tag suggestions
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="text-sm">Tagging Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-secondary-text">
            <div>
              <h4 className="font-medium text-primary-text mb-1">Good Tags Include:</h4>
              <ul className="space-y-1">
                <li>• Machine model and type</li>
                <li>• Process or technique name</li>
                <li>• Tools and materials used</li>
                <li>• Skill level required</li>
                <li>• Safety considerations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-primary-text mb-1">Tag Best Practices:</h4>
              <ul className="space-y-1">
                <li>• Use specific, descriptive terms</li>
                <li>• Include both technical and common names</li>
                <li>• Add relevant industry terminology</li>
                <li>• Consider what learners would search for</li>
                <li>• Keep tags concise but meaningful</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}