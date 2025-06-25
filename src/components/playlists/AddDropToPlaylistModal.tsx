
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
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Music, Plus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface Drop {
  id: string;
  song_title: string;
  artist_name: string;
  spotify_url: string;
  caption?: string;
  user_id: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
  moods?: {
    name: string;
    emoji: string;
  };
}

interface AddDropToPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistId: string;
  onTrackAdded?: () => void;
}

const AddDropToPlaylistModal = ({ open, onOpenChange, playlistId, onTrackAdded }: AddDropToPlaylistModalProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrops, setSelectedDrops] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  // Search for drops to add
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search-drops', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const { data, error } = await supabase
        .from('drops')
        .select(`
          *,
          profiles (username, avatar_url),
          moods (name, emoji)
        `)
        .or(`song_title.ilike.%${searchQuery}%,artist_name.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as Drop[];
    },
    enabled: searchQuery.length >= 2,
  });

  // Get user's recent drops
  const { data: userDrops = [] } = useQuery({
    queryKey: ['user-drops', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('drops')
        .select(`
          *,
          profiles (username, avatar_url),
          moods (name, emoji)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Drop[];
    },
    enabled: !!user && !searchQuery.trim(),
  });

  const displayDrops = searchQuery.trim() ? searchResults : userDrops;

  const handleToggleDrop = (dropId: string) => {
    const newSelected = new Set(selectedDrops);
    if (newSelected.has(dropId)) {
      newSelected.delete(dropId);
    } else {
      newSelected.add(dropId);
    }
    setSelectedDrops(newSelected);
  };

  const handleAddTracks = async () => {
    if (!user || selectedDrops.size === 0) return;

    setIsAdding(true);
    try {
      const tracksToAdd = Array.from(selectedDrops).map(dropId => ({
        playlist_id: playlistId,
        drop_id: dropId,
        added_by: user.id
      }));

      const { error } = await supabase
        .from('playlist_tracks')
        .insert(tracksToAdd);

      if (error) throw error;

      toast({
        title: "Tracks Added!",
        description: `${selectedDrops.size} track${selectedDrops.size > 1 ? 's' : ''} added to playlist.`,
      });

      onTrackAdded?.();
      setSelectedDrops(new Set());
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding tracks:', error);
      toast({
        title: "Error",
        description: "Some tracks may already be in the playlist.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border border-white/20 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Music className="w-5 h-5 text-purple-400" />
            <span>Add Tracks to Playlist</span>
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Search for drops or select from your recent drops to add to the playlist.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by song title or artist..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10"
            />
          </div>

          {/* Selected count */}
          {selectedDrops.size > 0 && (
            <div className="text-sm text-purple-300">
              {selectedDrops.size} track{selectedDrops.size > 1 ? 's' : ''} selected
            </div>
          )}

          {/* Drops list */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-gray-400">Searching...</p>
              </div>
            ) : displayDrops.length === 0 ? (
              <div className="text-center py-8">
                <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  {searchQuery.trim() ? 'No drops found matching your search.' : 'No recent drops found.'}
                </p>
              </div>
            ) : (
              displayDrops.map((drop) => (
                <Card
                  key={drop.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedDrops.has(drop.id)
                      ? 'bg-purple-500/20 border-purple-400/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => handleToggleDrop(drop.id)}
                >
                  <div className="p-3 flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {selectedDrops.has(drop.id) ? (
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Plus className="w-4 h-4 text-white rotate-45" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-400 rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={drop.profiles?.avatar_url} />
                        <AvatarFallback className="bg-purple-600 text-white text-xs">
                          {drop.profiles?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{drop.song_title}</p>
                        <p className="text-gray-400 text-sm truncate">{drop.artist_name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">by @{drop.profiles?.username}</span>
                          {drop.moods && (
                            <span className="text-xs text-gray-500">
                              {drop.moods.emoji} {drop.moods.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
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
            Cancel
          </Button>
          <Button
            onClick={handleAddTracks}
            disabled={isAdding || selectedDrops.size === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isAdding ? 'Adding...' : `Add ${selectedDrops.size} Track${selectedDrops.size !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDropToPlaylistModal;
