
import React from 'react';
import { cn } from '@/lib/utils';

interface PremiumGlowProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
}

const PremiumGlow = ({ children, className, intensity = 'medium' }: PremiumGlowProps) => {
  const glowClasses = {
    subtle: 'ring-1 ring-yellow-400/30 shadow-sm shadow-yellow-400/20',
    medium: 'ring-2 ring-yellow-400/50 shadow-md shadow-yellow-400/30',
    strong: 'ring-2 ring-yellow-400/70 shadow-lg shadow-yellow-400/40 animate-pulse'
  };

  return (
    <div className={cn(
      'relative rounded-full',
      glowClasses[intensity],
      className
    )}>
      {children}
    </div>
  );
};

export default PremiumGlow;
