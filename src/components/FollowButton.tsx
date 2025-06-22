
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
  onFollowChange: () => void;
  username?: string;
}

const FollowButton = ({ targetUserId, isFollowing, onFollowChange, username }: FollowButtonProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!user || user.id === targetUserId) return null;

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followed_id', targetUserId);

        if (error) throw error;

        toast({
          title: "Unfollowed",
          description: username ? `You unfollowed @${username}` : "User unfollowed"
        });
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            followed_id: targetUserId
          });

        if (error) throw error;

        toast({
          title: "Following!",
          description: username ? `You're now following @${username}` : "User followed"
        });
      }

      onFollowChange();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      size="sm"
      variant={isFollowing ? "secondary" : "default"}
      className={`transition-all duration-300 hover:scale-105 ${
        isFollowing 
          ? 'bg-purple-600/30 border border-purple-400/50 text-purple-300 hover:bg-purple-600/50' 
          : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
      }`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-4 h-4 mr-1" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-1" />
          Follow
        </>
      )}
    </Button>
  );
};

export default FollowButton;
