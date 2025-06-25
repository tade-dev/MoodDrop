
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageCircle } from 'lucide-react';
import VoteButton from './VoteButton';

interface Mood {
  id: string;
  name: string;
  emoji: string;
  drop_id: string;
}

interface MultiMoodAccordionProps {
  moods: Mood[];
}

const MultiMoodAccordion = ({ moods }: MultiMoodAccordionProps) => {
  const isMultiMood = moods.length > 1;

  if (!isMultiMood) {
    return null;
  }

  return (
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
  );
};

export default MultiMoodAccordion;
