
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Facebook, Mail, Share, Twitter } from 'lucide-react';
import { toast } from 'sonner';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dropId: string;
  songTitle: string;
  artistName: string;
}

const ShareDialog = ({ isOpen, onClose, dropId, songTitle, artistName }: ShareDialogProps) => {
  const shareUrl = `${window.location.origin}/drop/${dropId}`;
  const shareText = `Check out "${songTitle}" by ${artistName} on MoodDrop!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleMailShare = () => {
    const mailUrl = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.open(mailUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30 backdrop-blur-sm border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <Share className="w-5 h-5 text-purple-400" />
            <span>Share Drop</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Link Display and Copy */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Drop Link</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-black/20 border-white/20 text-white text-sm rounded-md px-3 py-2 border"
              />
              <Button
                onClick={handleCopyLink}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Share via:</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleWhatsAppShare}
                variant="outline"
                className="bg-green-600/20 border-green-400/30 text-green-300 hover:bg-green-600/30"
              >
                <Share className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              
              <Button
                onClick={handleFacebookShare}
                variant="outline"
                className="bg-blue-600/20 border-blue-400/30 text-blue-300 hover:bg-blue-600/30"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              
              <Button
                onClick={handleTwitterShare}
                variant="outline"
                className="bg-sky-600/20 border-sky-400/30 text-sky-300 hover:bg-sky-600/30"
              >
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              
              <Button
                onClick={handleMailShare}
                variant="outline"
                className="bg-gray-600/20 border-gray-400/30 text-gray-300 hover:bg-gray-600/30"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
