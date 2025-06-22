
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PremiumToggle = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['global-settings'],
    queryFn: async () => {
      console.log('Fetching global settings...');
      const { data, error } = await supabase
        .from('global_settings')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching global settings:', error);
        throw error;
      }
      console.log('Global settings fetched:', data);
      return data;
    },
  });

  const updatePremiumMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      console.log('Updating premium setting to:', enabled);
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
    },
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: ['global-settings'] });
      toast({
        title: "Premium Settings Updated",
        description: `Premium features ${enabled ? 'enabled' : 'disabled'} globally.`,
      });
    },
    onError: (error) => {
      console.error('Premium toggle mutation error:', error);
      toast({
        title: "Error",
        description: `Failed to update premium settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleToggle = (checked: boolean) => {
    console.log('Toggle clicked, new value:', checked);
    updatePremiumMutation.mutate(checked);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
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
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Global Premium Toggle</h3>
            <p className="text-gray-400 text-sm">
              Enable or disable premium features across the entire platform
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
          <h4 className="text-white font-medium mb-2">Premium Features Include:</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Advanced mood filtering</li>
            <li>• Unlimited playlist creation</li>
            <li>• Priority drop visibility</li>
            <li>• Custom profile themes</li>
            <li>• Analytics dashboard</li>
          </ul>
        </div>

        {updatePremiumMutation.isPending && (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400 mr-2" />
            <span className="text-gray-400 text-sm">Updating settings...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PremiumToggle;
