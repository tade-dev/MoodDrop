
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Plus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface InviteCollaboratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistId: string;
  currentContributors: string[];
  onCollaboratorAdded?: () => void;
}

const InviteCollaboratorModal = ({ 
  open, 
  onOpenChange, 
  playlistId, 
  currentContributors, 
  onCollaboratorAdded 
}: InviteCollaboratorModalProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Search for users to invite
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search-users-invite', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .not('id', 'in', `(${currentContributors.join(',')})`)
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: searchQuery.length >= 2,
  });

  const handleInviteUser = async (userId: string, username: string) => {
    if (!user) return;

    setIsInviting(true);
    try {
      // Add user to contributors array
      const newContributors = [...currentContributors, userId];
      
      const { error } = await supabase
        .from('playlists')
        .update({ contributors: newContributors })
        .eq('id', playlistId);

      if (error) throw error;

      toast({
        title: "Collaborator Added!",
        description: `@${username} has been added as a collaborator.`,
      });

      onCollaboratorAdded?.();
      setSearchQuery('');
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      toast({
        title: "Error",
        description: "Failed to add collaborator. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-purple-400" />
            <span>Invite Collaborator</span>
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Search for users to add as collaborators to this playlist.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by username..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
            />
          </div>

          {/* Search Results */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Searching...</p>
              </div>
            ) : searchQuery.length < 2 ? (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Start typing to search for users</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No users found matching your search</p>
              </div>
            ) : (
              searchResults.map((searchUser) => (
                <div
                  key={searchUser.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={searchUser.avatar_url} />
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {searchUser.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white">@{searchUser.username}</span>
                  </div>
                  
                  <Button
                    onClick={() => handleInviteUser(searchUser.id, searchUser.username)}
                    disabled={isInviting}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteCollaboratorModal;
