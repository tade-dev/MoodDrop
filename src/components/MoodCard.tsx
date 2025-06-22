
import React from 'react';
import { Card } from '@/components/ui/card';

interface MoodCardProps {
  mood: {
    id: string;
    name: string;
    emoji: string;
  };
  dropCount?: number;
  onClick: () => void;
}

const MoodCard = ({ mood, dropCount = 0, onClick }: MoodCardProps) => {
  return (
    <Card 
      onClick={onClick}
      className="group cursor-pointer bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-sm border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
    >
      <div className="p-6 text-center">
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
          {mood.emoji}
        </div>
        <h3 className="font-semibold text-white mb-2 text-sm leading-tight">
          {mood.name}
        </h3>
        <p className="text-gray-400 text-xs">
          {dropCount} drops
        </p>
      </div>
    </Card>
  );
};

export default MoodCard;
