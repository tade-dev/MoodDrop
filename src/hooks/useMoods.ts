
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from '@/hooks/use-toast';

interface Mood {
  id: string;
  name: string;
  emoji: string;
}

export const useMoods = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMoods();
    }
  }, [user, isPremium]);

  const fetchMoods = async () => {
    try {
      setLoading(true);
      let query = supabase.from('moods').select('*');
      
      // Non-premium users can only see public moods
      if (!isPremium) {
        query = query.or('is_custom.eq.false,and(is_custom.eq.true,created_by.eq.' + user.id + ')');
      }
      
      const { data, error } = await query.order('created_at', { ascending: true });
      
      if (error) throw error;
      setMoods(data || []);
    } catch (error) {
      console.error('Error fetching moods:', error);
      toast({
        title: "Error",
        description: "Failed to load moods",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { moods, loading, refetch: fetchMoods };
};
