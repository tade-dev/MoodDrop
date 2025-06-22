
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BookmarkButtonProps {
  dropId: string;
  isBookmarked: boolean;
  onBookmarkChange: () => void;
}

const BookmarkButton = ({ dropId, isBookmarked, onBookmarkChange }: BookmarkButtonProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleBookmark = async () => {
    setIsLoading(true);
    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('drop_id', dropId);

        if (error) throw error;

        toast({
          title: "Removed from saved",
          description: "Drop removed from your saved collection"
        });
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            drop_id: dropId
          });

        if (error) throw error;

        toast({
          title: "Saved!",
          description: "Drop added to your saved collection"
        });
      }

      onBookmarkChange();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBookmark}
      disabled={isLoading}
      size="sm"
      variant="ghost"
      className={`transition-all duration-300 hover:scale-110 ${
        isBookmarked 
          ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10' 
          : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
      }`}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
    </Button>
  );
};

export default BookmarkButton;
