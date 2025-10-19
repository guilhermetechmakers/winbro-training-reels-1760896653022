import { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, X, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  type: 'reel' | 'course' | 'transcript';
  description?: string;
  thumbnail?: string;
  duration?: string;
}

interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSelect?: (result: SearchResult) => void;
  className?: string;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'CNC Mill Setup - Tool Change',
    type: 'reel',
    description: 'Step-by-step guide for safely changing tools on the CNC mill',
    thumbnail: '/api/placeholder/40/30',
    duration: '0:28'
  },
  {
    id: '2',
    title: 'Machine Safety Fundamentals',
    type: 'course',
    description: 'Comprehensive safety training for machine operators',
    duration: '2:15'
  },
  {
    id: '3',
    title: 'Lathe Safety Check Procedure',
    type: 'reel',
    description: 'Daily safety inspection checklist for lathe operations',
    thumbnail: '/api/placeholder/40/30',
    duration: '0:22'
  }
];

export function Search({ 
  placeholder = "Search reels, courses, or transcripts...", 
  onSearch,
  onSelect,
  className 
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 2) {
      // Simulate search API call
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filteredResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        } else if (query) {
          onSearch?.(query);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    onSelect?.(result);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      onSearch?.(query);
      setIsOpen(false);
    }
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'reel':
        return <SearchIcon className="h-4 w-4" />;
      case 'course':
        return <TrendingUp className="h-4 w-4" />;
      case 'transcript':
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('relative', className)} ref={resultsRef}>
      <form onSubmit={handleSearch} className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-text" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 2 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text hover:text-primary-text"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={result.id}
              onClick={() => handleSelect(result)}
              className={cn(
                'flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors',
                selectedIndex === index && 'bg-gray-50'
              )}
            >
              <div className="flex-shrink-0">
                {getResultIcon(result.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-text truncate">
                  {result.title}
                </p>
                {result.description && (
                  <p className="text-xs text-secondary-text truncate">
                    {result.description}
                  </p>
                )}
              </div>
              {result.duration && (
                <div className="flex-shrink-0 text-xs text-secondary-text">
                  {result.duration}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}