/**
 * BulkActionsBar component for admin bulk operations
 * Generated: 2024-12-13T18:00:00Z
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  X,
  CheckCircle,
  Archive,
  Trash2,
  Edit,
  Copy,
  Move,
  Download,
  Share2,
  Tag,
  Users,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAction: (action: string) => void;
  className?: string;
}

const bulkActions = [
  {
    id: 'approve',
    label: 'Approve',
    icon: CheckCircle,
    variant: 'default' as const,
    description: 'Approve selected items for publishing'
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    variant: 'outline' as const,
    description: 'Move selected items to archive'
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive' as const,
    description: 'Permanently delete selected items'
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: Edit,
    variant: 'outline' as const,
    description: 'Edit selected items'
  },
  {
    id: 'copy',
    label: 'Copy',
    icon: Copy,
    variant: 'outline' as const,
    description: 'Create copies of selected items'
  },
  {
    id: 'move',
    label: 'Move',
    icon: Move,
    variant: 'outline' as const,
    description: 'Move selected items to different location'
  },
  {
    id: 'download',
    label: 'Download',
    icon: Download,
    variant: 'outline' as const,
    description: 'Download selected items'
  },
  {
    id: 'share',
    label: 'Share',
    icon: Share2,
    variant: 'outline' as const,
    description: 'Share selected items'
  },
  {
    id: 'tag',
    label: 'Add Tags',
    icon: Tag,
    variant: 'outline' as const,
    description: 'Add tags to selected items'
  },
  {
    id: 'assign',
    label: 'Assign to Users',
    icon: Users,
    variant: 'outline' as const,
    description: 'Assign selected items to specific users'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    variant: 'outline' as const,
    description: 'Configure settings for selected items'
  }
];

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkAction,
  className
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={cn(
          "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50",
          "bg-white border border-gray-200 rounded-lg shadow-lg",
          "px-4 py-3 flex items-center space-x-3",
          className
        )}
      >
        {/* Selection Info */}
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="px-2 py-1">
            {selectedCount} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Primary Actions */}
        <div className="flex items-center space-x-2">
          {bulkActions.slice(0, 3).map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                onClick={() => onBulkAction(action.id)}
                className="flex items-center space-x-1"
              >
                <Icon className="h-4 w-4" />
                <span>{action.label}</span>
              </Button>
            );
          })}
        </div>

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <MoreHorizontal className="h-4 w-4" />
              <span>More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {bulkActions.slice(3).map((action, index) => {
              const Icon = action.icon;
              return (
                <React.Fragment key={action.id}>
                  {index === 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => onBulkAction(action.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{action.label}</span>
                      <span className="text-xs text-gray-500">{action.description}</span>
                    </div>
                  </DropdownMenuItem>
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </AnimatePresence>
  );
}

export default BulkActionsBar;