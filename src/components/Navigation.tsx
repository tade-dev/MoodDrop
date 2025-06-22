
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 px-4 py-2 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className={`flex flex-col items-center space-y-1 px-3 py-2 ${
            isActive('/') ? 'text-purple-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Home</span>
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => navigate('/create')}
          className={`flex flex-col items-center space-y-1 px-3 py-2 ${
            isActive('/create') ? 'text-purple-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs">Create</span>
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center space-y-1 px-3 py-2 ${
            isActive('/profile') ? 'text-purple-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs">Profile</span>
        </Button>
        
        <Button
          variant="ghost"
          onClick={signOut}
          className="flex flex-col items-center space-y-1 px-3 py-2 text-gray-400 hover:text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs">Sign Out</span>
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
