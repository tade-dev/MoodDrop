
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserMinus } from 'lucide-react';

interface RemoveCollaboratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborator: {
    id: string;
    username: string;
    avatar_url?: string;
  } | null;
  onConfirm: () => void;
  isRemoving: boolean;
}

const RemoveCollaboratorModal = ({ 
  open, 
  onOpenChange, 
  collaborator, 
  onConfirm, 
  isRemoving 
}: RemoveCollaboratorModalProps) => {
  if (!collaborator) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/90 backdrop-blur-sm border border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <UserMinus className="w-5 h-5 text-red-400" />
            <span>Remove Collaborator</span>
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Are you sure you want to remove this collaborator from the playlist?
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
          <Avatar className="w-10 h-10">
            <AvatarImage src={collaborator.avatar_url} />
            <AvatarFallback className="bg-purple-600 text-white">
              {collaborator.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-medium">@{collaborator.username}</p>
            <p className="text-gray-400 text-sm">Collaborator</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="text-gray-400 hover:text-white"
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isRemoving}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isRemoving ? 'Removing...' : 'Remove Collaborator'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveCollaboratorModal;
