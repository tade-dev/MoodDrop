
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Mood {
  id: string;
  name: string;
  emoji: string;
  drop_id: string;
}

interface MoodBadgesProps {
  moods: Mood[];
  isFiltered?: boolean;
  filteredMoodId?: string;
}

const MoodBadges = ({ moods, isFiltered = false, filteredMoodId }: MoodBadgesProps) => {
  const displayMoods = moods.slice(0, 3);
  const overflowCount = Math.max(0, moods.length - 3);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {displayMoods.map((mood) => (
        <Badge
          key={mood.id}
          variant="secondary"
          className={cn(
            "bg-purple-500/20 text-purple-200 border-purple-500/30",
            isFiltered && filteredMoodId === mood.id && "bg-purple-500/40 border-purple-400"
          )}
        >
          {mood.emoji} {mood.name}
        </Badge>
      ))}
      {overflowCount > 0 && (
        <Badge variant="secondary" className="bg-gray-500/20 text-gray-300">
          +{overflowCount}
        </Badge>
      )}
    </div>
  );
};

export default MoodBadges;
