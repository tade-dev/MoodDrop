
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PremiumToggleHeader from './PremiumToggleHeader';
import PremiumToggleSwitch from './PremiumToggleSwitch';
import PremiumFeatureInfo from './PremiumFeatureInfo';

const PremiumToggle = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if current user is the authorized admin
  const isAuthorizedAdmin = user?.email === 'akintadeseun816@gmail.com';

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['global-settings'],
    queryFn: async () => {
      console.log('Fetching global settings...');
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (error) {
        console.error('Error fetching global settings:', error);
        throw error;
      }
      console.log('Global settings fetched:', data);
      return data;
    },
    enabled: isAuthorizedAdmin,
    retry: 1,
  });

  const updatePremiumMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      console.log('Updating premium setting to:', enabled);
      
      if (!isAuthorizedAdmin) {
        throw new Error('Access denied: Only the super admin can modify premium settings');
      }
      
      const { error } = await supabase
        .from('global_settings')
        .update({ 
          premium_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);
      
      if (error) {
        console.error('Error updating premium setting:', error);
        throw error;
      }
      console.log('Premium setting updated successfully');
      return enabled;
    },
    onSuccess: (enabled) => {
      queryClient.invalidateQueries({ queryKey: ['global-settings'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast({
        title: "Premium Settings Updated",
        description: `Premium restrictions ${enabled ? 'enabled' : 'disabled'} globally. ${enabled ? 'Only subscribers and admin have premium access.' : 'All users now have free access to premium features.'}`,
      });
    },
    onError: (error: any) => {
      console.error('Premium toggle mutation error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update premium settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (checked: boolean) => {
    if (!isAuthorizedAdmin) {
      toast({
        title: "Access Denied",
        description: "Only the super admin (akintadeseun816@gmail.com) can modify premium settings.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Toggle clicked, new value:', checked);
    updatePremiumMutation.mutate(checked);
  };

  if (!isAuthorizedAdmin) {
    return (
      <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-400/30">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 text-red-400">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Access Restricted</h3>
              <p className="text-sm text-gray-400">
                Only the super admin (akintadeseun816@gmail.com) can access premium settings.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Current user: {user?.email || 'Not authenticated'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-400/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <AlertTriangle className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-gray-400">Loading premium settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-400/30">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 text-red-400">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Error Loading Settings</h3>
              <p className="text-sm text-gray-400">
                {error.message || 'Failed to load premium settings. Please try refreshing the page.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-400/30">
        <PremiumToggleHeader premiumEnabled={settings?.premium_enabled} />
        <CardContent className="space-y-4">
          <PremiumToggleSwitch
            premiumEnabled={settings?.premium_enabled}
            onToggle={handleToggle}
            isUpdating={updatePremiumMutation.isPending}
          />
          <PremiumFeatureInfo
            premiumEnabled={settings?.premium_enabled}
            isUpdating={updatePremiumMutation.isPending}
            lastUpdated={settings?.updated_at}
          />
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default PremiumToggle;
