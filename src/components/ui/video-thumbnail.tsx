import { useState } from 'react';
import { Play, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoThumbnailProps {
  src: string;
  alt: string;
  duration: string;
  className?: string;
  onClick?: () => void;
}

export function VideoThumbnail({ 
  src, 
  alt, 
  duration, 
  className,
  onClick 
}: VideoThumbnailProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        'relative group cursor-pointer rounded-lg overflow-hidden',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
      />
      
      {/* Duration badge */}
      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        {duration}
      </div>
      
      {/* Play overlay */}
      <div className={cn(
        'absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center',
        isHovered && 'bg-black/20'
      )}>
        <div className={cn(
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          isHovered && 'opacity-100'
        )}>
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="h-6 w-6 text-primary-text ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}