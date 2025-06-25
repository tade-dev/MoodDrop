
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Vote {
  vote_type: 'upvote' | 'downvote';
  user_id: string;
}

interface VoteButtonProps {
  dropId: string;
  currentVote?: Vote;
  upvotes: number;
  downvotes: number;
  onVote: () => void;
}

const VoteButton = ({ dropId, currentVote, upvotes, downvotes, onVote }: VoteButtonProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    setIsLoading(true);
    try {
      // If user already voted with the same type, remove the vote
      if (currentVote?.vote_type === voteType) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('drop_id', dropId);

        if (error) throw error;
      } else {
        // Upsert the vote (insert or update)
        const { error } = await supabase
          .from('votes')
          .upsert({
            user_id: user.id,
            drop_id: dropId,
            vote_type: voteType
          });

        if (error) throw error;
      }

      onVote();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <Button
        onClick={() => handleVote('upvote')}
        disabled={isLoading}
        size="sm"
        variant="ghost"
        className={`transition-all duration-300 hover:scale-110 ${
          currentVote?.vote_type === 'upvote' 
            ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10' 
            : 'text-gray-400 hover:text-green-400 hover:bg-green-400/10'
        }`}
      >
        <ChevronUp className="w-4 h-4" />
        <span className="text-xs ml-1">{upvotes}</span>
      </Button>
      
      <Button
        onClick={() => handleVote('downvote')}
        disabled={isLoading}
        size="sm"
        variant="ghost"
        className={`transition-all duration-300 hover:scale-110 ${
          currentVote?.vote_type === 'downvote' 
            ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10' 
            : 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'
        }`}
      >
        <ChevronDown className="w-4 h-4" />
        <span className="text-xs ml-1">{downvotes}</span>
      </Button>
    </div>
  );
};

export default VoteButton;
