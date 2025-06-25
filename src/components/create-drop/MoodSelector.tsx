
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Mood {
  id: string;
  name: string;
  emoji: string;
}

interface MoodSelectorProps {
  moods: Mood[];
  selectedMoods: string[];
  onMoodToggle: (moodId: string) => void;
}

const MoodSelector = ({ moods, selectedMoods, onMoodToggle }: MoodSelectorProps) => {
  return (
    <div>
      <label className="block text-white text-sm font-medium mb-3">
        Select Moods (You can select multiple)
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {moods.map((mood) => (
          <div
            key={mood.id}
            onClick={() => onMoodToggle(mood.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedMoods.includes(mood.id)
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400 text-white'
                : 'bg-black/60 border-white/20 text-gray-300 hover:border-purple-400/50'
            }`}
          >
            <div className="text-center">
              <div className="text-lg mb-1">{mood.emoji}</div>
              <div className="text-xs font-medium">{mood.name}</div>
            </div>
          </div>
        ))}
      </div>
      {selectedMoods.length > 0 && (
        <div className="mt-2 text-sm text-gray-400">
          Selected: {selectedMoods.length} mood{selectedMoods.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default MoodSelector;
