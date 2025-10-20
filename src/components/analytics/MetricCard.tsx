/**
 * MetricCard Component
 * Reusable metric display card with trend indicators
 */

import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Minus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  loading?: boolean;
  className?: string;
}

const colorVariants = {
  blue: {
    icon: 'text-blue-600',
    bg: 'bg-blue-100',
    trend: 'text-blue-600'
  },
  green: {
    icon: 'text-green-600',
    bg: 'bg-green-100',
    trend: 'text-green-600'
  },
  red: {
    icon: 'text-red-600',
    bg: 'bg-red-100',
    trend: 'text-red-600'
  },
  yellow: {
    icon: 'text-yellow-600',
    bg: 'bg-yellow-100',
    trend: 'text-yellow-600'
  },
  purple: {
    icon: 'text-purple-600',
    bg: 'bg-purple-100',
    trend: 'text-purple-600'
  },
  gray: {
    icon: 'text-gray-600',
    bg: 'bg-gray-100',
    trend: 'text-gray-600'
  }
};

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue',
  loading = false,
  className
}: MetricCardProps) {
  const colors = colorVariants[color];

  if (loading) {
    return (
      <Card className={cn("card", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className={cn("card card-hover", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-text mb-1 truncate">
                {title}
              </p>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-primary-text">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                {trend && (
                  <div className="flex items-center space-x-1">
                    {trend.isPositive ? (
                      <ArrowUpRight className={cn("h-4 w-4", colors.trend)} />
                    ) : trend.value === 0 ? (
                      <Minus className={cn("h-4 w-4", colors.trend)} />
                    ) : (
                      <ArrowDownRight className={cn("h-4 w-4", colors.trend)} />
                    )}
                    <span className={cn("text-sm font-medium", colors.trend)}>
                      {Math.abs(trend.value)}%
                    </span>
                  </div>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-secondary-text mt-1 truncate">
                  {subtitle}
                </p>
              )}
              {trend?.label && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs mt-2", colors.trend)}
                >
                  {trend.label}
                </Badge>
              )}
            </div>
            {icon && (
              <div className={cn("p-3 rounded-lg", colors.bg)}>
                <div className={cn("h-6 w-6", colors.icon)}>
                  {icon}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
