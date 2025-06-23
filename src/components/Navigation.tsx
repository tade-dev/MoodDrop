
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, User, LogOut, Music } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Don't show navigation if user is not logged in
  if (!user) return null;

  // Don't show navigation on landing page
  if (location.pathname === '/') return null;

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto mobile-padding py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Music className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              MoodDrop
            </span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              onClick={() => navigate('/home')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-full transition-all duration-300 text-xs sm:text-sm ${
                isActive('/home') 
                  ? 'bg-purple-600/20 text-purple-400 shadow-lg shadow-purple-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/create')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-full transition-all duration-300 text-xs sm:text-sm ${
                isActive('/create') 
                  ? 'bg-purple-600/20 text-purple-400 shadow-lg shadow-purple-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Create</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-full transition-all duration-300 text-xs sm:text-sm ${
                isActive('/profile') 
                  ? 'bg-purple-600/20 text-purple-400 shadow-lg shadow-purple-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={signOut}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 text-xs sm:text-sm"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
