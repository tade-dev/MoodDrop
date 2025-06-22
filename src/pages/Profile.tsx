
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Music, TrendingUp, Headphones, Heart, Zap, Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DropCard from '@/components/DropCard';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userDrops, setUserDrops] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDrops: 0,
    totalVotes: 0,
    joinedDate: '',
    streak: 7 // Mock streak data
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchProfile();
    fetchUserDrops();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      
      setStats(prev => ({
        ...prev,
        joinedDate: new Date(data.created_at).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        })
      }));
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
      
      setStats(prev => ({
        ...prev,
        totalDrops: dropsData?.length || 0
      }));

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

  const getDropVotes = (dropId: string) => {
    return votes.filter(vote => vote.drop_id === dropId);
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center pt-20">
        <div className="text-white text-xl animate-pulse">Loading your musical profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Animated Profile Header */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-black/60 via-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-white/20 p-8 mb-8 animate-fade-in">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-4 right-4 w-24 h-24 bg-pink-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar with musical ring animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full animate-spin-slow blur-sm" style={{ padding: '3px' }} />
              <Avatar className="relative w-32 h-32 border-4 border-white/20">
                <AvatarImage src={profile.avatar_url} className="rounded-full" />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-4xl font-bold">
                  {profile.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {/* Musical note decorations */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-bounce">
                <Music className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2 animate-pulse">
                {profile.username}
              </h1>
              <p className="text-gray-300 text-lg mb-4">{profile.email}</p>
              
              {/* Musical badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-300 text-sm">
                  <Headphones className="w-3 h-3 mr-1" />
                  Music Lover
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/50 text-pink-300 text-sm">
                  <Zap className="w-3 h-3 mr-1" />
                  Vibe Creator
                </span>
                {stats.totalDrops >= 10 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/50 text-yellow-300 text-sm">
                    <Star className="w-3 h-3 mr-1" />
                    Drop Master
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-700/30 backdrop-blur-lg border border-purple-400/30 p-6 text-center group hover:scale-105 transition-all duration-300 animate-fade-in">
            <div className="relative">
              <Music className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:animate-bounce" />
              <div className="text-3xl font-bold text-white mb-1">{stats.totalDrops}</div>
              <div className="text-purple-300 text-sm font-medium">Total Drops</div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-pink-900/50 to-pink-700/30 backdrop-blur-lg border border-pink-400/30 p-6 text-center group hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative">
              <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3 group-hover:animate-pulse" />
              <div className="text-3xl font-bold text-white mb-1">{stats.totalVotes}</div>
              <div className="text-pink-300 text-sm font-medium">Total Vibes</div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-700/30 backdrop-blur-lg border border-blue-400/30 p-6 text-center group hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <Zap className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:animate-spin" />
              <div className="text-3xl font-bold text-white mb-1">{stats.streak}</div>
              <div className="text-blue-300 text-sm font-medium">Day Streak</div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-900/50 to-green-700/30 backdrop-blur-lg border border-green-400/30 p-6 text-center group hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              <Calendar className="w-6 h-6 text-green-400 mx-auto mb-3 group-hover:animate-pulse" />
              <div className="text-lg font-bold text-white mb-1">{stats.joinedDate}</div>
              <div className="text-green-300 text-sm font-medium">Member Since</div>
            </div>
          </Card>
        </div>

        {/* User's Drops Section */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Musical Drops
            </h2>
            <div className="flex items-center space-x-2 text-gray-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Latest first</span>
            </div>
          </div>
          
          {userDrops.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-12 text-center">
              <div className="text-6xl mb-6 animate-bounce">🎵</div>
              <h3 className="text-2xl font-bold text-white mb-4">No drops yet</h3>
              <p className="text-gray-400 text-lg mb-6">
                Ready to share your first musical vibe with the world?
              </p>
              <button
                onClick={() => navigate('/create')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105"
              >
                Create Your First Drop 🎶
              </button>
            </Card>
          ) : (
            <div className="space-y-6">
              {userDrops.map((drop, index) => (
                <div
                  key={drop.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <DropCard
                    drop={drop}
                    votes={getDropVotes(drop.id)}
                    onVote={fetchUserDrops}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
