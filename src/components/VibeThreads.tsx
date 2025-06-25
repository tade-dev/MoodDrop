import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  text: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface VibeThreadsProps {
  dropId: string;
  commentCount: number;
  onCommentCountChange: (count: number) => void;
}

const VibeThreads = ({ dropId, commentCount, onCommentCountChange }: VibeThreadsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [hasNewComments, setHasNewComments] = useState(false);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', dropId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          text,
          created_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('drop_id', dropId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Comment[];
    },
    enabled: isOpen,
  });

  // Update comment count when comments data changes
  useEffect(() => {
    if (comments.length > 0) {
      onCommentCountChange(comments.length);
    }
  }, [comments.length, onCommentCountChange]);

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('comments')
        .insert({
          drop_id: dropId,
          user_id: user.id,
          text: text.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', dropId] });
      // Immediately update the comment count
      onCommentCountChange(commentCount + 1);
      toast({
        title: "Comment added",
        description: "Your comment has been posted to the vibe thread!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Set up real-time subscription for comments
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${dropId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `drop_id=eq.${dropId}`
        },
        (payload) => {
          console.log('New comment:', payload);
          queryClient.invalidateQueries({ queryKey: ['comments', dropId] });
          
          // Trigger animation for new comments
          if (payload.new.user_id !== user?.id) {
            setHasNewComments(true);
            setTimeout(() => setHasNewComments(false), 2000);
            // Update comment count for other users' comments
            onCommentCountChange(commentCount + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dropId, user?.id, queryClient, commentCount, onCommentCountChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    addCommentMutation.mutate(newComment);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`group/btn flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-full transition-all duration-300 hover:scale-110 text-xs sm:text-sm text-gray-400 hover:text-blue-300 hover:bg-blue-400/10 ${
          hasNewComments ? 'animate-bounce' : ''
        }`}
      >
        <MessageCircle className={`w-3 h-3 sm:w-4 sm:h-4 ${hasNewComments ? 'animate-pulse' : 'group-hover/btn:animate-pulse'}`} />
        <span className="font-medium">{commentCount}</span>
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md bg-black/90 backdrop-blur-xl border-l border-white/10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white">Vibe Thread</SheetTitle>
            <SheetDescription className="text-gray-400">
              Join the conversation about this drop
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No comments yet. Start the conversation!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={comment.profiles.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs">
                        {comment.profiles.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-white text-sm">{comment.profiles.username}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-300 text-sm break-words">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            {user ? (
              <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-white/10">
                <div className="flex space-x-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add to the vibe thread..."
                    className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-500 resize-none"
                    rows={2}
                    maxLength={280}
                  />
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg"
                  >
                    {addCommentMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {280 - newComment.length} characters remaining
                </div>
              </form>
            ) : (
              <div className="mt-4 pt-4 border-t border-white/10 text-center text-gray-500">
                <p>Sign in to join the conversation</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default VibeThreads;
