
import React from 'react';
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
} from "@/components/ui/sidebar"
import {
  Home,
  Plus,
  Compass,
  Heart,
  User,
  Music,
} from "lucide-react";
import { Link, useLocation } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import GoPremiumButton from './GoPremiumButton';

const AppSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isPremium } = useSubscription();

  const menuItems = [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "Create Drop",
      url: "/create",
      icon: Plus,
    },
    {
      title: "Explore",
      url: "/explore",
      icon: Compass,
    },
    {
      title: "Moods",
      url: "/moods",
      icon: Heart,
    },
    {
      title: "Playlists",
      url: "/playlists",
      icon: Music,
      badge: isPremium ? null : "Premium",
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ];

  return (
    <Sidebar className="bg-black/95 backdrop-blur-lg border-r border-white/10">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-purple-600 text-white">
              {user?.user_metadata?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-white">{user?.user_metadata?.username || 'User'}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className={`w-full justify-start font-normal ${location.pathname === item.url ? 'text-purple-400 bg-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                  >
                    <Link to={item.url} className="flex items-center w-full">
                      <item.icon className="w-4 h-4 mr-2" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 bg-yellow-500 text-black rounded-md text-xs font-semibold">{item.badge}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!isPremium && (
          <GoPremiumButton />
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
