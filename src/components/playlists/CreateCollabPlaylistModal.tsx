
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { X, Plus, Crown, Users, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface CreateCollabPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlaylistCreated?: () => void;
}

const CreateCollabPlaylistModal = ({ open, onOpenChange, onPlaylistCreated }: CreateCollabPlaylistModalProps) => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [selectedCollaborators, setSelectedCollaborators] = useState<Array<{id: string, username: string, avatar_url?: string}>>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Extract username from @ mentions
  const getSearchQuery = (input: string) => {
    if (input.startsWith('@')) {
      return input.slice(1);
    }
    return input;
  };

  // Search for users to add as collaborators
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search-users', getSearchQuery(collaboratorSearch)],
    queryFn: async () => {
      const query = getSearchQuery(collaboratorSearch);
      if (!query.trim() || query.length < 1) return [];
      
      // Exclude already selected collaborators and current user
      const excludeIds = [user?.id, ...selectedCollaborators.map(c => c.id)].filter(Boolean);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: getSearchQuery(collaboratorSearch).length >= 1,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Auto-add @ if user starts typing without it
    if (value.length === 1 && !value.startsWith('@') && /[a-zA-Z]/.test(value)) {
      value = '@' + value;
    }
    
    setCollaboratorSearch(value);
  };

  const handleAddCollaborator = (collaborator: {id: string, username: string, avatar_url?: string}) => {
    if (!selectedCollaborators.find(c => c.id === collaborator.id)) {
      setSelectedCollaborators([...selectedCollaborators, collaborator]);
    }
    setCollaboratorSearch('');
  };

  const handleRemoveCollaborator = (collaboratorId: string) => {
    setSelectedCollaborators(selectedCollaborators.filter(c => c.id !== collaboratorId));
  };

  const handleCreatePlaylist = async () => {
    if (!user || !isPremium) {
      toast({
        title: "Premium Required",
        description: "Collaborative playlists are a premium feature.",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a playlist title.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const contributors = [user.id, ...selectedCollaborators.map(c => c.id)];
      
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          created_by: user.id,
          is_collab: true,
          contributors: contributors
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Playlist Created!",
        description: `"${title}" collaborative playlist has been created successfully.`,
      });

      onPlaylistCreated?.();
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedCollaborators([]);
      setCollaboratorSearch('');
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: "Error",
        description: "Failed to create playlist. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!isPremium) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-black/90 backdrop-blur-sm border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span>Premium Feature</span>
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Collaborative playlists are a premium feature. Upgrade to MoodDrop+ to create and manage collaborative playlists with friends.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>Create Collaborative Playlist</span>
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Create a playlist that multiple people can contribute to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Playlist Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Collab Playlist"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your playlist..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Add Collaborators
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={collaboratorSearch}
                onChange={handleSearchChange}
                placeholder="Type @username to search..."
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {collaboratorSearch && (
              <div className="mt-2 max-h-40 overflow-y-auto bg-black/80 border border-white/20 rounded-lg">
                {isLoading ? (
                  <div className="p-3 text-center">
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-center">
                    <p className="text-gray-400 text-sm">No users found matching "{getSearchQuery(collaboratorSearch)}"</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((searchUser) => (
                      <button
                        key={searchUser.id}
                        onClick={() => handleAddCollaborator(searchUser)}
                        className="w-full text-left px-3 py-2 hover:bg-white/10 text-white transition-colors flex items-center space-x-3"
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={searchUser.avatar_url} />
                          <AvatarFallback className="bg-purple-600 text-white text-xs">
                            {searchUser.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm">@{searchUser.username}</span>
                        </div>
                        <Plus className="w-4 h-4 text-green-400 ml-auto" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected Collaborators */}
            {selectedCollaborators.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-400 mb-2">Selected Collaborators:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCollaborators.map((collaborator) => (
                    <Badge
                      key={collaborator.id}
                      className="bg-purple-500/20 text-purple-300 border-purple-400/30 flex items-center space-x-2 px-2 py-1"
                    >
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={collaborator.avatar_url} />
                        <AvatarFallback className="bg-purple-600 text-white text-xs">
                          {collaborator.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span>@{collaborator.username}</span>
                      <button
                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreatePlaylist}
            disabled={isCreating || !title.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isCreating ? 'Creating...' : 'Create Playlist'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCollabPlaylistModal;
