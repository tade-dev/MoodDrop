import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Home,
  Plus,
  Compass,
  Heart,
  User,
  Settings,
  Music,
} from "lucide-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import GoPremiumButton from './GoPremiumButton';

const AppSidebar = () => {
  const navigate = useNavigate();
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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-black/95 backdrop-blur-lg border-r border-white/10 w-80">
        <SheetHeader className="text-left">
          <SheetTitle className="text-white">Menu</SheetTitle>
          <SheetDescription className="text-gray-400">
            Navigate through MoodDrop
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <div className="px-4 mb-4">
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
          </div>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                className={`w-full justify-start font-normal ${location.pathname === item.url ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => navigate(item.url)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 bg-yellow-500 text-black rounded-md text-xs font-semibold">{item.badge}</span>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6 px-4">
          {!isPremium && (
            <GoPremiumButton />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AppSidebar;
