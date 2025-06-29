
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
  UserPlus,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import CreateCollabPlaylistModal from '@/components/playlists/CreateCollabPlaylistModal';
import CollabPlaylistManager from '@/components/playlists/CollabPlaylistManager';
import AIPlaylistGenerator from '@/components/playlists/AIPlaylistGenerator';
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
  const isMobile = useIsMobile();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Fetch user's collaborative playlists
  const { data: userPlaylists = [], refetch: refetchUserPlaylists } = useQuery({
    queryKey: ['user-collab-playlists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching user playlists for user:', user.id);
      
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .contains('contributors', [user.id])
        .eq('is_collab', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user playlists:', error);
        throw error;
      }
      
      console.log('Fetched user playlists:', data);
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
    console.log('Playlist created, refetching...');
    refetchUserPlaylists();
    setShowCreateModal(false);
  };

  const handlePlaylistUpdate = () => {
    console.log('Playlist updated, refetching...');
    refetchUserPlaylists();
  };

  const handlePlaylistDeleted = () => {
    console.log('Playlist deleted, clearing selection and refetching...');
    setSelectedPlaylist(null);
    refetchUserPlaylists();
  };

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-pink-900/20">
        <div className={cn("container mx-auto py-8 max-w-4xl", isMobile ? "px-4" : "px-4")}>
          <div className="text-center mb-12">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
            <h1 className={cn("font-bold text-white mb-4", isMobile ? "text-2xl" : "text-4xl")}>
              Collaborative Playlists
            </h1>
            <p className={cn("text-gray-300 mb-6", isMobile ? "text-base" : "text-lg")}>
              Create and manage playlists with friends using MoodDrop+
            </p>
            <GoPremiumButton size={isMobile ? "default" : "lg"} />
          </div>

          {/* Featured Playlists Preview */}
          {featuredPlaylists.length > 0 && (
            <div className="mb-8">
              <h2 className={cn("font-bold text-white mb-4 flex items-center space-x-2", isMobile ? "text-lg" : "text-xl")}>
                <Star className="w-5 h-5 text-yellow-400" />
                <span>Featured Collaborative Playlists</span>
              </h2>
              <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
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
      <div className={cn("container mx-auto py-8 max-w-6xl", isMobile ? "px-4" : "px-4")}>
        <div className={cn("flex items-center justify-between mb-8", isMobile && "flex-col space-y-4")}>
          <div className={cn(isMobile && "text-center")}>
            <h1 className={cn("font-bold text-white mb-2", isMobile ? "text-2xl" : "text-3xl")}>
              Playlists
            </h1>
            <p className={cn("text-gray-300", isMobile ? "text-sm" : "text-base")}>
              Create collaborative playlists or generate them with AI
            </p>
          </div>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className={cn(
              "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
              isMobile && "w-full"
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Playlist
          </Button>
        </div>

        <Tabs defaultValue="ai-generator" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="ai-generator" className="data-[state=active]:bg-purple-600">
              <Sparkles className="w-4 h-4" />
              {!isMobile && <span className="ml-2">AI Generator</span>}
              {isMobile && <span className="text-xs ml-1">AI</span>}
            </TabsTrigger>
            <TabsTrigger value="my-playlists" className="data-[state=active]:bg-purple-600">
              {!isMobile && <span>My Playlists ({userPlaylists.length})</span>}
              {isMobile && <span className="text-xs">Mine ({userPlaylists.length})</span>}
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-purple-600">
              {!isMobile && <span>Featured</span>}
              {isMobile && <span className="text-xs">Featured</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-generator" className="space-y-6">
            <AIPlaylistGenerator />
          </TabsContent>

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
                  onPlaylistDeleted={handlePlaylistDeleted}
                />
              </div>
            ) : (
              <>
                {userPlaylists.length === 0 ? (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-8 text-center">
                      <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className={cn("font-semibold text-white mb-2", isMobile ? "text-base" : "text-lg")}>
                        No playlists yet
                      </h3>
                      <p className={cn("text-gray-400 mb-6", isMobile ? "text-sm" : "text-base")}>
                        Create your first collaborative playlist to get started.
                      </p>
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className={cn(
                          "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
                          isMobile && "w-full"
                        )}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Playlist
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
                    {userPlaylists.map((playlist) => (
                      <Card
                        key={playlist.id}
                        className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                        onClick={() => setSelectedPlaylist(playlist)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className={cn("text-white truncate", isMobile ? "text-base" : "text-lg")}>
                              {playlist.title}
                            </CardTitle>
                            <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs">
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
                  <h3 className={cn("font-semibold text-white mb-2", isMobile ? "text-base" : "text-lg")}>
                    No featured playlists
                  </h3>
                  <p className={cn("text-gray-400", isMobile ? "text-sm" : "text-base")}>
                    Check back later for featured collaborative playlists.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}>
                {featuredPlaylists.map((playlist) => (
                  <Card
                    key={playlist.id}
                    className="bg-gradient-to-br from-yellow-900/30 via-orange-900/20 to-red-900/30 backdrop-blur-sm border border-white/10 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className={cn("text-white truncate", isMobile ? "text-base" : "text-lg")}>
                          {playlist.title}
                        </CardTitle>
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 text-xs">
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
