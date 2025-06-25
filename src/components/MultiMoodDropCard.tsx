
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SpotifyPlayer from './SpotifyPlayer';
import DropHeader from './DropHeader';
import SongInfo from './SongInfo';
import MoodBadges from './MoodBadges';
import DropActions from './DropActions';
import MultiMoodAccordion from './MultiMoodAccordion';

interface Mood {
  id: string;
  name: string;
  emoji: string;
  drop_id: string;
}

interface MultiMoodDropCardProps {
  groupId: string;
  spotifyUrl: string;
  songTitle: string;
  artistName: string;
  caption: string;
  createdAt: string;
  userId: string;
  username: string;
  avatarUrl: string;
  moods: Mood[];
  totalVotes: number;
  totalComments: number;
  dropIds: string[];
  isFiltered?: boolean;
  filteredMoodId?: string;
}

const MultiMoodDropCard = ({
  groupId,
  spotifyUrl,
  songTitle,
  artistName,
  caption,
  createdAt,
  userId,
  username,
  avatarUrl,
  moods,
  totalVotes,
  totalComments,
  dropIds,
  isFiltered = false,
  filteredMoodId
}: MultiMoodDropCardProps) => {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-xl hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:border-purple-500/30">
      <CardContent className="p-6">
        <DropHeader
          userId={userId}
          username={username}
          avatarUrl={avatarUrl}
          createdAt={createdAt}
        />

        <SongInfo
          songTitle={songTitle}
          artistName={artistName}
          caption={caption}
        />

        <MoodBadges
          moods={moods}
          isFiltered={isFiltered}
          filteredMoodId={filteredMoodId}
        />

        <div className="mb-4">
          <SpotifyPlayer 
            spotifyUrl={spotifyUrl} 
            songTitle={songTitle}
            artistName={artistName}
          />
        </div>

        <DropActions
          dropIds={dropIds}
          totalVotes={totalVotes}
          totalComments={totalComments}
        />

        <MultiMoodAccordion moods={moods} />
      </CardContent>
    </Card>
  );
};

export default MultiMoodDropCard;
