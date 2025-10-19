/**
 * FilterSidebar component for advanced search filtering
 * Generated: 2024-12-13T18:00:00Z
 */

import React, { useState } from 'react';
import { 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  Building, 
  Wrench, 
  User, 
  Calendar,
  Clock,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { SearchFilters, SearchFacet } from '@/types/search';

interface FilterSidebarProps {
  filters: SearchFilters;
  facets: SearchFacet[];
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onResetFilters: () => void;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const skillLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const statusOptions = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'archived', label: 'Archived' }
];

// const visibilityOptions = [
//   { value: 'public', label: 'Public' },
//   { value: 'private', label: 'Private' },
//   { value: 'organization', label: 'Organization' }
// ];

export function FilterSidebar({
  filters,
  facets,
  onFiltersChange,
  onResetFilters,
  className,
  // isOpen = true,
  onToggle
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tags: true,
    machine_model: true,
    process_type: true,
    skill_level: true,
    status: true,
    duration: true,
    date_range: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    onFiltersChange({ tags: newTags });
  };

  const handleFacetToggle = (facetType: string, facetValue: string) => {
    switch (facetType) {
      case 'tags':
        handleTagToggle(facetValue);
        break;
      case 'machine_model':
        onFiltersChange({ 
          machine_model: filters.machine_model === facetValue ? undefined : facetValue 
        });
        break;
      case 'process_type':
        onFiltersChange({ 
          process_type: filters.process_type === facetValue ? undefined : facetValue 
        });
        break;
      case 'skill_level':
        onFiltersChange({ 
          skill_level: filters.skill_level === facetValue ? undefined : facetValue as any
        });
        break;
    }
  };

  const handleDurationChange = (values: number[]) => {
    onFiltersChange({
      duration_range: {
        min: values[0] * 60, // Convert minutes to seconds
        max: values[1] * 60
      }
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      date_range: {
        start: field === 'start' ? value : filters.date_range?.start || '',
        end: field === 'end' ? value : filters.date_range?.end || ''
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.tags?.length) count += filters.tags.length;
    if (filters.machine_model) count++;
    if (filters.process_type) count++;
    if (filters.skill_level) count++;
    if (filters.status) count++;
    if (filters.visibility) count++;
    if (filters.duration_range) count++;
    if (filters.date_range?.start || filters.date_range?.end) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Group facets by type
  const groupedFacets = facets.reduce((acc, facet) => {
    if (!acc[facet.facet_type]) {
      acc[facet.facet_type] = [];
    }
    acc[facet.facet_type].push(facet);
    return acc;
  }, {} as Record<string, SearchFacet[]>);

  const FilterSection = ({ 
    title, 
    icon: Icon, 
    section, 
    children 
  }: { 
    title: string; 
    icon: React.ComponentType<any>; 
    section: string; 
    children: React.ReactNode; 
  }) => {
    const isExpanded = expandedSections[section];
    
    return (
      <div className="border-b border-gray-100 last:border-b-0">
        <button
          onClick={() => toggleSection(section)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-secondary-text" />
            <span className="font-medium text-primary-text">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-secondary-text" />
          ) : (
            <ChevronDown className="h-4 w-4 text-secondary-text" />
          )}
        </button>
        {isExpanded && (
          <div className="px-4 pb-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("w-80 bg-white border-r border-gray-200 flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-accent-blue" />
            <h3 className="font-semibold text-primary-text">Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {onToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="mt-2 w-full"
          >
            Clear all filters
          </Button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Tags */}
        {groupedFacets.tags && groupedFacets.tags.length > 0 && (
          <FilterSection title="Tags" icon={Tag} section="tags">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {groupedFacets.tags.map((facet) => (
                <div key={facet.facet_value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${facet.facet_value}`}
                    checked={filters.tags?.includes(facet.facet_value) || false}
                    onCheckedChange={() => handleFacetToggle('tags', facet.facet_value)}
                  />
                  <label
                    htmlFor={`tag-${facet.facet_value}`}
                    className="flex-1 flex items-center justify-between text-sm cursor-pointer"
                  >
                    <span className="text-primary-text">{facet.facet_value}</span>
                    <Badge variant="outline" className="text-xs">
                      {facet.facet_count}
                    </Badge>
                  </label>
                </div>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Machine Model */}
        {groupedFacets.machine_model && groupedFacets.machine_model.length > 0 && (
          <FilterSection title="Machine Model" icon={Building} section="machine_model">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {groupedFacets.machine_model.map((facet) => (
                <div key={facet.facet_value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`machine-${facet.facet_value}`}
                    checked={filters.machine_model === facet.facet_value}
                    onCheckedChange={() => handleFacetToggle('machine_model', facet.facet_value)}
                  />
                  <label
                    htmlFor={`machine-${facet.facet_value}`}
                    className="flex-1 flex items-center justify-between text-sm cursor-pointer"
                  >
                    <span className="text-primary-text">{facet.facet_value}</span>
                    <Badge variant="outline" className="text-xs">
                      {facet.facet_count}
                    </Badge>
                  </label>
                </div>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Process Type */}
        {groupedFacets.process_type && groupedFacets.process_type.length > 0 && (
          <FilterSection title="Process Type" icon={Wrench} section="process_type">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {groupedFacets.process_type.map((facet) => (
                <div key={facet.facet_value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`process-${facet.facet_value}`}
                    checked={filters.process_type === facet.facet_value}
                    onCheckedChange={() => handleFacetToggle('process_type', facet.facet_value)}
                  />
                  <label
                    htmlFor={`process-${facet.facet_value}`}
                    className="flex-1 flex items-center justify-between text-sm cursor-pointer"
                  >
                    <span className="text-primary-text">{facet.facet_value}</span>
                    <Badge variant="outline" className="text-xs">
                      {facet.facet_count}
                    </Badge>
                  </label>
                </div>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Skill Level */}
        <FilterSection title="Skill Level" icon={User} section="skill_level">
          <div className="space-y-2">
            {skillLevels.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${level.value}`}
                  checked={filters.skill_level === level.value}
                  onCheckedChange={() => 
                    onFiltersChange({ 
                      skill_level: filters.skill_level === level.value ? undefined : level.value as any
                    })
                  }
                />
                <label
                  htmlFor={`skill-${level.value}`}
                  className="text-sm cursor-pointer text-primary-text"
                >
                  {level.label}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Status */}
        <FilterSection title="Status" icon={Check} section="status">
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={filters.status === status.value}
                  onCheckedChange={() => 
                    onFiltersChange({ 
                      status: filters.status === status.value ? undefined : status.value as any
                    })
                  }
                />
                <label
                  htmlFor={`status-${status.value}`}
                  className="text-sm cursor-pointer text-primary-text"
                >
                  {status.label}
                </label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Duration */}
        <FilterSection title="Duration" icon={Clock} section="duration">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-primary-text mb-2 block">
                Duration (minutes)
              </label>
              <Slider
                value={[
                  Math.floor((filters.duration_range?.min || 0) / 60),
                  Math.floor((filters.duration_range?.max || 30) / 60)
                ]}
                onValueChange={handleDurationChange}
                max={30}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-secondary-text mt-1">
                <span>{Math.floor((filters.duration_range?.min || 0) / 60)} min</span>
                <span>{Math.floor((filters.duration_range?.max || 30) / 60)} min</span>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Date Range */}
        <FilterSection title="Date Range" icon={Calendar} section="date_range">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-primary-text mb-1 block">
                From
              </label>
              <input
                type="date"
                value={filters.date_range?.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-primary-text mb-1 block">
                To
              </label>
              <input
                type="date"
                value={filters.date_range?.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              />
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

export default FilterSidebar;
