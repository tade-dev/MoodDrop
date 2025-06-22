
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
  globalPremiumEnabled: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalPremiumEnabled, setGlobalPremiumEnabled] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email === 'akintadeseun816@gmail.com';

  const fetchGlobalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('premium_enabled')
        .eq('id', 1)
        .single();
      
      if (error) throw error;
      setGlobalPremiumEnabled(data?.premium_enabled || false);
    } catch (error) {
      console.error('Error fetching global settings:', error);
      setGlobalPremiumEnabled(false);
    }
  };

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    // Admin users automatically have premium access
    if (isAdmin) {
      setSubscription({
        id: 'admin',
        plan: 'admin',
        status: 'active',
        current_period_end: '2099-12-31T23:59:59Z', // Far future date
        is_premium: true
      });
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
    fetchGlobalSettings();
    refreshSubscription();
  }, [user, isAdmin]);

  // Admin users always have premium access, regular users need active subscription AND global premium enabled
  const isPremium = isAdmin || (globalPremiumEnabled && (subscription?.is_premium || false));

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      isPremium,
      isLoading,
      refreshSubscription,
      globalPremiumEnabled,
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
