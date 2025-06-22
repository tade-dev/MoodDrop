
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, Compass, User, LogOut, Music, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { title: 'Home', url: '/home', icon: Home },
    { title: 'Create Drop', url: '/create', icon: Plus },
    { title: 'Explore', url: '/explore', icon: Compass },
    { title: 'Profile', url: '/profile', icon: User },
  ];

  if (!user) return null;
  if (location.pathname === '/') return null;

  return (
    <Sidebar className="border-r border-white/10 bg-black/60 backdrop-blur-xl">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Music className="w-8 h-8 text-purple-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              MoodDrop
            </h1>
            <p className="text-xs text-gray-400">Drop the vibe</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={isActive(item.url)}
                    className={`w-full justify-start space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                      isActive(item.url)
                        ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white shadow-lg shadow-purple-500/20 border border-purple-400/50'
                        : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive(item.url) ? 'text-purple-300' : 'group-hover:text-purple-400'} transition-colors`} />
                    <span className="font-medium">{item.title}</span>
                    {isActive(item.url) && (
                      <Sparkles className="w-3 h-3 text-purple-300 ml-auto animate-pulse" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm mb-3">
          <Avatar className="w-10 h-10 ring-2 ring-purple-400/30">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.user_metadata?.username || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-400">Vibe Creator</p>
          </div>
        </div>
        
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start space-x-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
