
import React, { useEffect } from 'react';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';

const PremiumSuccess = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();

  useEffect(() => {
    // Refresh subscription status after successful payment
    const timer = setTimeout(() => {
      refreshSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, [refreshSubscription]);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center animate-fade-in">
        <div className="relative mb-8">
          <Crown className="w-24 h-24 text-yellow-400 mx-auto animate-bounce" />
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-yellow-400/20 animate-ping" />
          <Sparkles className="absolute top-0 right-1/4 w-6 h-6 text-pink-400 animate-pulse" />
          <Sparkles className="absolute bottom-0 left-1/4 w-4 h-4 text-blue-400 animate-pulse delay-300" />
        </div>
        
        <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Welcome to MoodDrop+! 🎉
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          You've successfully unlocked all premium features! Your musical journey just got a whole lot better.
        </p>

        <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">What's unlocked for you:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Unlimited drops per day</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Custom mood creation</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Advanced analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">AI mood matching</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Weekly boosts</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Premium profile glow</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/home')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Start Exploring <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-gray-400 text-sm">
            Your subscription will auto-renew. You can manage it anytime in your profile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumSuccess;
