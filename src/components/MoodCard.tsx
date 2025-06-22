
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
      className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 rounded-2xl"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 blur-sm -z-10" />
      
      <div className="relative p-6 text-center">
        {/* Animated emoji */}
        <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-500 group-hover:animate-pulse">
          {mood.emoji}
        </div>
        
        {/* Mood name with gradient text */}
        <h3 className="font-bold text-white mb-3 text-lg leading-tight group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
          {mood.name}
        </h3>
        
        {/* Drop count with animated background */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-purple-500/20 group-hover:border-purple-400/50 transition-all duration-300">
          <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors duration-300">
            {dropCount} {dropCount === 1 ? 'drop' : 'drops'}
          </span>
        </div>
        
        {/* Animated sparkles effect */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500" />
        <div className="absolute bottom-2 left-2 w-1 h-1 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-700" />
      </div>
    </Card>
  );
};

export default MoodCard;
