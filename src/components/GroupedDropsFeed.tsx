
import React from 'react';
import { useGroupedDrops } from '@/hooks/useGroupedDrops';
import MultiMoodDropCard from './MultiMoodDropCard';
import { Skeleton } from '@/components/ui/skeleton';

interface GroupedDropsFeedProps {
  moodFilter?: string;
}

const GroupedDropsFeed = ({ moodFilter }: GroupedDropsFeedProps) => {
  const { data: groupedDrops, isLoading, error } = useGroupedDrops(moodFilter);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-3 w-16 bg-white/10" />
              </div>
            </div>
            <Skeleton className="h-6 w-48 mb-2 bg-white/10" />
            <Skeleton className="h-4 w-32 mb-4 bg-white/10" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-20 bg-white/10" />
              <Skeleton className="h-6 w-24 bg-white/10" />
            </div>
            <Skeleton className="h-20 w-full bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading grouped drops:', error);
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Failed to load drops. Please try again.</p>
      </div>
    );
  }

  if (!groupedDrops || groupedDrops.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No drops found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedDrops.map((drop) => (
        <MultiMoodDropCard
          key={drop.group_id}
          groupId={drop.group_id}
          spotifyUrl={drop.spotify_url}
          songTitle={drop.song_title}
          artistName={drop.artist_name}
          caption={drop.caption}
          createdAt={drop.created_at}
          userId={drop.user_id}
          username={drop.username}
          avatarUrl={drop.avatar_url}
          moods={drop.moods}
          totalVotes={drop.total_votes}
          totalComments={drop.total_comments}
          dropIds={drop.drop_ids}
          isFiltered={!!moodFilter}
          filteredMoodId={moodFilter}
        />
      ))}
    </div>
  );
};

export default GroupedDropsFeed;
