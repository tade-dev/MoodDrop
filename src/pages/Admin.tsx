import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Music, Database, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserManagement from '@/components/admin/UserManagement';
import DropsManagement from '@/components/admin/DropsManagement';
import MoodsManagement from '@/components/admin/MoodsManagement';
import PremiumToggle from '@/components/admin/PremiumToggle';
import SubscriptionsManagement from '@/components/admin/SubscriptionsManagement';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (user.email !== 'akintadeseun816@gmail.com') {
      navigate('/home');
    }
  }, [user, navigate]);

  if (!user || user.email !== 'akintadeseun816@gmail.com') {
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-sm font-bold">
              SUPER ADMIN
            </span>
          </div>
          <p className="text-gray-400">
            Manage users, content, and platform settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-black/40 backdrop-blur-lg border border-white/10">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="drops" className="flex items-center space-x-2">
              <Music className="w-4 h-4" />
              <span>Drops</span>
            </TabsTrigger>
            <TabsTrigger value="moods" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Moods</span>
            </TabsTrigger>
            <TabsTrigger value="premium" className="flex items-center space-x-2">
              <Crown className="w-4 h-4" />
              <span>Premium</span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center space-x-2">
              <Crown className="w-4 h-4" />
              <span>Subscriptions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="drops">
            <DropsManagement />
          </TabsContent>

          <TabsContent value="moods">
            <MoodsManagement />
          </TabsContent>

          <TabsContent value="premium">
            <PremiumToggle />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
