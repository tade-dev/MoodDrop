
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Chrome } from 'lucide-react';

const GoogleAuthButton = () => {
  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
        toast({
          title: "Sign-in failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
      toast({
        title: "Sign-in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      variant="outline"
      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
    >
      <Chrome className="w-5 h-5 mr-2" />
      Continue with Google
    </Button>
  );
};

export default GoogleAuthButton;
