
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Loader2, AlertTriangle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
    enabled: isAuthorizedAdmin, // Only fetch if authorized
    retry: 1, // Reduce retries to fail faster on permission errors
  });

  const updatePremiumMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      console.log('Updating premium setting to:', enabled);
      
      // Double-check authorization before making the request
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
      // Also invalidate subscription context to update premium states
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast({
        title: "Premium Settings Updated",
        description: `Premium features ${enabled ? 'enabled' : 'disabled'} globally.`,
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

  // Show unauthorized message if not the correct admin
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
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
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
    <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-400/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          <span>Premium Features Control</span>
          <Badge variant={settings?.premium_enabled ? "default" : "secondary"}>
            {settings?.premium_enabled ? "ACTIVE" : "INACTIVE"}
          </Badge>
          <Shield className="w-4 h-4 text-green-400 ml-auto" title="Secure Admin Access" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Global Premium Toggle</h3>
            <p className="text-gray-400 text-sm">
              Control premium features across the entire platform
            </p>
          </div>
          <Switch
            checked={settings?.premium_enabled || false}
            onCheckedChange={handleToggle}
            disabled={updatePremiumMutation.isPending}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
          />
        </div>
        
        <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10">
          <h4 className="text-white font-medium mb-2">Current Status:</h4>
          <p className="text-gray-300 text-sm mb-3">
            Premium features are currently <strong>{settings?.premium_enabled ? 'ENABLED' : 'DISABLED'}</strong> for all users.
          </p>
          
          <h4 className="text-white font-medium mb-2">Premium Access Logic:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• <strong>Admin:</strong> Always has premium access</li>
            <li>• <strong>When DISABLED:</strong> All users get free access to everything</li>
            <li>• <strong>When ENABLED:</strong> Only subscribers + admin have premium features</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10">
          <h4 className="text-white font-medium mb-2">Premium Features Include:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Advanced mood filtering options</li>
            <li>• Unlimited playlist creation</li>
            <li>• Priority drop visibility</li>
            <li>• Custom profile themes</li>
            <li>• Enhanced analytics</li>
          </ul>
        </div>

        {updatePremiumMutation.isPending && (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400 mr-2" />
            <span className="text-gray-400 text-sm">Updating settings...</span>
          </div>
        )}

        <div className="text-xs text-gray-500 border-t border-white/10 pt-3">
          <p>Last updated: {settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : 'Never'}</p>
          <p>Authorized admin: akintadeseun816@gmail.com</p>
          <p>Security: Protected by RLS policies</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumToggle;
