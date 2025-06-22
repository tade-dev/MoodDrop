
import React, { useState } from 'react';
import { Crown, Zap, BarChart3, Sparkles, TrendingUp, Lock, Star, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const GoPremium = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { toast } = useToast();
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email === 'akintadeseun816@gmail.com';

  const { data: settings } = useQuery({
    queryKey: ['global-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_settings')
        .select('premium_enabled')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const premiumFeatures = [
    {
      icon: Zap,
      title: "Unlimited Drops",
      description: "Share as many musical vibes as you want, no daily limits",
      color: "text-yellow-400"
    },
    {
      icon: Sparkles,
      title: "Custom Moods",
      description: "Create your own unique mood categories and expressions",
      color: "text-purple-400"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep insights into your music taste and drop performance",
      color: "text-blue-400"
    },
    {
      icon: Star,
      title: "AI Mood-Matcher",
      description: "Smart recommendations based on your current vibe",
      color: "text-pink-400"
    },
    {
      icon: TrendingUp,
      title: "Weekly Boost",
      description: "Get your drops featured to reach more music lovers",
      color: "text-green-400"
    },
    {
      icon: Lock,
      title: "Private Moods",
      description: "Create exclusive mood circles for close friends only",
      color: "text-indigo-400"
    },
    {
      icon: Crown,
      title: "Profile Glow",
      description: "Stand out with a premium golden aura around your profile",
      color: "text-amber-400"
    }
  ];

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe to MoodDrop+",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { plan: isYearly ? 'yearly' : 'monthly' }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Admin users should see they already have premium access
  if (isAdmin) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Admin Account - Full Access! 👑
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              As an admin, you have access to all premium features and administrative controls.
            </p>
            <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-400/30 rounded-lg p-6 mb-6">
              <p className="text-amber-200">
                🎉 You already have unlimited access to all MoodDrop+ features including admin tools!
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/home')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Back to App
          </Button>
        </div>
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              You're already a MoodDrop+ member! 🎉
            </h1>
            <p className="text-gray-300 text-lg">
              Enjoy all your premium features and keep dropping those vibes!
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/home')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Back to App
          </Button>
        </div>
      </div>
    );
  }

  const premiumUnavailable = settings?.premium_enabled === false;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative mb-6">
            <Crown className="w-20 h-20 text-yellow-400 mx-auto animate-pulse" />
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-yellow-400/20 animate-ping" />
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Unlock MoodDrop+
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Elevate your musical journey with unlimited drops, exclusive features, and premium analytics
          </p>

          {/* Pricing Toggle */}
          {!premiumUnavailable && (
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-lg font-medium ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
              />
              <span className={`text-lg font-medium ${isYearly ? 'text-white' : 'text-gray-400'}`}>
                Yearly
              </span>
              {isYearly && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  Save 2 months!
                </span>
              )}
            </div>
          )}

          {/* Pricing Card */}
          {!premiumUnavailable && (
            <Card className="max-w-md mx-auto mb-12 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-400/30">
              <CardContent className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">
                  £{isYearly ? '15.99' : '1.99'}
                </div>
                <div className="text-gray-300 mb-6">
                  per {isYearly ? 'year' : 'month'}
                </div>
                
                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {isLoading ? 'Processing...' : (
                    <>
                      Subscribe Now <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {premiumUnavailable && (
            <Card className="max-w-md mx-auto mb-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/30">
              <CardContent className="p-8 text-center">
                <div className="text-2xl font-bold text-gray-400 mb-4">
                  Premium Temporarily Unavailable
                </div>
                <p className="text-gray-500">
                  Premium subscriptions are currently disabled. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {premiumFeatures.map((feature, index) => (
            <Card
              key={index}
              className="bg-black/40 backdrop-blur-lg border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <feature.icon className={`w-8 h-8 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
                <Check className="w-5 h-5 text-green-400 mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        {!premiumUnavailable && (
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              Join thousands of music lovers already enjoying MoodDrop+
            </p>
            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white transition-all duration-300"
            >
              {isLoading ? 'Processing...' : 'Get Started Today'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoPremium;
