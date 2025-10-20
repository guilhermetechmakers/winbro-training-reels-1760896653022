/**
 * Enhanced SearchBar component with natural language processing
 * Generated: 2024-12-13T18:00:00Z
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  TrendingUp, 
  User, 
  Tag, 
  Wrench, 
  Building, 
  Sparkles,
  ArrowRight,
  Mic,
  MicOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSearchSuggestions } from '@/hooks/useSearch';
import type { SearchSuggestion } from '@/types/search';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
  showNaturalLanguage?: boolean;
  onNaturalLanguageSearch?: (query: string) => void;
}

const suggestionIcons = {
  tag: Tag,
  machine_model: Building,
  process_type: Wrench,
  tooling: Wrench,
  author: User,
  title: Search
};

const naturalLanguageExamples = [
  "Show me maintenance videos for CNC machines",
  "Find beginner-level welding tutorials",
  "What are the latest safety procedures?",
  "Videos about tooling setup from last month",
  "Advanced machining techniques for aluminum"
];

export function SearchBar({
  query,
  onQueryChange,
  onSearch,
  onSuggestionClick,
  placeholder = "Search reels, courses, or transcripts...",
  className,
  showSuggestions = true,
  autoFocus = false,
  showNaturalLanguage = true,
  onNaturalLanguageSearch
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [showNaturalLanguageExamples, setShowNaturalLanguageExamples] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { data: suggestionsData, isLoading: suggestionsLoading } = useSearchSuggestions(query);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onQueryChange(value);
    setShowSuggestionsList(value.length > 0);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
      setShowSuggestionsList(false);
    } else if (e.key === 'Escape') {
      setShowSuggestionsList(false);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSuggestionClick(suggestion);
    setShowSuggestionsList(false);
    inputRef.current?.blur();
  };

  // Handle clear
  const handleClear = () => {
    onQueryChange('');
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (query.length > 0) {
      setShowSuggestionsList(true);
    } else if (showNaturalLanguage) {
      setShowNaturalLanguageExamples(true);
    }
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setIsFocused(false);
        setShowSuggestionsList(false);
        setShowNaturalLanguageExamples(false);
      }
    }, 150);
  };

  // Handle natural language search
  const handleNaturalLanguageSearch = (example: string) => {
    onQueryChange(example);
    if (onNaturalLanguageSearch) {
      onNaturalLanguageSearch(example);
    } else {
      onSearch();
    }
    setShowNaturalLanguageExamples(false);
  };

  // Handle voice input (placeholder for future implementation)
  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input implementation would go here
  };

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Group suggestions by type
  const groupedSuggestions = suggestionsData?.suggestions?.reduce((acc: Record<string, SearchSuggestion[]>, suggestion: SearchSuggestion) => {
    if (!acc[suggestion.suggestion_type]) {
      acc[suggestion.suggestion_type] = [];
    }
    acc[suggestion.suggestion_type].push(suggestion);
    return acc;
  }, {} as Record<string, SearchSuggestion[]>) || {};

  const suggestionTypes = Object.keys(groupedSuggestions);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-text" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "pl-10 pr-20 h-12 text-base",
            isFocused && "ring-2 ring-accent-blue ring-opacity-50"
          )}
        />
        
        {/* Action Buttons */}
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {showNaturalLanguage && !query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNaturalLanguageExamples(!showNaturalLanguageExamples)}
              className="h-8 w-8 hover:bg-gray-100"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceInput}
            className={cn(
              "h-8 w-8 hover:bg-gray-100",
              isListening && "text-accent-blue"
            )}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (showSuggestionsList || showNaturalLanguageExamples) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg border-0"
            >
              <CardContent className="p-0">
                {showNaturalLanguageExamples && !query ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-secondary-text uppercase tracking-wide border-b border-gray-100">
                      <Sparkles className="inline h-3 w-3 mr-1" />
                      Natural Language Search
                    </div>
                    {naturalLanguageExamples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleNaturalLanguageSearch(example)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-primary-text group-hover:text-accent-blue">
                            {example}
                          </span>
                          <ArrowRight className="h-4 w-4 text-secondary-text group-hover:text-accent-blue" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : suggestionsLoading ? (
                  <div className="p-4 text-center text-secondary-text">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-blue mx-auto"></div>
                    <p className="mt-2 text-sm">Loading suggestions...</p>
                  </div>
                ) : suggestionTypes.length > 0 ? (
                  <div className="py-2">
                    {suggestionTypes.map((type) => {
                      const Icon = suggestionIcons[type as keyof typeof suggestionIcons] || Search;
                      const suggestions = groupedSuggestions[type];
                      
                      return (
                        <div key={type} className="mb-2 last:mb-0">
                          <div className="px-4 py-2 text-xs font-medium text-secondary-text uppercase tracking-wide border-b border-gray-100">
                            <Icon className="inline h-3 w-3 mr-1" />
                            {type.replace('_', ' ')}
                          </div>
                          {suggestions.map((suggestion: SearchSuggestion, index: number) => (
                            <button
                              key={`${type}-${index}`}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-primary-text group-hover:text-accent-blue">
                                  {suggestion.suggestion_value}
                                </span>
                                <div className="flex items-center space-x-2">
                                  {suggestion.usage_count > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {suggestion.usage_count}
                                    </Badge>
                                  )}
                                  {suggestion.similarity_score > 0.8 && (
                                    <TrendingUp className="h-3 w-3 text-accent-blue" />
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ) : query.length > 0 ? (
                  <div className="p-4 text-center text-secondary-text">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No suggestions found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Button */}
      <Button
        onClick={onSearch}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-4"
        disabled={!query.trim()}
      >
        Search
      </Button>
    </div>
  );
}

export default SearchBar;
