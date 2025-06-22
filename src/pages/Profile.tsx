
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Music, TrendingUp } from 'lucide-react';
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
    joinedDate: ''
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
        joinedDate: new Date(data.created_at).toLocaleDateString()
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-purple-600 text-white text-2xl">
                {profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{profile.username}</h1>
              <p className="text-gray-400">{profile.email}</p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-4 text-center">
            <Music className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalDrops}</div>
            <div className="text-gray-400 text-sm">Drops</div>
          </Card>
          
          <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-4 text-center">
            <TrendingUp className="w-6 h-6 text-pink-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalVotes}</div>
            <div className="text-gray-400 text-sm">Votes</div>
          </Card>
          
          <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-4 text-center">
            <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-white">{stats.joinedDate}</div>
            <div className="text-gray-400 text-sm">Joined</div>
          </Card>
        </div>

        {/* User's Drops */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Your Drops</h2>
          {userDrops.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-lg border-white/10 p-8 text-center">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-lg font-semibold text-white mb-2">No drops yet</h3>
              <p className="text-gray-400">Start sharing your musical vibes!</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {userDrops.map((drop) => (
                <DropCard
                  key={drop.id}
                  drop={drop}
                  votes={getDropVotes(drop.id)}
                  onVote={fetchUserDrops}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
