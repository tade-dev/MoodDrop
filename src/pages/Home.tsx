
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import GroupedDropsFeed from '@/components/GroupedDropsFeed';
import WeeklyChallengeBanner from '@/components/WeeklyChallengeBanner';

const Home = () => {
  const [selectedMood, setSelectedMood] = useState<string>('all');

  // Fetch moods for filter dropdown
  const { data: moods } = useQuery({
    queryKey: ['moods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Weekly Challenge Banner */}
      <WeeklyChallengeBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Feed</h1>
          <p className="text-gray-400">Discover the latest music drops from your community</p>
        </div>
        <Link to="/create">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Drop
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedMood} onValueChange={setSelectedMood}>
          <SelectTrigger className="w-48 bg-black/40 border-white/10 text-white">
            <SelectValue placeholder="Filter by mood" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/10">
            <SelectItem value="all" className="text-white hover:bg-white/10">
              All Moods
            </SelectItem>
            {moods?.map((mood) => (
              <SelectItem 
                key={mood.id} 
                value={mood.id}
                className="text-white hover:bg-white/10"
              >
                {mood.emoji} {mood.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grouped Drops Feed */}
      <GroupedDropsFeed moodFilter={selectedMood === 'all' ? undefined : selectedMood} />
    </div>
  );
};

export default Home;
