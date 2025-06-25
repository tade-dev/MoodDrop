
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import VoteButton from './VoteButton';

interface DropActionsProps {
  dropIds: string[];
  totalVotes: number;
  totalComments: number;
}

const DropActions = ({ dropIds, totalVotes, totalComments }: DropActionsProps) => {
  return (
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
  );
};

export default DropActions;
