
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Music, Play, Heart, TrendingUp, Users } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl animate-float-delayed" />
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in">
            <div className="relative">
              <Music className="w-16 h-16 text-purple-400 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-pink-500 rounded-full animate-ping" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              MoodDrop
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Drop your vibe, discover the soundtrack to every mood
          </p>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <Heart className="w-8 h-8 text-pink-400 mb-3 mx-auto" />
              <h3 className="text-lg font-bold text-white mb-2">Share Your Mood</h3>
              <p className="text-gray-400 text-sm">Drop songs that match your current vibe and let others feel it too</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <TrendingUp className="w-8 h-8 text-blue-400 mb-3 mx-auto" />
              <h3 className="text-lg font-bold text-white mb-2">Discover Trends</h3>
              <p className="text-gray-400 text-sm">Explore what's hot and find new music through community votes</p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-900/30 to-blue-900/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <Users className="w-8 h-8 text-purple-400 mb-3 mx-auto" />
              <h3 className="text-lg font-bold text-white mb-2">Connect Through Music</h3>
              <p className="text-gray-400 text-sm">Find people who share your musical taste and mood</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-4 rounded-full text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Dropping
            </Button>
            
            <Button
              onClick={() => navigate('/explore')}
              variant="outline"
              size="lg"
              className="border-2 border-purple-400/50 text-purple-300 hover:bg-purple-500/20 font-semibold px-8 py-4 rounded-full text-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              Explore Vibes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
