
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Users, Heart, Sparkles, ArrowRight, Play, Star, Crown, Instagram, Twitter, Mail } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Landing = () => {
  const navigate = useNavigate();

  const howItWorksSteps = [
    {
      icon: "🎭",
      title: "Choose a mood",
      description: "Pick from trending vibes or create your own custom mood category"
    },
    {
      icon: "🎵", 
      title: "Drop a song or playlist",
      description: "Share your Spotify tracks with a caption about what you're feeling"
    },
    {
      icon: "🔥",
      title: "Let others vibe with votes",
      description: "Get upvotes and discover new music through community engagement"
    }
  ];

  const moodCategories = [
    { name: "Sad Boi Hours", emoji: "😭", color: "from-blue-500 to-purple-600" },
    { name: "Gym Beast Mode", emoji: "🏋️‍♂️", color: "from-red-500 to-orange-600" },
    { name: "Late Night Vibes", emoji: "🌙", color: "from-indigo-500 to-purple-700" },
    { name: "Sunday Morning", emoji: "☀️", color: "from-yellow-400 to-orange-500" },
    { name: "Road Trip Energy", emoji: "🚗", color: "from-green-400 to-blue-500" },
    { name: "Study Focus", emoji: "📚", color: "from-teal-400 to-blue-600" }
  ];

  const testimonials = [
    {
      name: "Alex M.",
      username: "@alexvibes",
      content: "Found my new favorite playlist through MoodDrop! The sad boi hours category hits different 😭🎵",
      avatar: "👨‍💻"
    },
    {
      name: "Sarah K.", 
      username: "@sarahmusic",
      content: "Love how I can discover music that matches my exact mood. The community is so supportive! 💕",
      avatar: "👩‍🎨"
    },
    {
      name: "Jake R.",
      username: "@jakesounds", 
      content: "MoodDrop+ is worth every penny. Custom moods and premium features are game changers! 🔥",
      avatar: "🎧"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 py-16 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Main Hero Content */}
            <div className="mb-12 animate-fade-in">
              <h1 className="text-7xl md:text-9xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-6 leading-tight">
                MoodDrop
              </h1>
              <p className="text-3xl md:text-4xl font-bold text-white mb-4">
                Drop the song. Set the mood.
              </p>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
                The ultimate music sharing platform where your vibes meet the perfect soundtrack. Share, discover, and connect through the universal language of music.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                onClick={() => navigate('/auth')}
                className="group px-12 py-6 text-xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:from-pink-600 hover:via-purple-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Start Vibing
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="outline"
                className="group px-12 py-6 text-xl border-2 border-white/30 bg-white/10 backdrop-blur-lg text-white hover:bg-white/20 font-semibold rounded-2xl transition-all duration-300"
              >
                <Play className="mr-2 w-6 h-6" />
                View Demo
              </Button>
            </div>

            {/* Phone Mockup */}
            <div className="relative max-w-sm mx-auto">
              <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-4 border border-white/20 shadow-2xl">
                <div className="bg-gradient-to-br from-purple-800 to-blue-900 rounded-2xl p-6 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      😎
                    </div>
                    <div>
                      <p className="text-white font-semibold">Chill Vibes</p>
                      <p className="text-gray-300 text-sm">by @musiclover</p>
                    </div>
                  </div>
                  <p className="text-white mb-3">"This song just hits different on a Sunday morning ☀️"</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="text-gray-300 hover:text-pink-400">
                      🔥 24
                    </Button>
                    <Button size="sm" variant="ghost" className="text-gray-300 hover:text-blue-400">
                      💬 8
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Three simple steps to share your musical vibes with the world
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="text-8xl mb-6 group-hover:animate-bounce">{step.icon}</div>
                <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 h-full">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mood Categories Carousel */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-white mb-4">Trending Moods</h2>
            <p className="text-xl text-gray-300">Discover what the community is vibing to</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {moodCategories.map((mood, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className={`bg-gradient-to-br ${mood.color} rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-xl`}>
                      <div className="text-6xl mb-4">{mood.emoji}</div>
                      <h3 className="text-2xl font-bold text-white mb-2">{mood.name}</h3>
                      <p className="text-white/80 mb-4">Active now</p>
                      <Button variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                        Explore
                      </Button>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Premium Tease Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <Crown className="w-16 h-16 text-white mx-auto mb-6" />
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Unlock MoodDrop+
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Get premium badges, featured vibes, unlimited custom moods, and exclusive access to trending music first.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                    ⭐ Premium Badge
                  </Badge>
                  <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                    🔥 Featured Vibes
                  </Badge>
                  <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                    🎨 Unlimited Custom Moods
                  </Badge>
                </div>

                <div className="text-3xl font-bold text-white mb-6">
                  Just £1.99/month
                </div>

                <Button className="bg-white text-gray-900 hover:bg-gray-100 font-bold text-xl px-12 py-4 rounded-2xl">
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Community Vibes */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">Community Love</h2>
            <p className="text-xl text-gray-300">See what our vibers are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400">{testimonial.username}</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">"{testimonial.content}"</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-400">Active Vibers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">1M+</div>
              <div className="text-gray-400">Songs Shared</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">200+</div>
              <div className="text-gray-400">Mood Categories</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Vibe Discovery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-black/40 backdrop-blur-lg border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 max-w-6xl mx-auto">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
                MoodDrop
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The ultimate music sharing platform where your vibes meet the perfect soundtrack. Join thousands of music lovers discovering new sounds daily.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-pink-400">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-400">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-purple-400">
                  <Mail className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Premium</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Mobile App</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 MoodDrop. All rights reserved. Made with ❤️ for music lovers everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
