
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, TrendingUp, Calendar } from 'lucide-react';

const SubscriptionsManagement = () => {
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_subscriptions');
      if (error) throw error;
      return data;
    },
  });

  const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active') || [];
  const totalRevenue = subscriptions?.reduce((total, sub) => {
    const amount = sub.plan === 'yearly' ? 15.99 : 1.99;
    return sub.status === 'active' ? total + amount : total;
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-white/10 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white/10 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-white/10 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Crown className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Subscription Management</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Active Subscribers</p>
                <p className="text-2xl font-bold text-white">{activeSubscriptions.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">£{totalRevenue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Total Subscriptions</p>
                <p className="text-2xl font-bold text-white">{subscriptions?.length || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card className="bg-black/40 backdrop-blur-lg border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Renews</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Started</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions?.map((subscription) => (
                  <tr key={subscription.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{subscription.username}</p>
                        <p className="text-gray-400 text-sm">{subscription.user_email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={subscription.plan === 'yearly' ? 'default' : 'secondary'}>
                        {subscription.plan === 'yearly' ? 'Yearly (£15.99)' : 'Monthly (£1.99)'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        subscription.status === 'active' ? 'default' :
                        subscription.status === 'canceled' ? 'destructive' : 'secondary'
                      }>
                        {subscription.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {subscription.current_period_end ? 
                        new Date(subscription.current_period_end).toLocaleDateString() : 
                        'N/A'
                      }
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {new Date(subscription.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!subscriptions || subscriptions.length === 0 && (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No subscriptions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionsManagement;
