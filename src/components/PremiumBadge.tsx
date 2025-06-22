
import React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PremiumBadge = ({ size = 'md', className }: PremiumBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={cn(
      'inline-flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold rounded-full shadow-lg animate-pulse',
      sizeClasses[size],
      className
    )}>
      <Crown className={iconSizes[size]} />
      <span>MoodDrop+</span>
    </div>
  );
};

export default PremiumBadge;
