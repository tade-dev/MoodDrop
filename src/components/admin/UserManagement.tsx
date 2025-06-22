
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Users, Flag, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 10;

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', currentPage],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_users_admin', {
        page_limit: pageSize,
        page_offset: currentPage * pageSize
      });
      
      if (error) throw error;
      return data;
    },
  });

  const flagUserMutation = useMutation({
    mutationFn: async ({ userId, flagStatus }: { userId: string; flagStatus: boolean }) => {
      const { error } = await supabase.rpc('admin_flag_user', {
        user_id: userId,
        flag_status: flagStatus
      });
      
      if (error) throw error;
    },
    onSuccess: (_, { flagStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "User Updated",
        description: `User ${flagStatus ? 'flagged' : 'unflagged'} successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
      console.error('Flag user error:', error);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('admin_delete_user', {
        user_id: userId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "User Deleted",
        description: "User and all associated content deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
      console.error('Delete user error:', error);
    },
  });

  const filteredUsers = users?.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleFlagUser = (userId: string, currentFlag: boolean) => {
    flagUserMutation.mutate({ userId, flagStatus: !currentFlag });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  return (
    <Card className="bg-black/40 backdrop-blur-sm border border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>User Management</span>
        </CardTitle>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-gray-300">User</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Joined</TableHead>
                <TableHead className="text-gray-300">Drops</TableHead>
                <TableHead className="text-gray-300">Votes</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white font-medium">
                    @{user.username}
                  </TableCell>
                  <TableCell className="text-gray-300">{user.email}</TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-gray-300">{user.drops_count}</TableCell>
                  <TableCell className="text-gray-300">{user.total_votes}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.flagged ? "destructive" : "secondary"}
                      className={user.flagged ? "bg-red-500/20 text-red-400 border-red-500/30" : ""}
                    >
                      {user.flagged ? "Flagged" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFlagUser(user.id, user.flagged)}
                        disabled={flagUserMutation.isPending}
                        className={`hover:bg-yellow-500/20 ${user.flagged ? 'text-green-400 hover:text-green-300' : 'text-yellow-400 hover:text-yellow-300'}`}
                      >
                        <Flag className="w-4 h-4" />
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
                            <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              This will permanently delete @{user.username} and all their content (drops, votes, follows). This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete User
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
            Showing {filteredUsers.length} users
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
              disabled={!users || users.length < pageSize || isLoading}
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

export default UserManagement;
