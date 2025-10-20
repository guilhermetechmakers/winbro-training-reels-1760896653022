/**
 * TranscriptPreview component for showing search result transcript snippets
 * Generated: 2024-12-13T18:00:00Z
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TranscriptPreviewProps {
  transcript: string;
  highlights?: string[];
  searchQuery?: string;
  onPlayAtTime?: (timeInSeconds: number) => void;
  onClose?: () => void;
  className?: string;
}

interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
  highlighted: boolean;
}

export function TranscriptPreview({
  transcript,
  highlights = [],
  searchQuery,
  onPlayAtTime,
  onClose,
  className
}: TranscriptPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<TranscriptSegment | null>(null);

  // Parse transcript into segments (this would come from the API)
  const parseTranscript = (transcript: string): TranscriptSegment[] => {
    // This is a simplified parser - in reality, you'd have structured transcript data
    const segments = transcript.split('.').map((sentence, index) => ({
      text: sentence.trim(),
      startTime: index * 5, // 5 seconds per segment (simplified)
      endTime: (index + 1) * 5,
      highlighted: highlights.some(highlight => 
        sentence.toLowerCase().includes(highlight.toLowerCase())
      )
    })).filter(segment => segment.text.length > 0);

    return segments;
  };

  const segments = parseTranscript(transcript);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSegmentClick = (segment: TranscriptSegment) => {
    setSelectedSegment(segment);
    if (onPlayAtTime) {
      onPlayAtTime(segment.startTime);
    }
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(transcript);
  };

  const highlightText = (text: string, query?: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-secondary-text" />
            <h3 className="font-medium text-primary-text">Transcript Preview</h3>
            {highlights.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {highlights.length} matches
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyTranscript}
              className="text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Transcript Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="max-h-96 overflow-y-auto"
            >
              <div className="p-4 space-y-2">
                {segments.map((segment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      segment.highlighted 
                        ? "bg-yellow-50 border border-yellow-200" 
                        : "hover:bg-gray-50",
                      selectedSegment === segment && "bg-blue-50 border border-blue-200"
                    )}
                    onClick={() => handleSegmentClick(segment)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center space-x-1 text-xs text-secondary-text mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(segment.startTime)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-primary-text">
                          {highlightText(segment.text, searchQuery)}
                        </p>
                        {segment.highlighted && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Match
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSegmentClick(segment);
                        }}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Preview */}
        {!expanded && (
          <div className="p-4">
            <p className="text-sm text-secondary-text line-clamp-2">
              {transcript.substring(0, 200)}...
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-secondary-text">
                {segments.length} segments • {formatTime(segments[segments.length - 1]?.endTime || 0)} total
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(true)}
                className="text-xs"
              >
                Show full transcript
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TranscriptPreview;