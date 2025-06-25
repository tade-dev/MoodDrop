
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Music, 
  Crown,
  Star,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import CreateCollabPlaylistModal from '@/components/playlists/CreateCollabPlaylistModal';
import CollabPlaylistManager from '@/components/playlists/CollabPlaylistManager';
import GoPremiumButton from '@/components/GoPremiumButton';

interface Playlist {
  id: string;
  title: string;
  description?: string;
  contributors: string[];
  created_by: string;
  is_collab: boolean;
  is_featured: boolean;
  follower_count: number;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

const Playlists = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Fetch user's collaborative playlists
  const { data: userPlaylists = [], refetch: refetchUserPlaylists } = useQuery({
    queryKey: ['user-collab-playlists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .contains('contributors', [user.id])
        .eq('is_collab', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Playlist[];
    },
    enabled: !!user && isPremium,
  });

  // Fetch featured collaborative playlists
  const { data: featuredPlaylists = [] } = useQuery({
    queryKey: ['featured-collab-playlists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .eq('is_featured', true)
        .eq('is_collab', true)
        .order('follower_count', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Playlist[];
    },
  });

  const handlePlaylistCreated = () => {
    refetchUserPlaylists();
    setShowCreateModal(false);
  };

  const handlePlaylistUpdate = () => {
    refetchUserPlaylists();
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-12">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl font-bold text-white mb-4">
              Collaborative Playlists
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              Create and manage playlists with friends using MoodDrop+
            </p>
            <GoPremiumButton size="lg" />
          </div>

          {/* Featured Playlists Preview */}
          {featuredPlaylists.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>Featured Collaborative Playlists</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredPlaylists.slice(0, 4).map((playlist) => (
                  <Card key={playlist.id} className="bg-white/5 border-white/10 opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold truncate">{playlist.title}</h3>
                        <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs">
                          <UserPlus className="w-3 h-3 mr-1" />
                          Collab
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">by @{playlist.profiles?.username}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Users className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-500 text-xs">{playlist.follower_count} followers</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Collaborative Playlists
            </h1>
            <p className="text-gray-300">
              Create and manage playlists with friends
            </p>
          </div>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Playlist
          </Button>
        </div>

        <Tabs defaultValue="my-playlists" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="my-playlists" className="data-[state=active]:bg-purple-600">
              My Playlists ({userPlaylists.length})
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-purple-600">
              Featured
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-playlists" className="space-y-6">
            {selectedPlaylist ? (
              <div className="space-y-4">
                <Button
                  onClick={() => setSelectedPlaylist(null)}
                  variant="ghost"
                  className="text-purple-400 hover:text-purple-300"
                >
                  ← Back to playlists
                </Button>
                <CollabPlaylistManager
                  playlistId={selectedPlaylist.id}
                  playlist={selectedPlaylist}
                  onPlaylistUpdate={handlePlaylistUpdate}
                />
              </div>
            ) : (
              <>
                {userPlaylists.length === 0 ? (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-8 text-center">
                      <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No playlists yet</h3>
                      <p className="text-gray-400 mb-6">Create your first collaborative playlist to get started.</p>
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Playlist
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userPlaylists.map((playlist) => (
                      <Card
                        key={playlist.id}
                        className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                        onClick={() => setSelectedPlaylist(playlist)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-lg truncate">
                              {playlist.title}
                            </CardTitle>
                            <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                              <UserPlus className="w-3 h-3 mr-1" />
                              Collab
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {playlist.description && (
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                              {playlist.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>by @{playlist.profiles?.username}</span>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{playlist.contributors?.length || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            {featuredPlaylists.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No featured playlists</h3>
                  <p className="text-gray-400">Check back later for featured collaborative playlists.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPlaylists.map((playlist) => (
                  <Card
                    key={playlist.id}
                    className="bg-gradient-to-br from-yellow-900/30 via-orange-900/20 to-red-900/30 backdrop-blur-sm border border-white/10 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg truncate">
                          {playlist.title}
                        </CardTitle>
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {playlist.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {playlist.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>by @{playlist.profiles?.username}</span>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{playlist.contributors?.length || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>{playlist.follower_count}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <CreateCollabPlaylistModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onPlaylistCreated={handlePlaylistCreated}
        />
      </div>
    </div>
  );
};

export default Playlists;
