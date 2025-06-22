
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Heart, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MoodsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: moods, isLoading } = useQuery({
    queryKey: ['admin-moods'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_moods_admin');
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMoodMutation = useMutation({
    mutationFn: async (moodId: string) => {
      const { error } = await supabase.rpc('admin_delete_mood', {
        mood_id: moodId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-moods'] });
      toast({
        title: "Mood Deleted",
        description: "Custom mood deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete mood.",
        variant: "destructive",
      });
      console.error('Delete mood error:', error);
    },
  });

  const handleDeleteMood = (moodId: string) => {
    deleteMoodMutation.mutate(moodId);
  };

  return (
    <Card className="bg-black/40 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Heart className="w-5 h-5" />
          <span>Moods & Vibes Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-gray-300">Mood</TableHead>
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Creator</TableHead>
                <TableHead className="text-gray-300">Drops Count</TableHead>
                <TableHead className="text-gray-300">Created</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moods?.map((mood) => (
                <TableRow key={mood.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{mood.emoji}</span>
                      <span>{mood.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={mood.is_custom ? "secondary" : "default"}
                      className={mood.is_custom ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"}
                    >
                      {mood.is_custom ? "Custom" : "Default"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {mood.is_custom ? (
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>@{mood.creator_username || 'Unknown'}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">System</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">{mood.drops_count}</TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(mood.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {mood.is_custom ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            disabled={mood.drops_count > 0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-black/90 border border-white/20">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Custom Mood</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              This will permanently delete the custom mood "{mood.emoji} {mood.name}". This action cannot be undone.
                              {mood.drops_count > 0 && (
                                <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded">
                                  <strong>Cannot delete:</strong> This mood has {mood.drops_count} associated drops.
                                </div>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                              Cancel
                            </AlertDialogCancel>
                            {mood.drops_count === 0 && (
                              <AlertDialogAction
                                onClick={() => handleDeleteMood(mood.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete Mood
                              </AlertDialogAction>
                            )}
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <span className="text-gray-500 text-sm">Protected</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10">
          <h4 className="text-white font-medium mb-2">Mood Management Rules:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Default moods cannot be deleted (system protected)</li>
            <li>• Custom moods can only be deleted if they have no associated drops</li>
            <li>• Deleting a mood will not affect existing drops (they keep their mood reference)</li>
            <li>• Users can create custom moods from the Create Drop page</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodsManagement;
