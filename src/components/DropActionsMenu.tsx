
import React, { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from '@/hooks/use-toast';

interface DropActionsMenuProps {
  dropId: string;
  userId: string;
  onDropDeleted?: () => void;
  onDropEdit?: () => void;
}

const DropActionsMenu = ({ dropId, userId, onDropDeleted, onDropEdit }: DropActionsMenuProps) => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Only show menu if current user is the drop creator
  if (!user || user.id !== userId) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full opacity-50 cursor-not-allowed"
        disabled
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('drops')
        .delete()
        .eq('id', dropId)
        .eq('user_id', user.id); // Extra security check

      if (error) throw error;

      toast({
        title: "Drop deleted",
        description: "Your drop has been successfully deleted.",
      });

      onDropDeleted?.();
    } catch (error) {
      console.error('Error deleting drop:', error);
      toast({
        title: "Error",
        description: "Failed to delete drop. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Editing drops is a premium feature. Upgrade to premium to edit your drops.",
        variant: "destructive"
      });
      return;
    }
    onDropEdit?.();
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48 bg-black/90 backdrop-blur-sm border border-white/20">
          <ContextMenuItem 
            onClick={handleEdit}
            className="flex items-center space-x-2 text-white hover:bg-white/10 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Drop</span>
            {!isPremium && <Crown className="w-3 h-3 text-yellow-500 ml-auto" />}
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center space-x-2 text-red-400 hover:bg-red-500/10 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Drop</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-black/90 backdrop-blur-sm border border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Drop</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete this drop? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DropActionsMenu;
