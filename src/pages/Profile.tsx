import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Music, TrendingUp, Headphones, Heart, Zap, Star, Users, Bookmark } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedDropCard from '@/components/UnifiedDropCard';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userDrops, setUserDrops] = useState<any[]>([]);
  const [savedDrops, setSavedDrops] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDrops: 0,
    totalVotes: 0,
    followersCount: 0,
    followingCount: 0,
    joinedDate: '',
    streak: 7
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchProfile();
    fetchUserDrops();
    fetchSavedDrops();
    fetchFollowData();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_profile_with_stats', { profile_user_id: user.id });

      if (error) throw error;
      if (data && data.length > 0) {
        const profileData = data[0];
        setProfile(profileData);
        
        setStats(prev => ({
          ...prev,
          totalDrops: Number(profileData.drops_count) || 0,
          followersCount: Number(profileData.followers_count) || 0,
          followingCount: Number(profileData.following_count) || 0,
          joinedDate: new Date(profileData.created_at).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserDrops = async () => {
    if (!user) return;
    
    try {
      const { data: dropsData, error: dropsError } = await supabase
        .from('drops')
        .select(`
          *,
          profiles (username, avatar_url),
          moods (name, emoji)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dropsError) throw dropsError;
      setUserDrops(dropsData || []);

      // Fetch votes for user's drops
      if (dropsData && dropsData.length > 0) {
        const dropIds = dropsData.map(drop => drop.id);
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .in('drop_id', dropIds);

        if (!votesError) {
          setVotes(votesData || []);
          setStats(prev => ({
            ...prev,
            totalVotes: votesData?.length || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user drops:', error);
    }
  };

  const fetchSavedDrops = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          created_at,
          drops (
            *,
            profiles (username, avatar_url),
            moods (name, emoji)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedDrops(data?.map(bookmark => bookmark.drops).filter(Boolean) || []);
    } catch (error) {
      console.error('Error fetching saved drops:', error);
    }
  };

  const fetchFollowData = async () => {
    if (!user) return;
    
    try {
      // Fetch followers with profile data
      const { data: followersData, error: followersError } = await supabase
        .from('follows')
        .select(`
          follower_id,
          created_at,
          follower_profile:profiles!follows_follower_id_fkey (
            id,
            username, 
            avatar_url,
            email
          )
        `)
        .eq('followed_id', user.id);

      if (followersError) {
        console.error('Error fetching followers:', followersError);
      } else {
        console.log('Followers data:', followersData);
        setFollowers(followersData || []);
      }

      // Fetch following with profile data
      const { data: followingData, error: followingError } = await supabase
        .from('follows')
        .select(`
          followed_id,
          created_at,
          followed_profile:profiles!follows_followed_id_fkey (
            id,
            username, 
            avatar_url,
            email
          )
        `)
        .eq('follower_id', user.id);

      if (followingError) {
        console.error('Error fetching following:', followingError);
      } else {
        console.log('Following data:', followingData);
        setFollowing(followingData || []);
      }
    } catch (error) {
      console.error('Error fetching follow data:', error);
    }
  };

  const getDropVotes = (dropId: string) => {
    return votes
      .filter(vote => vote.drop_id === dropId)
      .filter(vote => ['fire', 'down', 'chill'].includes(vote.vote_type))
      .map(vote => ({
        vote_type: vote.vote_type as 'fire' | 'down' | 'chill',
        user_id: vote.user_id
      }));
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center pt-16 md:pt-20">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-60 right-32 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl animate-float-delayed" />
          <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl animate-float-slow" />
        </div>
        
        <div className="relative z-10 text-white text-xl animate-pulse">Loading your musical profile...</div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen">
      <div className="min-h-screen relative overflow-hidden pt-16 md:pt-20 pb-8">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-60 right-32 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl animate-float-delayed" />
          <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/3 right-1/5 w-24 h-24 bg-indigo-500/12 rounded-full blur-2xl animate-float" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-4 md:py-8">
          {/* Animated Profile Header */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-black/60 via-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-white/20 p-4 md:p-8 mb-6 md:mb-8 animate-fade-in">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-4 right-4 w-24 h-24 bg-pink-500 rounded-full blur-2xl animate-pulse"  style={{ animationDelay: '1s' }} />
            </div>
            
            <div className="relative flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              {/* Avatar with musical ring animation */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full animate-spin-slow blur-sm" style={{ padding: '3px' }} />
                <Avatar className="relative w-24 h-24 md:w-32 md:h-32 border-4 border-white/20">
                  <AvatarImage src={profile.avatar_url} className="rounded-full" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl md:text-4xl font-bold">
                    {profile.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {/* Musical note decorations */}
                <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-purple-500 rounded-full flex items-center justify-center animate-bounce">
                  <Music className="w-2 h-2 md:w-3 md:h-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2 animate-pulse">
                  {profile.username}
                </h1>
                <p className="text-gray-300 text-sm md:text-lg mb-4">{profile.email}</p>
                
                {/* Musical badges */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-300 text-xs md:text-sm">
                    <Headphones className="w-3 h-3 mr-1" />
                    Music Lover
                  </span>
                  <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/50 text-pink-300 text-xs md:text-sm">
                    <Zap className="w-3 h-3 mr-1" />
                    Vibe Creator
                  </span>
                  {stats.totalDrops >= 10 && (
                    <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 text-xs md:text-sm">
                      <Star className="w-3 h-3 mr-1" />
                      Drop Master
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-6 md:mb-8">
            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-700/30 backdrop-blur-lg border border-purple-400/30 p-3 md:p-6 text-center group hover:scale-105 transition-all duration-300 animate-fade-in">
              <div className="relative">
                <Music className="w-6 h-6 md:w-8 md:h-8 text-purple-400 mx-auto mb-2 md:mb-3 group-hover:animate-bounce" />
                <div className="text-xl md:text-3xl font-bold text-white mb-1">{stats.totalDrops}</div>
                <div className="text-purple-300 text-xs md:text-sm font-medium">Drops</div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-pink-900/50 to-pink-700/30 backdrop-blur-lg border border-pink-400/30 p-3 md:p-6 text-center group hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="relative">
                <Heart className="w-6 h-6 md:w-8 md:h-8 text-pink-400 mx-auto mb-2 md:mb-3 group-hover:animate-pulse" />
                <div className="text-xl md:text-3xl font-bold text-white mb-1">{stats.totalVotes}</div>
                <div className="text-pink-300 text-xs md:text-sm font-medium">Vibes</div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-700/30 backdrop-blur-lg border border-blue-400/30 p-3 md:p-6 text-center group hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-400 mx-auto mb-2 md:mb-3 group-hover:animate-pulse" />
                <div className="text-xl md:text-3xl font-bold text-white mb-1">{stats.followersCount}</div>
                <div className="text-blue-300 text-xs md:text-sm font-medium">Followers</div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-900/50 to-green-700/30 backdrop-blur-lg border border-green-400/30 p-3 md:p-6 text-center group hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-green-400 mx-auto mb-2 md:mb-3 group-hover:animate-pulse" />
                <div className="text-xl md:text-3xl font-bold text-white mb-1">{stats.followingCount}</div>
                <div className="text-green-300 text-xs md:text-sm font-medium">Following</div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-900/50 to-orange-700/30 backdrop-blur-lg border border-orange-400/30 p-3 md:p-6 text-center group hover:scale-105 transition-all duration-300 animate-fade-in col-span-2 md:col-span-1" style={{ animationDelay: '0.4s' }}>
              <div className="relative">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-400 mx-auto mb-2 md:mb-3 group-hover:animate-pulse" />
                <div className="text-sm md:text-lg font-bold text-white mb-1">{stats.joinedDate}</div>
                <div className="text-orange-300 text-xs md:text-sm font-medium">Member Since</div>
              </div>
            </Card>
          </div>

          {/* Tabs for different content */}
          <Tabs defaultValue="drops" className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <TabsList className="grid w-full grid-cols-4 bg-black/40 backdrop-blur-lg border border-white/10">
              <TabsTrigger value="drops" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-xs md:text-sm">
                <Music className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">My </span>Drops
              </TabsTrigger>
              <TabsTrigger value="saved" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-xs md:text-sm">
                <Bookmark className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Saved
              </TabsTrigger>
              <TabsTrigger value="followers" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-xs md:text-sm">
                <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Followers</span>
                <span className="sm:hidden">{followers.length}</span>
              </TabsTrigger>
              <TabsTrigger value="following" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-white text-xs md:text-sm">
                <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Following</span>
                <span className="sm:hidden">{following.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="drops" className="mt-6">
              {userDrops.length === 0 ? (
                <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-8 md:p-12 text-center">
                  <div className="text-4xl md:text-6xl mb-4 md:mb-6 animate-bounce">🎵</div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">No drops yet</h3>
                  <p className="text-gray-400 text-base md:text-lg mb-6">
                    Ready to share your first musical vibe with the world?
                  </p>
                  <Button
                    onClick={() => navigate('/create')}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-6 md:px-8 py-2 md:py-3 rounded-full transition-all duration-300 hover:scale-105"
                  >
                    Create Your First Drop 🎶
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4 md:space-y-6 overflow-hidden">
                  {userDrops.map((drop, index) => (
                    <div
                      key={drop.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <UnifiedDropCard
                        drop={drop}
                        votes={getDropVotes(drop.id)}
                        onVote={fetchUserDrops}
                        showFollowButton={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-6">
              {savedDrops.length === 0 ? (
                <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-8 md:p-12 text-center">
                  <div className="text-4xl md:text-6xl mb-4 md:mb-6">🔖</div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">No saved drops</h3>
                  <p className="text-gray-400 text-base md:text-lg">
                    Start bookmarking drops you love to build your collection!
                  </p>
                </Card>
              ) : (
                <div className="space-y-4 md:space-y-6 overflow-hidden">
                  {savedDrops.map((drop, index) => (
                    <div
                      key={drop.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <UnifiedDropCard
                        drop={drop}
                        votes={getDropVotes(drop.id)}
                        onVote={fetchUserDrops}
                        showFollowButton={false}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="followers" className="mt-6">
              {followers.length === 0 ? (
                <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-8 md:p-12 text-center">
                  <div className="text-4xl md:text-6xl mb-4 md:mb-6">👥</div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">No followers yet</h3>
                  <p className="text-gray-400 text-base md:text-lg">
                    Keep sharing amazing drops to attract followers!
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 overflow-hidden">
                  {followers.map((follower, index) => (
                    <Card
                      key={`${follower.follower_id}-${index}`}
                      className="bg-black/40 backdrop-blur-lg border-white/10 p-3 md:p-4 animate-fade-in"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10 md:w-12 md:h-12">
                          <AvatarImage src={follower.follower_profile?.avatar_url} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {follower.follower_profile?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-white text-sm md:text-base">{follower.follower_profile?.username || 'Unknown'}</p>
                          <p className="text-gray-400 text-xs md:text-sm">
                            Followed {new Date(follower.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="following" className="mt-6">
              {following.length === 0 ? (
                <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-8 md:p-12 text-center">
                  <div className="text-4xl md:text-6xl mb-4 md:mb-6">🔗</div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Not following anyone</h3>
                  <p className="text-gray-400 text-base md:text-lg">
                    Discover new creators and follow them to see their latest drops!
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 overflow-hidden">
                  {following.map((followed, index) => (
                    <Card
                      key={`${followed.followed_id}-${index}`}
                      className="bg-black/40 backdrop-blur-lg border-white/10 p-3 md:p-4 animate-fade-in"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10 md:w-12 md:h-12">
                          <AvatarImage src={followed.followed_profile?.avatar_url} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {followed.followed_profile?.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-white text-sm md:text-base">{followed.followed_profile?.username || 'Unknown'}</p>
                          <p className="text-gray-400 text-xs md:text-sm">
                            Following since {new Date(followed.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ScrollArea>
  );
};

export default Profile;
