
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import SpotifyPlayer from './SpotifyPlayer';
import VoteButton from './VoteButton';

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
  const isMultiMood = moods.length > 1;
  const displayMoods = moods.slice(0, 3);
  const overflowCount = Math.max(0, moods.length - 3);

  return (
    <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-xl hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:border-purple-500/30">
      <CardContent className="p-6">
        {/* Header with user info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-purple-600 text-white">
              {username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{username}</h3>
            <p className="text-sm text-gray-400">
              {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Song info */}
        <div className="mb-4">
          <h4 className="text-lg font-bold text-white mb-1">{songTitle}</h4>
          <p className="text-gray-400">{artistName}</p>
          {caption && (
            <p className="text-gray-300 mt-2">{caption}</p>
          )}
        </div>

        {/* Mood badges */}
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

        {/* Spotify Player */}
        <div className="mb-4">
          <SpotifyPlayer 
            spotifyUrl={spotifyUrl} 
            songTitle={songTitle}
            artistName={artistName}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mb-4">
          <VoteButton
            dropId={dropIds[0]}
            currentVote={undefined}
            upvotes={totalVotes}
            downvotes={0}
            onVote={() => {}}
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {totalComments}
          </Button>
        </div>

        {/* Multi-mood accordion */}
        {isMultiMood && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="multi-moods" className="border-white/10">
              <AccordionTrigger className="text-gray-300 hover:text-white py-3">
                <span className="text-sm">View individual mood drops ({moods.length})</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3 pt-2">
                  {moods.map((mood) => (
                    <div
                      key={mood.drop_id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="bg-purple-500/20 text-purple-200 border-purple-500/30"
                        >
                          {mood.emoji} {mood.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <VoteButton
                          dropId={mood.drop_id}
                          currentVote={undefined}
                          upvotes={0}
                          downvotes={0}
                          onVote={() => {}}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiMoodDropCard;
