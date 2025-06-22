
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CreateMoodModalProps {
  onMoodCreated: () => void;
}

const CreateMoodModal = ({ onMoodCreated }: CreateMoodModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [moodName, setMoodName] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be signed in to create custom moods",
        variant: "destructive"
      });
      return;
    }

    if (!moodName.trim() || !moodEmoji.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and emoji for your mood",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('moods')
        .insert({
          name: moodName.trim(),
          emoji: moodEmoji.trim(),
          is_custom: true,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Custom mood created!",
        description: `"${moodName}" has been added to your moods`
      });

      setMoodName('');
      setMoodEmoji('');
      setIsOpen(false);
      onMoodCreated();
    } catch (error) {
      console.error('Error creating mood:', error);
      toast({
        title: "Error creating mood",
        description: "There was a problem creating your custom mood",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400/30 text-white hover:bg-purple-600/30 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Mood
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/90 backdrop-blur-lg border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Create Custom Mood
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="moodName" className="text-gray-300">
              Mood Name
            </Label>
            <Input
              id="moodName"
              type="text"
              value={moodName}
              onChange={(e) => setMoodName(e.target.value)}
              placeholder="e.g., Melancholy, Euphoric, Contemplative..."
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moodEmoji" className="text-gray-300">
              Mood Emoji
            </Label>
            <Input
              id="moodEmoji"
              type="text"
              value={moodEmoji}
              onChange={(e) => setMoodEmoji(e.target.value)}
              placeholder="🌙"
              className="bg-white/10 border-white/20 text-white placeholder-gray-400 text-center text-2xl"
              maxLength={2}
            />
            <p className="text-gray-500 text-sm">
              Choose an emoji that represents this mood
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {isLoading ? 'Creating...' : 'Create Mood'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMoodModal;
