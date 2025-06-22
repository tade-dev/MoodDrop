
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Music, Users, Heart, Sparkles } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              MoodDrop
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Share your musical vibes with the world
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <Music className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Share Music</h3>
              <p className="text-gray-400">Drop your favorite tracks and discover new music through mood-based sharing</p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Express Moods</h3>
              <p className="text-gray-400">Connect with others through the universal language of music and emotions</p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Custom Moods</h3>
              <p className="text-gray-400">Create your own mood categories and personalize your musical journey</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Button
              onClick={() => navigate('/auth')}
              className="w-full md:w-auto px-12 py-4 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Button>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/auth')}
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                1
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Choose Your Mood</h3>
              <p className="text-gray-400">Select from default moods or create your own custom categories</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                2
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Drop Your Track</h3>
              <p className="text-gray-400">Share a Spotify link with a caption about what you're feeling</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                3
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Connect & Discover</h3>
              <p className="text-gray-400">Vote on others' drops and discover music that matches your vibe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
