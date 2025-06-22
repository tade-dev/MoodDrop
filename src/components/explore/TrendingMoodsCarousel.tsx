
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Sparkles } from 'lucide-react';

const TrendingMoodsCarousel = () => {
  const { data: trendingMoods, isLoading } = useQuery({
    queryKey: ['trending-moods'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_trending_moods', {
        hours_back: 24,
        result_limit: 6
      });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="min-w-[200px] h-32 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <Carousel className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {trendingMoods?.map((mood, index) => (
          <CarouselItem key={mood.id} className="pl-2 md:pl-4 basis-auto">
            <Card className="min-w-[200px] bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-500">
                  {mood.emoji}
                </div>
                <h3 className="font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                  {mood.name}
                </h3>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Sparkles className="w-3 h-3" />
                  <span>{mood.drop_count} drops</span>
                </div>
                
                {/* Activity sparkline placeholder */}
                <div className="mt-3 h-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-end justify-center gap-1 p-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-purple-400 to-pink-400 rounded-full opacity-60"
                      style={{
                        width: '2px',
                        height: `${Math.random() * 12 + 4}px`
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
      <CarouselNext className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
    </Carousel>
  );
};

export default TrendingMoodsCarousel;
