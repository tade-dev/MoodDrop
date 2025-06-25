
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/contexts/SubscriptionContext';

export const useDropLimit = () => {
  const { isPremium } = useSubscription();
  const [canCreateDrop, setCanCreateDrop] = useState(true);
  const [thisMonthDropCount, setThisMonthDropCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDropLimit();
  }, [isPremium]);

  const checkDropLimit = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('can_user_create_drop');
      if (error) throw error;
      
      setCanCreateDrop(data);
      setThisMonthDropCount(isPremium ? 0 : (data ? 0 : 3));
    } catch (error) {
      console.error('Error checking drop limit:', error);
    } finally {
      setLoading(false);
    }
  };

  return { canCreateDrop, thisMonthDropCount, loading, refetch: checkDropLimit };
};
