import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, Search, User, LogOut, Music, Sparkles, Shield, Menu, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useIsMobile } from '@/hooks/use-mobile';
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
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PremiumBadge from './PremiumBadge';
import PremiumGlow from './PremiumGlow';
import GoPremiumButton from './GoPremiumButton';

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname === path;
  const isSuperAdmin = user?.email === 'akintadeseun816@gmail.com';

  const menuItems = [
    { title: 'Home', url: '/home', icon: Home },
    { title: 'Explore', url: '/explore', icon: Search },
    { title: 'Moods', url: '/moods', icon: Palette },
    { title: 'Create Drop', url: '/create', icon: Plus },
    { title: 'Profile', url: '/profile', icon: User },
  ];

  // Add Admin item for super admin
  if (isSuperAdmin) {
    menuItems.push({ title: 'Admin', url: '/admin', icon: Shield });
  }

  if (!user) return null;
  if (location.pathname === '/') return null;

  const NavigationItem = ({ item }: { item: typeof menuItems[0] }) => {
    const content = (
      <SidebarMenuButton
        onClick={() => navigate(item.url)}
        isActive={isActive(item.url)}
        className={`w-full justify-start space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
          isActive(item.url)
            ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white shadow-lg shadow-purple-500/20 border border-purple-400/50'
            : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
        }`}
      >
        <item.icon className={`w-5 h-5 ${
          isActive(item.url) ? 'text-purple-300' : 'group-hover:text-purple-400'
        } transition-colors ${
          item.title === 'Admin' ? 'text-yellow-400' : ''
        }`} />
        <span className="font-medium">{item.title}</span>
        {isActive(item.url) && (
          <Sparkles className="w-3 h-3 text-purple-300 ml-auto animate-pulse" />
        )}
      </SidebarMenuButton>
    );

    if (isMobile) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <>
      {/* Mobile trigger button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <SidebarTrigger className="bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10" />
        </div>
      )}
      
      <Sidebar 
        className="border-r border-white/10 bg-black/60 backdrop-blur-xl"
        collapsible="icon"
      >
        <SidebarHeader className={`${isMobile ? 'p-3' : 'p-6'}`}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Music className="w-8 h-8 text-purple-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            </div>
            {!isMobile && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  MoodDrop
                </h1>
                <p className="text-xs text-gray-400">Drop the vibe</p>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className={`${isMobile ? 'px-2' : 'px-4'}`}>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavigationItem item={item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Go Premium Button */}
          {!isPremium && !isMobile && (
            <div className="px-4 mt-6">
              <GoPremiumButton size="sm" className="w-full" />
            </div>
          )}
        </SidebarContent>

        <SidebarFooter className={`${isMobile ? 'p-2' : 'p-4'} border-t border-white/10`}>
          {!isMobile ? (
            <>
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm mb-3">
                {isPremium ? (
                  <PremiumGlow intensity="medium">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </PremiumGlow>
                ) : (
                  <Avatar className="w-10 h-10 ring-2 ring-purple-400/30">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.user_metadata?.username || user?.email?.split('@')[0]}
                    </p>
                    {isPremium && <PremiumBadge size="sm" />}
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-400">
                      {isPremium ? 'Premium Member' : 'Vibe Creator'}
                    </p>
                    {isSuperAdmin && (
                      <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-2 py-0.5 rounded-full font-bold">
                        ADMIN
                      </span>
                    )}
                  </div>
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
            </>
          ) : (
            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => navigate('/profile')}
                      variant="ghost"
                      size="sm"
                      className="w-full p-2 rounded-xl"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold">
                          {user?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={signOut}
                      variant="ghost"
                      size="sm"
                      className="w-full p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AppSidebar;
