import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Music, Trash2, ExternalLink, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DropsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const pageSize = 10;

  const { data: drops, isLoading } = useQuery({
    queryKey: ['admin-drops', currentPage, selectedMood],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_drops_admin', {
        page_limit: pageSize,
        page_offset: currentPage * pageSize,
        mood_filter: selectedMood === 'all' ? null : selectedMood
      });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: moods } = useQuery({
    queryKey: ['moods-for-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moods')
        .select('id, name, emoji')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const deleteDropMutation = useMutation({
    mutationFn: async (dropId: string) => {
      const { error } = await supabase.rpc('admin_delete_drop', {
        drop_id: dropId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drops'] });
      toast({
        title: "Drop Deleted",
        description: "Drop deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete drop.",
        variant: "destructive",
      });
      console.error('Delete drop error:', error);
    },
  });

  const filteredDrops = drops?.filter(drop =>
    drop.song_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drop.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drop.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDeleteDrop = (dropId: string) => {
    deleteDropMutation.mutate(dropId);
  };

  return (
    <Card className="bg-black/40 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Music className="w-5 h-5" />
          <span>Drops Management</span>
        </CardTitle>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search drops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          <Select value={selectedMood} onValueChange={setSelectedMood}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by mood" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              <SelectItem value="all">All Moods</SelectItem>
              {moods?.map((mood) => (
                <SelectItem key={mood.id} value={mood.id} className="text-white">
                  {mood.emoji} {mood.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-gray-300">Song</TableHead>
                <TableHead className="text-gray-300">Artist</TableHead>
                <TableHead className="text-gray-300">User</TableHead>
                <TableHead className="text-gray-300">Mood</TableHead>
                <TableHead className="text-gray-300">Votes</TableHead>
                <TableHead className="text-gray-300">Created</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrops.map((drop) => (
                <TableRow key={drop.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white font-medium max-w-48 truncate">
                    {drop.song_title}
                  </TableCell>
                  <TableCell className="text-gray-300">{drop.artist_name}</TableCell>
                  <TableCell className="text-gray-300">
                    <div>
                      <div>@{drop.username}</div>
                      <div className="text-xs text-gray-500">{drop.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {drop.mood_emoji} {drop.mood_name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{drop.vote_count}</TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(drop.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(drop.spotify_url, '_blank')}
                        className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-black/90 border border-white/20">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Drop</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              This will permanently delete "{drop.song_title}" by {drop.artist_name}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDrop(drop.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete Drop
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-gray-400 text-sm">
            Showing {filteredDrops.length} drops
          </p>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0 || isLoading}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-gray-300 text-sm">
              Page {currentPage + 1}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!drops || drops.length < pageSize || isLoading}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DropsManagement;
