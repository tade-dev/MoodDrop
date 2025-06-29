
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteAIPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistTitle: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteAIPlaylistModal = ({ 
  open, 
  onOpenChange, 
  playlistTitle, 
  onConfirm, 
  isDeleting 
}: DeleteAIPlaylistModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-red-400" />
            <span>Delete AI Playlist</span>
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Are you sure you want to delete "{playlistTitle}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="text-gray-400 hover:text-white"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Delete Playlist'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAIPlaylistModal;
