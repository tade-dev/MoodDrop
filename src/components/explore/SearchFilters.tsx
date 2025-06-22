
import React, { useState } from 'react';
import { Search, Filter, Clock, TrendingUp, Calendar, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
  sortFilter: string;
  setSortFilter: (filter: string) => void;
}

const SearchFilters = ({
  searchQuery,
  setSearchQuery,
  timeFilter,
  setTimeFilter,
  sortFilter,
  setSortFilter
}: SearchFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const timeFilters = [
    { value: '24h', label: '24 Hours', icon: Clock },
    { value: '7d', label: '7 Days', icon: Calendar },
    { value: 'all', label: 'All Time', icon: Star }
  ];

  const sortFilters = [
    { value: 'most-voted', label: 'Most Voted', icon: TrendingUp },
    { value: 'newest', label: 'Newest', icon: Calendar },
    { value: 'trending', label: 'Trending', icon: Star }
  ];

  return (
    <div className="mb-8 space-y-4 animate-fade-in">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search for moods, drops, artists, or users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-16 bg-white/10 border-white/20 text-white placeholder-gray-400 h-12 text-lg backdrop-blur-sm focus:border-purple-400/50 focus:bg-white/15"
        />
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Chips */}
      <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-3">
          {/* Time Filters */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Time Range</p>
            <div className="flex gap-2 flex-wrap">
              {timeFilters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <Badge
                    key={filter.value}
                    variant={timeFilter === filter.value ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-300 ${
                      timeFilter === filter.value
                        ? 'bg-purple-500 text-white border-purple-400'
                        : 'text-gray-400 border-gray-500/30 hover:border-purple-400/50 hover:text-white'
                    }`}
                    onClick={() => setTimeFilter(filter.value)}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {filter.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Sort Filters */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Sort By</p>
            <div className="flex gap-2 flex-wrap">
              {sortFilters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <Badge
                    key={filter.value}
                    variant={sortFilter === filter.value ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-300 ${
                      sortFilter === filter.value
                        ? 'bg-purple-500 text-white border-purple-400'
                        : 'text-gray-400 border-gray-500/30 hover:border-purple-400/50 hover:text-white'
                    }`}
                    onClick={() => setSortFilter(filter.value)}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {filter.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
