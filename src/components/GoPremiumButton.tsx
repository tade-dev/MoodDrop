
import React from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface GoPremiumButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  className?: string;
}

const GoPremiumButton = ({ size = 'md', variant = 'default', className }: GoPremiumButtonProps) => {
  const navigate = useNavigate();

  if (variant === 'minimal') {
    return (
      <Button
        onClick={() => navigate('/go-premium')}
        variant="ghost"
        size={size}
        className={`text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-all duration-300 ${className}`}
      >
        <Crown className="w-4 h-4 mr-2" />
        Go Premium
      </Button>
    );
  }

  return (
    <Button
      onClick={() => navigate('/go-premium')}
      className={`bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}
      size={size}
    >
      <Crown className="w-4 h-4 mr-2" />
      <span>Go Premium</span>
      <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
    </Button>
  );
};

export default GoPremiumButton;
