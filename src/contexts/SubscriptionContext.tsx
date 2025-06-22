
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_end: string;
  is_premium: boolean;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isPremium: boolean;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_subscription');
      
      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
      } else if (data && data.length > 0) {
        setSubscription(data[0]);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error in refreshSubscription:', error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [user]);

  const isPremium = subscription?.is_premium || false;

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      isPremium,
      isLoading,
      refreshSubscription,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
