import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  Music, 
  Trash2, 
  UserPlus, 
  Crown,
  Play,
  UserMinus,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import AddDropToPlaylistModal from './AddDropToPlaylistModal';
import InviteCollaboratorModal from './InviteCollaboratorModal';
import DeletePlaylistModal from './DeletePlaylistModal';
import RemoveCollaboratorModal from './RemoveCollaboratorModal';

interface PlaylistTrack {
  id: string;
  drop_id: string;
  added_by: string;
  created_at: string;
  drops: {
    song_title: string;
    artist_name: string;
    spotify_url: string;
    caption?: string;
  };
  profiles: {
    username: string;
    avatar_url?: string;
  };
}

interface CollabPlaylistManagerProps {
  playlistId: string;
  playlist: {
    id: string;
    title: string;
    description?: string;
    contributors: string[];
    created_by: string;
    is_collab: boolean;
  };
  onPlaylistUpdate?: () => void;
  onPlaylistDeleted?: () => void;
}

const CollabPlaylistManager = ({ 
  playlistId, 
  playlist, 
  onPlaylistUpdate, 
  onPlaylistDeleted 
}: CollabPlaylistManagerProps) => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [showAddDropModal, setShowAddDropModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveCollaboratorModal, setShowRemoveCollaboratorModal] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<{id: string, username: string, avatar_url?: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Fetch playlist tracks
  const { data: tracks = [], refetch: refetchTracks } = useQuery({
    queryKey: ['playlist-tracks', playlistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlist_tracks')
        .select(`
          *,
          drops (song_title, artist_name, spotify_url, caption),
          profiles (username, avatar_url)
        `)
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PlaylistTrack[];
    },
  });

  // Fetch collaborator profiles
  const { data: collaborators = [] } = useQuery({
    queryKey: ['playlist-collaborators', playlist.contributors],
    queryFn: async () => {
      if (!playlist.contributors?.length) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', playlist.contributors);
      
      if (error) throw error;
      return data;
    },
    enabled: !!playlist.contributors?.length,
  });

  const isOwner = user?.id === playlist.created_by;
  const isContributor = user?.id && playlist.contributors?.includes(user.id);
  const canManage = isPremium && (isOwner || isContributor);

  const handleRemoveTrack = async (trackId: string, addedBy: string) => {
    if (!canManage) return;
    
    // Only track owner or playlist owner can remove tracks
    if (user?.id !== addedBy && !isOwner) {
      toast({
        title: "Permission Denied",
        description: "You can only remove tracks you added.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('id', trackId);

      if (error) throw error;

      toast({
        title: "Track Removed",
        description: "Track has been removed from the playlist.",
      });

      refetchTracks();
    } catch (error) {
      console.error('Error removing track:', error);
      toast({
        title: "Error",
        description: "Failed to remove track.",
        variant: "destructive"
      });
    }
  };

  const handleTrackAdded = () => {
    refetchTracks();
    setShowAddDropModal(false);
  };

  const handleCollaboratorAdded = () => {
    onPlaylistUpdate?.();
    setShowInviteModal(false);
  };

  const handleDeletePlaylist = async () => {
    if (!user || !isOwner) return;

    setIsDeleting(true);
    try {
      // First delete all playlist tracks
      const { error: tracksError } = await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId);

      if (tracksError) throw tracksError;

      // Then delete the playlist
      const { error: playlistError } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (playlistError) throw playlistError;

      toast({
        title: "Playlist Deleted",
        description: `"${playlist.title}" has been deleted successfully.`,
      });

      onPlaylistDeleted?.();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast({
        title: "Error",
        description: "Failed to delete playlist. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveCollaborator = async () => {
    if (!selectedCollaborator || !user || !isOwner) return;

    setIsRemoving(true);
    try {
      // Remove collaborator from playlist contributors array
      const updatedContributors = playlist.contributors.filter(id => id !== selectedCollaborator.id);
      
      const { error } = await supabase
        .from('playlists')
        .update({ contributors: updatedContributors })
        .eq('id', playlistId);

      if (error) throw error;

      toast({
        title: "Collaborator Removed",
        description: `@${selectedCollaborator.username} has been removed from the playlist.`,
      });

      onPlaylistUpdate?.();
      setShowRemoveCollaboratorModal(false);
      setSelectedCollaborator(null);
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast({
        title: "Error",
        description: "Failed to remove collaborator. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const openRemoveCollaboratorModal = (collaborator: {id: string, username: string, avatar_url?: string}) => {
    setSelectedCollaborator(collaborator);
    setShowRemoveCollaboratorModal(true);
  };

  if (!isPremium) {
    return (
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-600/30">
        <CardContent className="p-6 text-center">
          <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Premium Feature</h3>
          <p className="text-gray-400">Upgrade to MoodDrop+ to access collaborative playlists.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Playlist Header */}
      <Card className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>{playlist.title}</span>
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                  Collaborative
                </Badge>
              </CardTitle>
              {playlist.description && (
                <p className="text-gray-300 mt-2">{playlist.description}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {canManage && (
                <>
                  <Button
                    onClick={() => setShowAddDropModal(true)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Track
                  </Button>
                  {isOwner && (
                    <Button
                      onClick={() => setShowInviteModal(true)}
                      size="sm"
                      variant="outline"
                      className="border-purple-400/50 text-purple-300 hover:bg-purple-400/10"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Invite
                    </Button>
                  )}
                </>
              )}
              
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/90 border-white/20">
                    <DropdownMenuItem
                      onClick={() => setShowDeleteModal(true)}
                      className="text-red-400 hover:text-red-300 focus:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Playlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Collaborators */}
      <Card className="bg-black/40 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Collaborators ({collaborators.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center space-x-2 bg-white/5 rounded-full px-3 py-2 group">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={collaborator.avatar_url} />
                  <AvatarFallback className="bg-purple-600 text-white text-xs">
                    {collaborator.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white text-sm">@{collaborator.username}</span>
                {collaborator.id === playlist.created_by && (
                  <Crown className="w-3 h-3 text-yellow-400" />
                )}
                {isOwner && collaborator.id !== playlist.created_by && (
                  <button
                    onClick={() => openRemoveCollaboratorModal(collaborator)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-red-400"
                  >
                    <UserMinus className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tracks */}
      <Card className="bg-black/40 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center space-x-2">
            <Music className="w-4 h-4" />
            <span>Tracks ({tracks.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tracks.length === 0 ? (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No tracks in this playlist yet</p>
              {canManage && (
                <Button
                  onClick={() => setShowAddDropModal(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Track
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Play className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{track.drops.song_title}</p>
                      <p className="text-gray-400 text-sm truncate">{track.drops.artist_name}</p>
                      <p className="text-gray-500 text-xs">
                        Added by @{track.profiles.username}
                      </p>
                    </div>
                  </div>
                  
                  {canManage && (user?.id === track.added_by || isOwner) && (
                    <Button
                      onClick={() => handleRemoveTrack(track.id, track.added_by)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddDropToPlaylistModal
        open={showAddDropModal}
        onOpenChange={setShowAddDropModal}
        playlistId={playlistId}
        onTrackAdded={handleTrackAdded}
      />
      
      <InviteCollaboratorModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        playlistId={playlistId}
        currentContributors={playlist.contributors}
        onCollaboratorAdded={handleCollaboratorAdded}
      />

      <DeletePlaylistModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        playlistTitle={playlist.title}
        onConfirm={handleDeletePlaylist}
        isDeleting={isDeleting}
      />

      <RemoveCollaboratorModal
        open={showRemoveCollaboratorModal}
        onOpenChange={setShowRemoveCollaboratorModal}
        collaborator={selectedCollaborator}
        onConfirm={handleRemoveCollaborator}
        isRemoving={isRemoving}
      />
    </div>
  );
};

export default CollabPlaylistManager;
